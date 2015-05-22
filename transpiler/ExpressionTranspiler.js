
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
		value: eval(ctx.getText())
	};
	if(ctx.StringLiteral()) {
		result = {
			"type": "NewExpression",
			"callee": {
				"type": "MemberExpression",
				"computed": false,
				"object": {
					"type": "MemberExpression",
					"computed": false,
					"object": {
						"type": "Identifier",
						"name": "java"
					},
					"property": {
						"type": "Identifier",
						"name": "lang"
					}
				},
				"property": {
					"type": "Identifier",
					"name": "String"
				}
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
	var operator, type;
	if(ctx.primary())
		return this.visitPrimary(ctx);
	var subexpressions = ctx.expression();
	switch(this.expressionType(ctx)) {
	case 'Binary':
		operator = ctx.getChild(1).getText();
		if(operator == '==' && operator == '!=') {
			type = 'BinaryExpression';
			operator += '=';
		}
		else if(operator == '<=' && operator == '>=')
			type = 'BinaryExpression';
		else if(operator[operator.length-1] === '=')
			type = 'AssignmentExpression';
		else
			type = 'BinaryExpression';
		return {
			"type": type,
			"operator": operator,
			"left": this.visitExpression(subexpressions[0]),
			"right": this.visitExpression(subexpressions[1])
		};
	case 'Array':
		return {
			"type": "MemberExpression",
			"computed": true,
			"object": this.visitExpression(subexpressions[0]),
			"property": this.visitExpression(subexpressions[1])
		};
	case 'Ternary':
		return {
			"type": "ConditionalExpression",
			"test": this.visitExpression(subexpressions[0]),
			"consequent": this.visitExpression(subexpressions[1]),
			"alternate": this.visitExpression(subexpressions[2]),
		};
	case 'Call':
		return {
			"type": "CallExpression",
			"callee": this.visitExpression(subexpressions[0]),
			"arguments": this.visitExpressionList(ctx.expressionList())
		};
	case 'Member':
		return {
			"type": "MemberExpression",
			"computed": false,
			"object": this.visitExpression(subexpressions[0]),
			"property": this.visitIdentifier(ctx.Identifier())
		};
	case 'Prefixed':
		operator = ctx.getChild(0).getText();
		type = operator === '++' || operator === '--'
				? "UpdateExpression" : "UnaryExpression";
		return {
			"type": type,
			"operator": operator,
			"argument": this.visitExpression(subexpressions[0]),
			"prefix": true
		}
	case 'Suffixed':
		return {
			"type": "UpdateExpression",
			"operator": ctx.getChild(1).getText(),
			"argument": this.visitExpression(subexpressions[0]),
			"prefix": false
		}
	case 'New':
		return {
			"type": "NewExpression",
			"callee": {
				"type": "Identifier",
				"name": "TODO"
			},
			"arguments": []
		};
	}
	throw new Error("Unhandled expression of type "+ this.expressionType(ctx) +": " + ctx.getText())
}

ExpressionTranspiler.prototype.visitExpressionList = function(ctx) {
	if(ctx === null)
		return [];
	var i, expressions = ctx.expression();
	var result = [];
	for(var i = 0; i < expressions.length; i++) {
		if(expressions[i])
			result.push(this.visitExpression(expressions[i]));
	}
	return result;
}

ExpressionTranspiler.prototype.expressionType = function(ctx) {
	var operator, operand;
	var childCount = ctx.getChildCount();
	if(childCount >= 3 && ctx.getChild(1).getText() === '(')
		return 'Call';
	switch(ctx.getChildCount()) {
	case 2:
		if(ctx.getChild(0).getText() === 'new')
			return 'New';
		else if(ctx.getChild(0) === ctx.expression()[0])
			return 'Suffixed';
		else if(ctx.getChild(1) === ctx.expression()[0])
			return 'Prefixed'
	case 3:
		operator = ctx.getChild(1).getText();
		// foo [operator] bar
		if(operator !== '.')
			return 'Binary'
		// foo . bar
		// TODO: there are edge cases where further transformation is needed.
		else
			return 'Member';
	case 4:
		operator = ctx.getChild(1).getText();
		switch(operator) {
		case '[':
			return 'Array';
		default:
			if(ctx.getChild(0) === '(')
				return 'Cast';
		}
	case 5:
		operator = ctx.getChild(1).getText();
		if(operator === '?')
			return 'Ternary';
	}
	throw new Error("Unknown expression " + ctx.getText());
}


module.exports = ExpressionTranspiler;
