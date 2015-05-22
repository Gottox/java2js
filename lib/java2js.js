/*
 * index.js
 * Copyright (C) 2015 tox <tox@rootkit>
 *
 * Distributed under terms of the MIT license.
 */

exports.BaseTranspiler = require('./transpiler/BaseTranspiler.js');
exports.CompilationUnitTranspiler = require('./transpiler/CompilationUnitTranspiler.js');
exports.ClassDeclarationTranspiler = require('./transpiler/ClassDeclarationTranspiler.js');



// deprecated
exports.transpile = function(jtree, Transpiler) {
	var transpiler = new Transpiler(null);
	return {
		"type": "Program",
		"body": jtree.accept(transpiler)
	};
}
