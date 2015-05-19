var antlr4 = require("antlr4");
var JavaParser = require("./grammars/java/JavaParser.js").JavaParser;
var JavaLexer = require("./grammars/java/JavaLexer.js").JavaLexer;
var java2js = require("./transpiler");
var escodegen = require('escodegen');

module.exports.input =
"/*\n" + 
" * HelloWorld.java\n" + 
" */\n" + 
"package foo.bar.baz;\n" + 
"import static foo.bar.baz;\n" + 
"public class HelloWorld\n" + 
"{\n" + 
"	public HelloWorld() {\n" + 
"		System.out.println(\"Hello World\");\n" + 
"	}\n" + 
"}\n" + 
"\n"

module.exports.compile = function(input) {
	var chars = new antlr4.InputStream(input);
	var lexer = new JavaLexer(chars);
	var tokens  = new antlr4.CommonTokenStream(lexer);
	var parser = new JavaParser(tokens);
	parser.buildParseTrees = true;
	var jtree = parser.compilationUnit();

	var jstree = java2js.transpile(jtree, java2js.CompilationUnitTranspiler)
	return escodegen.generate(jstree);
}
