var BaseTranspiler = require('./BaseTranspiler.js');
var util = require('util');

function ClassBodyTranspiler(parent) {
	BaseTranspiler.call(this, parent);
}
util.inherits(ClassBodyTranspiler, BaseTranspiler);

ClassBodyTranspiler.prototype.visitClassDeclaration = function(ctx) {
	this.parent.addSymbol("type", ctx);
}

ClassBodyTranspiler.prototype.visitMethodDeclaration = function(ctx) {
	this.parent.addSymbol("method", ctx);
}

ClassBodyTranspiler.prototype.visitVariableDeclarator = function(ctx) {
	this.parent.addSymbol("field", ctx.variableDeclaratorId());
}

module.exports = ClassBodyTranspiler;
