/*
 * index.js
 * Copyright (C) 2015 tox <tox@rootkit>
 *
 * Distributed under terms of the MIT license.
 */

exports.BaseTranspiler = require('./BaseTranspiler.js');
exports.CompilationUnitTranspiler = require('./CompilationUnitTranspiler.js');
exports.ClassDeclarationTranspiler = require('./ClassDeclarationTranspiler.js');
exports.transpile = function(jtree, Transpiler) {
	var transpiler = new Transpiler(null);
	return {
		"type": "Program",
		"body": jtree.accept(transpiler)
	};
}
