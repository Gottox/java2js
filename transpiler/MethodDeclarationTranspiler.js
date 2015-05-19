// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var BaseTranspiler = require('./BaseTranspiler.js');
var FormalParametersTranspiler = require('./FormalParametersTranspiler.js');
var BlockTranspiler = require('./BlockTranspiler.js');
var util = require('util');

function MethodDeclarationTranspiler(parent) {
	BaseTranspiler.call(this, parent);
	return this;
}

util.inherits(MethodDeclarationTranspiler, BaseTranspiler);

MethodDeclarationTranspiler.prototype.visitMethodDeclaration = function(ctx) {
	return {
		"type": "ExpressionStatement",
		"expression": {
			"type": "AssignmentExpression",
			"operator": "=",
			"left": {
				"type": "MemberExpression",
				"computed": false,
				"object": {
					"type": "ThisExpression"
				},
				"property": {
					"type": "Identifier",
					"name": ctx.Identifier().getText()
				}
			},
			"right": {
				"type": "FunctionExpression",
				"id": {
					"type": "Identifier",
					"name": ctx.Identifier().getText()
				},
				"params": this.visitWith(FormalParametersTranspiler, ctx.formalParameters()),
				"defaults": [],
				"body": this.visitWith(BlockTranspiler, ctx.methodBody().block()),
				"generator": false,
				"expression": false
			}
		}
	}
}

module.exports = MethodDeclarationTranspiler;
