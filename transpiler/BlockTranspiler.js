// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var BaseTranspiler = require('./BaseTranspiler.js');
var ExpressionTranspiler = require('./ExpressionTranspiler.js');
var util = require('util');

function BlockTranspiler(parent) {
	BaseTranspiler.call(this, parent);
	return this;
}

util.inherits(BlockTranspiler, BaseTranspiler);

BlockTranspiler.prototype.visitBlock = function(ctx) {
	return {
		"type": "BlockStatement",
		"body": this.visitChildren(ctx)
	}
}

BlockTranspiler.prototype.visitLocalVariableDeclaration = function(ctx) {
	return {
		"type": "VariableDeclaration",
		"declarations": this.visitChildren(ctx),
		"kind": "var"
	}
}
BlockTranspiler.prototype.visitVariableDeclarator = function(ctx) {
	var val = null;
	if(ctx.variableInitializer())
		val = this.visitChildren(ctx.variableInitializer())[0] || null;
	return {
		"type": "VariableDeclarator",
		"id": {
			"type": "Identifier",
			"name": ctx.variableDeclaratorId().Identifier()
		},
		"init": val
	}
}

BlockTranspiler.prototype.visitStatement = function(ctx) {
	if(ctx.block())
		return this.visitWith(BlockTranspiler, ctx.block());
	else if(ctx.Identifier())
		return; // TODO: marks
	else if(ctx.statementExpression())
		return {
			"type": "ExpressionStatement",
			"expression": this.visitWith(ExpressionTranspiler, ctx)
		}
	switch(ctx.getChild(0).getText()) {
	case "if":
		return;
	}
}

module.exports = BlockTranspiler;
