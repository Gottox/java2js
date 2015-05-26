// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var BaseTranspiler = require('./BaseTranspiler.js');
var FormalParametersTranspiler = require('./FormalParametersTranspiler.js');
var BlockTranspiler = require('./BlockTranspiler.js');
var util = require('util');

function ConstructorDeclarationTranspiler(parent) {
	BaseTranspiler.call(this, parent);
	return this;
}

util.inherits(ConstructorDeclarationTranspiler, BaseTranspiler);

ConstructorDeclarationTranspiler.prototype.visitConstructorDeclaration = function(ctx) {
	this.parent.parent.params = this.visitWith(FormalParametersTranspiler, ctx.formalParameters());
	this.parent.parent.constructor =  this.visitWith(BlockTranspiler, ctx.constructorBody().block());
}

module.exports = ConstructorDeclarationTranspiler;
