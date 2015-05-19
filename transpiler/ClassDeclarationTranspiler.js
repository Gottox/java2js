// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var BaseTranspiler = require('./BaseTranspiler.js');
var ClassBodyTranspiler = require('./ClassBodyTranspiler.js');
var util = require('util');

function ClassDeclarationTranspiler(parent) {
	BaseTranspiler.call(this, parent);
	this.name = null;
	this.body = null;
	this.extends = null;
	return this;
}

util.inherits(ClassDeclarationTranspiler, BaseTranspiler);

ClassDeclarationTranspiler.prototype.visitClassDeclarationTranspiler = function(ctx) {
	return this.visitChildren(ctx);
}

ClassDeclarationTranspiler.prototype._findType = function(type, name) {
	if(name === this.name)
		return this;
}

module.exports = ClassDeclarationTranspiler;
