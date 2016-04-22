// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var BaseTranspiler = require('./BaseTranspiler.js');
var ClassDeclarationTranspiler = require('./ClassDeclarationTranspiler.js');
var FieldDeclarationTranspiler = require('./FieldDeclarationTranspiler.js');
var MethodDeclarationTranspiler = require('./MethodDeclarationTranspiler.js');
var ConstructorDeclarationTranspiler = require('./ConstructorDeclarationTranspiler.js');
var util = require('util');

function ClassBodyTranspiler(parent) {
	BaseTranspiler.call(this, parent);
	return this;
}

util.inherits(ClassBodyTranspiler, BaseTranspiler);

ClassBodyTranspiler.prototype.visitClassDeclaration = function(ctx) {
	return this.visitWith(ClassDeclarationTranspiler, ctx);
}

ClassBodyTranspiler.prototype.visitMethodDeclaration = function(ctx) {
	return this.visitWith(MethodDeclarationTranspiler, ctx);
}

ClassBodyTranspiler.prototype.visitConstructorDeclaration = function(ctx) {
	return this.visitWith(ConstructorDeclarationTranspiler, ctx);
}

ClassBodyTranspiler.prototype.visitFieldDeclaration = function(ctx) {
	return this.visitWith(FieldDeclarationTranspiler, ctx);
}

ClassBodyTranspiler.prototype.createNode = function(type, node) {
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

module.exports = ClassBodyTranspiler;
