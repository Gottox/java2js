// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var BaseTranspiler = require('./BaseTranspiler.js');
var VariableInitializerTranspiler = require('./VariableInitializerTranspiler.js');
var util = require('util');

function FieldDeclarationTranspiler(parent) {
	BaseTranspiler.call(this, parent);
	return this;
}

util.inherits(FieldDeclarationTranspiler, BaseTranspiler);

FieldDeclarationTranspiler.prototype.visitVariableDeclarator = function(ctx) {
	// TODO: this.addSymbol('field', ));
	var val;
	if(ctx.variableInitializer())
		val = this.visitWith(VariableInitializerTranspiler, ctx.variableInitializer())[0];
	else
		val = {
			"type": "Literal",
			"value": null,
		}
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
					"name": ctx.variableDeclaratorId().Identifier().getText()
				}
			},
			"right": val
		}
	};
}

module.exports = FieldDeclarationTranspiler;
