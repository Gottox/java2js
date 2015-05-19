var antlr4 = require("antlr4");
var fs = require('fs');
var JavaParser = require("./grammars/java/JavaParser.js").JavaParser;
var JavaLexer = require("./grammars/java/JavaLexer.js").JavaLexer;
var java2js = require("./transpiler");
var escodegen = require('escodegen');

module.exports.input = fs.readFileSync("HelloWorld.java");

module.exports.compile = function(input) {
	var chars = new antlr4.InputStream(input);
	var lexer = new JavaLexer(chars);
	var tokens  = new antlr4.CommonTokenStream(lexer);
	var parser = new JavaParser(tokens);
	parser.buildParseTrees = true;
	var jtree = parser.compilationUnit();
	console.log(jtree);

	var jstree = java2js.transpile(jtree, java2js.CompilationUnitTranspiler)
	console.log(jstree);
	return escodegen.generate(jstree);
}