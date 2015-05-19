// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var BaseTranspiler = require('./BaseTranspiler.js');
var util = require('util');

function ExpressionTranspiler(parent) {
	BaseTranspiler.call(this, parent);
	return this;
}

util.inherits(ExpressionTranspiler, BaseTranspiler);

ExpressionTranspiler.prototype.visitPrimary = function(ctx) {
	if(ctx.Identifier())
		return {
			"type": "Identifier",
			"name": ctx.Identifier().getText()
		};
	else if(ctx.literal())
		return this.visitChildren(ctx);
	else if(ctx.nonWildcardTypeArguments())
		return; // TODO
	else if(ctx.type())
		return {
			"type": "Identifier",
			"name": ctx.type().getText()
		};
	else if(ctx.getChild(0) === 'void')
		return; // TODO
	else if(ctx.getText() === 'super')
		return {
			"type": "Identifier",
			"name": "super_"
		};
	else
		return ctx.getText()
}

ExpressionTranspiler.prototype.visitExpression = function(ctx) {
	if(ctx.Identifier())
		return {
			"type": "MemberExpression",
			"computed": false,
			"object": this.visitExpression(ctx.expression()),
			"property": {
				"type": "Identifier",
				"name": ctx.Identifier().getText()
			}
		}
	else if(ctx.getChild(1) == '[' && ctx.getChild(3) == ']') {
		return;
	}
	else
		return this.visitChildren(ctx);
}


module.exports = ExpressionTranspiler;
