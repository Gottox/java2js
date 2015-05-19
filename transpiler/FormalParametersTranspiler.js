// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var BaseTranspiler = require('./BaseTranspiler.js');
var util = require('util');

function FormalParametersTranspiler(parent) {
	BaseTranspiler.call(this, parent);
	return this;
}

util.inherits(FormalParametersTranspiler, BaseTranspiler);

FormalParametersTranspiler.prototype.visitFormalParameter = function(ctx) {
	return {
		"type": "Identifier",
		"name": ctx.variableDeclaratorId().Identifier()
	}
}
FormalParametersTranspiler.prototype.visitLastFormalParameter = function(ctx) {
	this.vararg = ctx.variableDeclaratorId().Identifier();
	return this.visitFormalParameter();
}

module.exports = FormalParametersTranspiler;
