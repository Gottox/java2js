var BaseTranspiler = require('./BaseTranspiler.js');
var FieldDeclarationTranspiler = require('./FieldDeclarationTranspiler.js');
var MethodDeclarationTranspiler = require('./MethodDeclarationTranspiler.js');
var ConstructorDeclarationTranspiler = require('./ConstructorDeclarationTranspiler.js');
var util = require('util');

function ClassBodyTranspiler(parent) {
	BaseTranspiler.call(this, parent);
}

util.inherits(ClassBodyTranspiler, BaseTranspiler);

ClassBodyTranspiler.prototype.visitClassDeclaration = function(ctx) {
	[].push.apply(this.parent.body, this.visitWith(require('./ClassDeclarationTranspiler.js'), ctx));
}

ClassBodyTranspiler.prototype.visitMethodDeclaration = function(ctx) {
	this.parent.body.push(this.visitWith(MethodDeclarationTranspiler, ctx));
}

ClassBodyTranspiler.prototype.visitVariableDeclarator = function(ctx) {
	return this.visitWith(FieldDeclarationTranspiler, ctx);
}

ClassBodyTranspiler.prototype.visitConstructorDeclaration = function(ctx) {
	return this.visitWith(ConstructorDeclarationTranspiler, ctx);
}

module.exports = ClassBodyTranspiler;
