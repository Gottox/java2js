// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var BaseTranspiler = require('./BaseTranspiler.js');
var ClassBodyPassiveTranspiler = require('./ClassBodyPassiveTranspiler.js');
var ClassBodyTranspiler = require('./ClassBodyTranspiler.js');
var util = require('util');

function ClassDeclarationTranspiler(parent) {
	BaseTranspiler.call(this, parent);
	this.name = null;
	this.params = [];
	this.body = [];
	this.constructor = [];
	this.extends = null;
	return this;
}

util.inherits(ClassDeclarationTranspiler, BaseTranspiler);

ClassDeclarationTranspiler.prototype.visitClassDeclaration = function(ctx) {
	this.name = ctx.Identifier().getText();
	// Fills Symbols
	this.visitWith(ClassBodyPassiveTranspiler, ctx.classBody());
	var body = this.visitWith(ClassBodyTranspiler, ctx.classBody());
	body.push.apply(body, this.constructor.body);

	if(ctx.type() && ctx.type().getText() !== '') {
		this._addInherition(ctx.type());
	}

	this.body.unshift({
		"type": "FunctionDeclaration",
		"id": {
			"type": "Identifier",
			"name": this.name
		},
		"params": this.params,
		"defaults": [],
		"body": {
			"type": "BlockStatement",
			"body": body
		},
		"generator": false,
		"expression": false
	});

	return this.body;
}

ClassDeclarationTranspiler.prototype._addInherition = function(type) {
	var ctor = {
			"type": "Identifier",
			"name": this.name
	};

	var sctor = {
			"type": "MemberExpression",
			"computed": false,
			"object": {
				"type": "MemberExpression",
				"computed": false,
				"object": ctor,
				"property": { "type": "Identifier", "name": "prototype" }
			},
			"property": { "type": "Identifier", "name": "super_" }
	};

	this.body.unshift({
		"type": "ExpressionStatement",
		"expression": {
			"type": "AssignmentExpression",
			"operator": "=",
			"left": sctor,
			"right": { "type": "Identifier", "name": type.getText() }
		}
	}, {
		"type": "ExpressionStatement",
		"expression": {
			"type": "CallExpression",
			"callee": {
				"type": "MemberExpression",
				"computed": false,
				"object": { "type": "Identifier", "name": "Object" },
				"property": { "type": "Identifier", "name": "setPrototypeOf" }
			},
			"arguments": [ 
				{
					"type": "MemberExpression",
					"computed": false,
					"object": ctor,
					"property": { "type": "Identifier", "name": "prototype" }
				}, {
					"type": "MemberExpression",
					"computed": false,
					"object": sctor,
					"property": { "type": "Identifier", "name": "prototype" }
				}
			]
		}
	}
);
}

ClassDeclarationTranspiler.prototype.createNode = function(type, node) {
	return {
		"type": "MemberExpression",
		"computed": false,
		"object": {
			"type": "ThisExpression"
		},
		"property": {
			"type": "Identifier",
			"name": node.Identifier().getText()
		}
	};
}


module.exports = ClassDeclarationTranspiler;
