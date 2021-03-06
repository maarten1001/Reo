package nl.cwi.pr.tools.comp;

import java.util.Map;

import nl.cwi.pr.tools.CompiledGeneratee;
import nl.cwi.pr.tools.CompilerProgressMonitor;
import nl.cwi.pr.tools.InterpretedGeneratee;

public abstract class GenerateeCompiler<C extends ProgramCompiler, G extends InterpretedGeneratee>
		extends Compiler<CompiledGeneratee> {

	private final C parent;
	private final G generatee;

	//
	// CONSTRUCTORS
	//

	public GenerateeCompiler(C parent, G generatee) {
		super(parent);

		if (generatee == null)
			throw new NullPointerException();

		this.parent = parent;
		this.generatee = generatee;
	}

	//
	// METHODS - PUBLIC
	//

	@Override
	public CompiledGeneratee compile() {


		return new CompiledGeneratee(generateFiles());
	}

	public G getGeneratee() {
		return generatee;
	}

	public C getParent() {
		return parent;
	}

	//
	// METHODS - PROTECTED
	//

	protected abstract Map<String, String> generateFiles();
}