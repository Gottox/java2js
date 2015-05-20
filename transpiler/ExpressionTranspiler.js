
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
		return this.visitLiteral(ctx.literal());
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
	console.log(ctx.expression(), ctx.Identifier());
	//return this.visitChildren(ctx);
	if(ctx.Identifier())
		return {
			"type": "MemberExpression",
			"computed": false,
			"object": this.visitExpression(ctx.expression()[0]),
			"property": {
				"type": "Identifier",
				"name": ctx.Identifier().getText()
			}
		}
	else if(ctx.getChild(1) == '[' && ctx.getChild(3) == ']') {
		return;
	}
	else if(ctx.getChild(1) == '(' && ctx.getChild(3) == ')') {
		return {
			"type": "CallExpression",
			"callee": this.visitExpression(ctx.expression()[0]),
			"arguments": []//this.visitChildren(ctx.expressionList())
		};
	}
	else
		return this.visitChildren(ctx);
}


module.exports = ExpressionTranspiler;
