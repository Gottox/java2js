// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var BaseTranspiler = require('./BaseTranspiler.js');
var ClassDeclarationTranspiler = require('./ClassDeclarationTranspiler.js');
var util = require('util');

function ClassBodyTranspiler(parent) {
	BaseTranspiler.call(this, parent);
	this.package = null;
	this.imports = [];
	this.staticImports = [];
	return this;
}

util.inherits(ClassBodyTranspiler, BaseTranspiler);

ClassBodyTranspiler.prototype.visitClassDeclaration = function(ctx) {
	return this.visitWith(ClassDeclarationTranspiler, ctx);
}

module.exports = ClassBodyTranspiler;
