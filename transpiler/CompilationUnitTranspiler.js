// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var BaseTranspiler = require('./BaseTranspiler.js');
var ClassDeclarationTranspiler = require('./ClassDeclarationTranspiler.js');
var util = require('util');

function CompilationUnitTranspiler(parent) {
	BaseTranspiler.call(this, parent);
	this.package = null;
	this.imports = [];
	this.staticImports = [];
	return this;
}

util.inherits(CompilationUnitTranspiler, BaseTranspiler);

CompilationUnitTranspiler.prototype.visitCompilationUnit = function(ctx) {
	return this.visitChildren(ctx);
}

CompilationUnitTranspiler.prototype.visitPackageDeclaration = function(ctx) {
	this.package = ctx.qualifiedName();
}

CompilationUnitTranspiler.prototype.visitImportDeclaration = function(ctx) {
	var imports;
	if(ctx.getChild(1).getText() === 'static')
		imports = this.staticImports;
	else
		imports = this.imports;
	imports.push(ctx.qualifiedName());
}

CompilationUnitTranspiler.prototype.visitClassDeclaration = function(ctx) {
	return this.visitWith(ClassDeclarationTranspiler, ctx);
}

CompilationUnitTranspiler.prototype._findMethod = function(type, name) {
	// TODO: load static imports to find symbol
	return result;
}

CompilationUnitTranspiler.prototype._findType = function(name) {
	// TODO: load imports to find symbol
	return result;
}

module.exports = CompilationUnitTranspiler;
