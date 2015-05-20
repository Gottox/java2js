
var BaseTranspiler = require('./BaseTranspiler.js');
var util = require('util');

function ExpressionTranspiler(parent) {
	BaseTranspiler.call(this, parent);
	return this;
}

util.inherits(ExpressionTranspiler, BaseTranspiler);

BaseTranspiler.prototype.visitLiteral = function(ctx) {
	// BUG: We assume, that Java and Javascript have the same literals.
	// This is potentional unsafe.
	var result = {
		type: 'Literal',
		value: eval(ctx.getText()),
		raw: ctx.getText()
	};
	if(ctx.StringLiteral()) {
		result = {
				"type": "CallExpression",
				"callee": {
					"type": "Identifier",
					"name": "j$"
				},
				"arguments": [
					result
				]
		};
	}
	return result;
}

BaseTranspiler.prototype.visitIdentifier = function(ctx) {
	return {
		"type": "Identifier",
		"name": ctx.getText()
	};
}

ExpressionTranspiler.prototype.visitPrimary = function(ctx) {
	if(ctx.Identifier())
		return this.visitIdentifier(ctx.Identifier());
	switch(ctx.getText()) {
	case 'this':
		return {
			"type": "ThisExpression"
		};
	case 'super':
		return {
			"type": "MemberExpression",
			"computed": false,
			"object": {
				"type": "ThisExpression"
			},
			"property": {
				"type": "Identifier",
				"name": "super_"
			}
		};
	default:
		return this.visitChildren(ctx)[0];
	}
}

ExpressionTranspiler.prototype.visitExpression = function(ctx) {
	if(ctx.primary())
		return this.visitPrimary(ctx);
	if(ctx.getChild(1).getText() === '.') {
		if(ctx.Identifier())
			return {
					"type": "MemberExpression",
					"computed": false,
					"object": this.visitExpression(ctx.expression()[0]),
					"property": {
						"type": "Identifier",
						"name": ctx.Identifier().getText()
					}
				};
		else if(ctx.getChild(2).getText() === 'new')
			return; // TODO
		else if(ctx.getChild(2).getText() === 'super')
			return this.visitChildren(ctx.superSuffix())
	}
	else if(ctx.getChild(1).getText() === '(')
		return {
			"type": "CallExpression",
			"callee": this.visitExpression(ctx.expression()[0]),
			"arguments": this.visitChildren(ctx.expressionList())
		}
	else if(ctx.getChild(1).getText() === '[')
			return {
				"type": "MemberExpression",
				"computed": true,
				"object": this.visitExpression(ctx.expression()[0]),
				"property": this.visitExpression(ctx.expression()[1]),
			};
	else
		return this.visitChildren(ctx)[0];
}


module.exports = ExpressionTranspiler;
