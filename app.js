var antlr4 = require("antlr4");
var JavaParser = require("./grammars/java/JavaParser.js").JavaParser;
var JavaLexer = require("./grammars/java/JavaLexer.js").JavaLexer;
var Transpiler = require("./transpiler.js").Transpiler;

module.exports.input =
"/*\n" + 
" * HelloWorld.java\n" + 
" */\n" + 
"\n" + 
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
	var tree = parser.compilationUnit();

	var walker = new antlr4.tree.ParseTreeWalker();
	var listener = new Transpiler();
	walker.walk(listener, tree);

}
