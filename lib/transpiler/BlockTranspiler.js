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
		val = this.visitVariableInitializer(ctx.variableInitializer());
	return {
		"type": "VariableDeclarator",
		"id": {
			"type": "Identifier",
			"name": ctx.variableDeclaratorId().Identifier()
		},
		"init": val
	}
}

BlockTranspiler.prototype.visitVariableInitializer = function(ctx) {
	if(ctx.expression()) {
		return this.visitWith(ExpressionTranspiler, ctx.expression());
	}
	return {
		"type": "Identifier",
		"name": "ArrayInitTODO"
	}
}

BlockTranspiler.prototype.visitStatement = function(ctx) {
	if(!ctx)
		return null;
	else if(ctx.block())
		return this.visitWith(BlockTranspiler, ctx.block());
	else if(ctx.Identifier())
		return {
				"type": "LabeledStatement",
				"label": {
					"type": "Identifier",
					"name": ctx.Identifier().getText()
				},
				"body": this.visitStatement(ctx.statement()[0])
			};
	else if(ctx.statementExpression())
		return {
			"type": "ExpressionStatement",
			"expression": this.visitWith(ExpressionTranspiler, ctx)[0]
		}
	switch(ctx.getChild(0).getText()) {
	case "if":
		return {
			"type": "IfStatement",
			"test": this.visitWith(ExpressionTranspiler, ctx.parExpression().expression()),
			"consequent": this.visitStatement(ctx.statement()[0]),
			"alternate": this.visitStatement(ctx.statement()[1]),
		};
		/*return {
			"type": "ForStatement",
			"init": this.,
			"test": ,
			"update": ,
			"body": this.visitStatement(ctx.statement()[0])
		}*/
	case "do":
		return {
			"type": "DoWhileStatement",
			"body": this.visitStatement(ctx.statement()[0]),
			"test": this.visitWith(ExpressionTranspiler, ctx.parExpression().expression())
		};
	case "while":
		return {
			"type": "WhileStatement",
			"test": this.visitWith(ExpressionTranspiler, ctx.parExpression().expression()),
			"body": this.visitStatement(ctx.statement()[0])
		};
	case "for":
		if(ctx.forControl().enhancedForControl()) {
			return {
				type: "Identifier",
				name: "TODO"
			};
		}
		else {
			var forControl = ctx.forControl();
			return {
				"type": "ForStatement",
				"init": this.visitForInit(forControl.forInit()),
				"test": this.visitWith(ExpressionTranspiler, forControl.expression()),
				"update": this.visitForUpdate(forControl.forUpdate()),
				"body": this.visitStatement(ctx.statement()[0])
			};
		}
	case "break":
		return {
			"type": "BreakStatement",
			"label": null
		};
	case "continue":
		return {
			"type": "ContinueStatement",
			"label": null
		};
	case "try":
	case "switch":
	case "synchronized":
	case "return":
	case "throw":
		return {
			type: "Identifier",
			name: "TODO"
		};
	case ';':
		return {
			"type": "EmptyStatement"
		};
	}
}

BlockTranspiler.prototype.visitForInit = function(ctx) {
	if(!ctx)
		return null;
	if(ctx.localVariableDeclaration())
		return this.visitLocalVariableDeclaration(ctx.localVariableDeclaration());
	else
		return {
			"type": "SequenceExpression",
			"expressions": this.visitWith(ExpressionTranspiler, ctx)
		};
}

BlockTranspiler.prototype.visitForUpdate = function(ctx) {
	if(!ctx)
		return null;
	return {
		"type": "SequenceExpression",
		"expressions": this.visitWith(ExpressionTranspiler, ctx)
	};
}


module.exports = BlockTranspiler;
