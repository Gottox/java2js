// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var BaseTranspiler = require('./BaseTranspiler.js');
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
	var body = this.visitWith(ClassBodyTranspiler, ctx.classBody());
	body.push.apply(body, this.constructor.body);

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

	var clsDecl = {
		"type": "BlockStatement",
		"body": this.body
	};
	return clsDecl;
}

ClassDeclarationTranspiler.prototype._findType = function(type, name) {
	if(name === this.name)
		return this;
}

module.exports = ClassDeclarationTranspiler;
