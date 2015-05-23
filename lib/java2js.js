/*
 * index.js
 * Copyright (C) 2015 tox <tox@rootkit>
 *
 * Distributed under terms of the MIT license.
 */
var antlr4 = require("antlr4");

var JavaParser = require("../lib/grammar/JavaParser.js").JavaParser;
var JavaLexer = require("../lib/grammar/JavaLexer.js").JavaLexer;
var java2js = require("../lib/java2js.js");
var escodegen = require('escodegen');

var CompilationUnitTranspiler = require('./transpiler/CompilationUnitTranspiler.js');



// deprecated
exports.transpile = function(jtree, Transpiler) {
	var transpiler = new CompilationUnitTranspiler(null);
	return {
		"type": "Program",
		"body": jtree.accept(transpiler)
	};
};

exports.parse = function(jsrc, errorHandler) {
	var chars = new antlr4.InputStream(jsrc);
	var lexer = new JavaLexer(chars);
	var tokens  = new antlr4.CommonTokenStream(lexer);
	var parser = new JavaParser(tokens);
	if(errorHandler)
		parser._listeners = [ errorHandler ];
	parser.buildParseTrees = true;
	var jtree = parser.compilationUnit();

	return jtree;
}

exports.genCode = function(jstree) {
	return escodegen.generate(jstree);
}
