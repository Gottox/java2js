// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var BaseTranspiler = require('./BaseTranspiler.js');
var ClassBodyTranspiler = require('./ClassBodyTranspiler.js');
var util = require('util');

function ClassDeclarationTranspiler(parent) {
	BaseTranspiler.call(this, parent);
	this.name = null;
	this.body = null;
	this.params = []
	this.extends = null;
	return this;
}

util.inherits(ClassDeclarationTranspiler, BaseTranspiler);

ClassDeclarationTranspiler.prototype.visitClassDeclaration = function(ctx) {
	return {
		"type": "FunctionDeclaration",
		"id": {
			"type": "Identifier",
			"name": ctx.Identifier()
		},
		"params": this.params,
		"defaults": [],
		"body": {
			"type": "BlockStatement",
			"body": this.visitWith(ClassBodyTranspiler, ctx.classBody())
		},
		"generator": false,
		"expression": false
	}
}

ClassDeclarationTranspiler.prototype._findType = function(type, name) {
	if(name === this.name)
		return this;
}

module.exports = ClassDeclarationTranspiler;
