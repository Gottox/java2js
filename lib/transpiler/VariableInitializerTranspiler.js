// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var BaseTranspiler = require('./BaseTranspiler.js');
var ExpressionTranspiler = require('./ExpressionTranspiler.js');
var util = require('util');

function VariableInitializerTranspiler(parent) {
	BaseTranspiler.call(this, parent);
	return this;
}

util.inherits(VariableInitializerTranspiler, BaseTranspiler);

VariableInitializerTranspiler.prototype.visitExpression = function(ctx) {
	return this.visitWith(ExpressionTranspiler, ctx);
}

VariableInitializerTranspiler.prototype.visitArrayInitializer = function(ctx) {
	return {
		"type": "ArrayExpression",
		"elements": this.visitChildren(ctx)
	}
}

module.exports = VariableInitializerTranspiler;
