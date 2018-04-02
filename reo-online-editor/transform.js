(function() {

  var canvas = this.__canvas = new fabric.Canvas('c', { selection: false });

  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

  fabric.Object.prototype.objectCaching = false;
  var active, isDown, origX, origY, origLeft, origTop;
  var mode = 'select';
  var id = '0';
  var nodes = [];
  
  // drawing parameters
  
  nodeFillColourSource = '#fff';
  nodeFillColourDrain  = '#fff';
  nodeFillColourMixed  = '#000';
  nodeFactor           =      4;
  
  lineFillColour       = '#000';
  lineStrokeColour     = '#000';
  lineStrokeWidth      =      1;
  
  arrowFactor          =      8;
  arrowOffsetOut       = lineStrokeWidth * nodeFactor + 4;
  arrowOffsetIn        = arrowOffsetOut + arrowFactor;
  
  fifoHeight           =     30;
  fifoWidth            =     10;
  fifoFillColour       = '#fff';
  
  buttonBorderOff      = '2px solid white';
  buttonBorderOn       = '2px solid black';
  
  document.getElementById("select").onclick = function() {
    document.getElementById(mode).style.border = buttonBorderOff;
    mode = 'select';
    this.style.border = buttonBorderOn;
    canvas.forEachObject(function(obj) {
      if (obj.class === 'component') {
        obj.set({'selectable': true});
      }
    });
  };
  
  document.getElementById("component").onclick = function() {
    document.getElementById(mode).style.border = buttonBorderOff;
    mode = 'component';
    this.style.border = buttonBorderOn;
    canvas.forEachObject(function(obj) {
      if (obj.class === 'component') {
        obj.set({'selectable': false});
      }
    });
  };
  
  document.getElementById("sync").onclick = function() {
    document.getElementById(mode).style.border = buttonBorderOff;
    mode = 'sync';
    this.style.border = buttonBorderOn;
    canvas.forEachObject(function(obj) {
      if (obj.class === 'component') {
        obj.set({'selectable': false});
      }
    });
  };
  
  document.getElementById("lossysync").onclick = function() {
    document.getElementById(mode).style.border = buttonBorderOff;
    mode = 'lossysync';
    this.style.border = buttonBorderOn;
    canvas.forEachObject(function(obj) {
      if (obj.class === 'component') {
        obj.set({'selectable': false});
      }
    });
  };
  
  document.getElementById("syncdrain").onclick = function() {
    document.getElementById(mode).style.border = buttonBorderOff;
    mode = 'syncdrain';
    this.style.border = buttonBorderOn;
    canvas.forEachObject(function(obj) {
      if (obj.class === 'component') {
        obj.set({'selectable': false});
      }
    });
  };
  
  document.getElementById("syncspout").onclick = function() {
    document.getElementById(mode).style.border = buttonBorderOff;
    mode = 'syncspout';
    this.style.border = buttonBorderOn;
    canvas.forEachObject(function(obj) {
      if (obj.class === 'component') {
        obj.set({'selectable': false});
      }
    });
  };
  
  document.getElementById("fifo1").onclick = function() {
    document.getElementById(mode).style.border = buttonBorderOff;
    mode = 'fifo1';
    this.style.border = buttonBorderOn;
    canvas.forEachObject(function(obj) {
      if (obj.class === 'component') {
        obj.set({'selectable': false});
      }
    });
  };
  
  document.getElementById("downloadsvg").onclick = function () {
    var a = document.getElementById("download");
    a.download = "reo.svg";
    a.href = 'data:image/svg+xml;base64,' + window.btoa(canvas.toSVG());
    a.click();
  };
  
  document.getElementById("downloadpng").onclick = function () {
    var a = document.getElementById("download");
    a.download = "reo.png";
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  
  // generate a new object ID
  // ID will only contain letters, e.g. z is followed by aa
  function generateId() {
    id = ((parseInt(id, 36)+1).toString(36)).replace(/[0-9]/g,'a');
    return id;
  }

  function createNode(left, top) {
    var node = new fabric.Circle({
      left: left,
      top: top,
      angle: 90,
      strokeWidth: lineStrokeWidth,
      fill: nodeFillColourSource,
      radius: nodeFactor * lineStrokeWidth,
      stroke: lineStrokeColour,
      hasControls: false,
      selectable: true,
      class: 'node',
      id: generateId()
    });

    // these are the channels that are connected to this node
    node.channels = [];
    
    var label = new fabric.IText(node.id, {
      left: left + 20,
      top: top - 20,
      fontSize: 20,
      object: node,
      class: 'label',
      hasControls: false
      //visible: false
    });
    
    node.set({'label': label, 'labelOffsetX': 20, 'labelOffsetY': -20});
    
    label.on('editing:exited', function(e) {
      label.object.set({id: label.text});
    });
    
    nodes.push(node);
    
    return node;

  } //createNode
  
  function createAnchor(left, top) {
    var anchor = new fabric.Circle({
      left: left,
      top: top,
      strokeWidth: lineStrokeWidth,
      radius: nodeFactor * lineStrokeWidth,
      stroke: lineStrokeColour,
      hasControls: false,
      class: 'anchor',
      opacity: 0
    });
    return anchor;

  } //createAnchor
  
  function createChannel(name, x1, y1, x2, y2) {
    // create a channel...
    var channel = {
      class: 'channel',
      components: [] 
    };
    
    var diffX = Math.abs(x1-x2);
    var diffY = Math.abs(y1-y2);
    
    // ...a reference rectangle...
    channel.components[0] = new fabric.Rect({
      width: 5,
      height: 100,
      baseLength: 100,
      left: Math.min(x1,x2) + diffX / 2,
      top: Math.min(y1,y2) + diffY / 2,
      angle: 90,
      fill: 'red',
      visible: false,
      selectable: false,
      originX: 'center',
      originY: 'center',
    });
    
    // ...two nodes...
    channel.node1 = createNode(x1,y1);
    channel.node2 = createNode(x2,y2);
    
    // ...and two anchors
    // TODO
    channel.anchor1 = createAnchor(133,100);
    channel.anchor2 = createAnchor(167,100);
    
    // link the channel to the nodes
    channel.node1.channels.push(channel);
    channel.node2.channels.push(channel);
    
    // currently loaded from a separate file
    // TODO: replace with a database search
    switch(name) {
      case 'sync':
        createSync(channel,x1,y1,x2,y2);
        break;
      case 'lossysync':
        createLossySync(channel,x1,y1,x2,y2);
        break;
      case 'syncdrain':
        createSyncDrain(channel,x1,y1,x2,y2);
        break;
      case 'syncspout':
        createSyncSpout(channel,x1,y1,x2,y2);
        break;
      case 'fifo1':
        createFIFO1(channel,x1,y1,x2,y2);
        break;
      default:
        console.log("Invalid channel name");
        return;
        break;
    }
    
    canvas.add(channel.components[0]);
    for (i = 1; i < channel.components.length; i++) {
      var o = channel.components[i];
      var bossTransform = channel.components[0].calcTransformMatrix();
      var invertedBossTransform = fabric.util.invertTransform(bossTransform);
      var desiredTransform = fabric.util.multiplyTransformMatrices(invertedBossTransform, channel.components[i].calcTransformMatrix());
      o.relationship = desiredTransform;
      canvas.add(channel.components[i]);
    }
    canvas.add(channel.node1, channel.node2, channel.node1.label, channel.node2.label, channel.anchor1, channel.anchor2);
    //updateChannel(channel);
    
    return channel;
  } //createChannel
  
  function calculateAngle(channel, baseAngle) {
    var angle = 0;
    var x = (channel.node2.get('left') - channel.node1.get('left'));
    var y = (channel.node2.get('top')  - channel.node1.get('top'));

    if (x === 0) {
      angle = (y === 0) ? 0 : (y > 0) ? Math.PI / 2 : Math.PI * 3 / 2;
    } else if (y === 0) {
      angle = (x > 0) ? 0 : Math.PI;
    } else {
      angle = (x < 0) ? Math.atan(y / x) + Math.PI : (y < 0) ? Math.atan(y / x) + (2 * Math.PI) : Math.atan(y / x);
    }
    
    return ((angle * 180 / Math.PI) + baseAngle) % 360;
  } //calculateAngle
  
  function updateChannel(channel) {
    var x1 = channel.node1.get('left');
    var y1 = channel.node1.get('top');
    var x2 = channel.node2.get('left');
    var y2 = channel.node2.get('top');
    var diffX = Math.abs(x1-x2);
    var diffY = Math.abs(y1-y2);
    
    // update the reference rectangle
    channel.components[0].set({'left': Math.min(x1,x2) + diffX / 2});
    channel.components[0].set({'top': Math.min(y1,y2) + diffY / 2});
    channel.components[0].set({'angle': calculateAngle(channel, 90)});
    
    // convert new size to scaling
    var length = Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2));
    var scale = length/channel.components[0].baseLength;
    channel.components[0].set({'scaleX': scale, 'scaleY': scale});
    
    channel.components[0].setCoords();
    
    // update all channel components
    for (k = 1; k < channel.components.length; k++) {
      var o = channel.components[k];
      if (o.type == 'line') {
        o.set({'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2});
      }
      else {
        if (!o.relationship) {
          console.log("No relationship found");
          return;
        }
        var relationship = o.relationship;
        var newTransform = fabric.util.multiplyTransformMatrices(channel.components[0].calcTransformMatrix(), relationship);
        opt = fabric.util.qrDecompose(newTransform);
        o.set({
          flipX: false,
          flipY: false,
        });
        o.setPositionByOrigin(
          { x: opt.translateX, y: opt.translateY },
          'center',
          'center',
        );
        o.set(opt);
        if (o.scale == false)
          o.set({'scaleX': 1, 'scaleY': 1});
        if (o.rotate == false)
          o.set({'angle': o.baseAngle});
        if (o.referencePoint == 'node1') {
          o.set({
            'left': o.referenceDistance * Math.cos((channel.components[0].angle + o.referenceAngle + 180) * Math.PI / 180) + channel.node1.left,
            'top': o.referenceDistance * Math.sin((channel.components[0].angle + o.referenceAngle + 180) * Math.PI / 180) + channel.node1.top
          });
        }
        if (o.referencePoint == 'node2') {
          o.set({
            'left': o.referenceDistance * Math.cos((channel.components[0].angle + o.referenceAngle + 180) * Math.PI / 180) + channel.node2.left,
            'top': o.referenceDistance * Math.sin((channel.components[0].angle + o.referenceAngle + 180) * Math.PI / 180) + channel.node2.top
          });
        }
      }
      o.setCoords();
    }
    canvas.renderAll();
  } //updateChannel

  canvas.on('object:moving', function(e) {
    e.target.setCoords();
  }); //object:moving
  
  canvas.on('mouse:over', function(e) {
    if (e.target && e.target.class == "anchor")
    {
      e.target.set('opacity', '100');
      canvas.renderAll();
    }
  }); //mouse:over
  
  canvas.on('mouse:out', function(e) {
    if (e.target && e.target.class == "anchor")
    {
      e.target.set('opacity', '0');
      canvas.renderAll();
    }
  }); //mouse:out
  
  canvas.on('mouse:down', function(e) {
    isDown = true;
    var pointer = canvas.getPointer(e.e);
    origX = pointer.x;
    origY = pointer.y;
    var p = canvas.getActiveObject();
    if (p && mode != 'select') {
      origLeft = p.left;
      origTop = p.top;
      return;
    }
    if (mode == 'select') {
      //console.log('Mode is select');
    }
    if (mode == 'sync' || mode == 'lossysync' || mode == 'syncdrain' || mode == 'syncspout' || mode == 'fifo1') {
      canvas.discardActiveObject();
      var channel = createChannel(mode,pointer.x,pointer.y,pointer.x,pointer.y);
      canvas.setActiveObject(channel.node2);
    }
  }); //mouse:down
  
  canvas.on('mouse:move', function(e){
    if (!isDown)
      return;
    var p = canvas.getActiveObject();
    if (!p)
      return;
    var pointer = canvas.getPointer(e.e);
    if (p.class == 'node') {
      p.set({'left': pointer.x, 'top': pointer.y});
      p.setCoords();
      canvas.forEachObject(function(obj) {
        if (obj !== p && p.intersectsWithObject(obj)) {
          if (obj.class === 'node') {
            if (Math.abs(p.left-obj.left) < 10 && Math.abs(p.top-obj.top) < 10) {
              p.set({'left': obj.left, 'top': obj.top});
              p.setCoords();
            }
          }
        }
      });
      
      for (i = 0; i < p.channels.length; i++)
        updateChannel(p.channels[i]);

      p.label.set({left: p.left + p.labelOffsetX});
      p.label.set({top: p.top + p.labelOffsetY});
      p.label.setCoords();
    }
    if (p.class == 'group') {
      p.set({left: origLeft + pointer.x - origX});
      p.set({top: origTop + pointer.y - origY});
      p.setCoords();
      p.label.set({left: p.left + p.labelOffsetX});
      p.label.set({top: p.top + p.labelOffsetY});
      p.label.setCoords();
    }
    canvas.renderAll();
  }); //mouse:move
  
  canvas.on('mouse:up', function(e){
    isDown = false;
    var p = canvas.getActiveObject();
    if (p) {
      p.setCoords();
      if (p.class == 'node') {
        p.label.setCoords();
        p.set({labelOffsetX: p.label.left - p.left, labelOffsetY: p.label.top - p.top});
        
        for (i = nodes.length - 1; i >= 0; i--) {
          if (nodes[i].id == p.id)
            continue;
          if (p.intersectsWithObject(nodes[i])) {
            if(Math.abs(p.left-nodes[i].left) < 10 && Math.abs(p.top-nodes[i].top) < 10) {
              for (j = 0; j < nodes[i].channels.length; j++) {
                if (nodes[i].channels[j].node1.id == nodes[i].id) {
                  nodes[i].channels[j].node1 = p;
                }
                else {
                  if (nodes[i].channels[j].node2.id == nodes[i].id)
                    nodes[i].channels[j].node2 = p;
                  else
                    console.log("Error merging nodes");
                }
                p.channels.push(nodes[i].channels[j]);
              }
              canvas.remove(nodes[i].label, nodes[i]);
              nodes.splice(i,1);
              p.bringToFront();
            }
          }
        }
        canvas.renderAll();
        canvas.calcOffset();
      }
      if (p.class == 'label') {
        p.setCoords();
        p.object.set({'labelOffsetX': p.left - p.object.left, 'labelOffsetY': p.top - p.object.top});    
      }
      else
        canvas.discardActiveObject();
      canvas.renderAll();
    }
  }); //mouse:up
  
  id = '0';
  document.getElementById("select").click();
  createChannel('sync',100,100,200,100);
  createChannel('lossysync',100,200,200,200);
  createChannel('syncdrain',100,300,200,300);
  createChannel('syncspout',100,400,200,400);
  createChannel('fifo1',100,500,200,500);
})();