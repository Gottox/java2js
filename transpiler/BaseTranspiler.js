// Generated from grammars/java/Java.g4 by ANTLR 4.5
// jshint ignore: start
var JavaVisitor = require('../grammars/java/JavaVisitor.js').JavaVisitor;
var util = require('util');

// This class defines a complete generic visitor for a parse tree produced by JavaParser.

function BaseTranspiler(parent) {
	JavaVisitor.call(this);
	if(parent === undefined)
		throw new Error("Parent is undefined provide at least null if there are no parents.");
	this.parent = parent;
	this.symbols = {
		types: [],
		methods: [],
		fields: []
	};
	return this;
}

util.inherits(BaseTranspiler, JavaVisitor);

BaseTranspiler.prototype.visitCompilationUnit =
BaseTranspiler.prototype.visitPackageDeclaration =
BaseTranspiler.prototype.visitImportDeclaration =
BaseTranspiler.prototype.visitTypeDeclaration =
BaseTranspiler.prototype.visitModifier =
BaseTranspiler.prototype.visitClassOrInterfaceModifier =
BaseTranspiler.prototype.visitVariableModifier =
BaseTranspiler.prototype.visitClassDeclaration =
BaseTranspiler.prototype.visitTypeParameters =
BaseTranspiler.prototype.visitTypeParameter =
BaseTranspiler.prototype.visitTypeBound =
BaseTranspiler.prototype.visitEnumDeclaration =
BaseTranspiler.prototype.visitEnumConstants =
BaseTranspiler.prototype.visitEnumConstant =
BaseTranspiler.prototype.visitEnumBodyDeclarations =
BaseTranspiler.prototype.visitInterfaceDeclaration =
BaseTranspiler.prototype.visitTypeList =
BaseTranspiler.prototype.visitClassBody =
BaseTranspiler.prototype.visitInterfaceBody =
BaseTranspiler.prototype.visitClassBodyDeclaration =
BaseTranspiler.prototype.visitMemberDeclaration =
BaseTranspiler.prototype.visitMethodDeclaration =
BaseTranspiler.prototype.visitGenericMethodDeclaration =
BaseTranspiler.prototype.visitConstructorDeclaration =
BaseTranspiler.prototype.visitGenericConstructorDeclaration =
BaseTranspiler.prototype.visitFieldDeclaration =
BaseTranspiler.prototype.visitInterfaceBodyDeclaration =
BaseTranspiler.prototype.visitInterfaceMemberDeclaration =
BaseTranspiler.prototype.visitConstDeclaration =
BaseTranspiler.prototype.visitConstantDeclarator =
BaseTranspiler.prototype.visitInterfaceMethodDeclaration =
BaseTranspiler.prototype.visitGenericInterfaceMethodDeclaration =
BaseTranspiler.prototype.visitVariableDeclarators =
BaseTranspiler.prototype.visitVariableDeclarator =
BaseTranspiler.prototype.visitVariableDeclaratorId =
BaseTranspiler.prototype.visitVariableInitializer =
BaseTranspiler.prototype.visitArrayInitializer =
BaseTranspiler.prototype.visitEnumConstantName =
BaseTranspiler.prototype.visitType =
BaseTranspiler.prototype.visitClassOrInterfaceType =
BaseTranspiler.prototype.visitPrimitiveType =
BaseTranspiler.prototype.visitTypeArguments =
BaseTranspiler.prototype.visitTypeArgument =
BaseTranspiler.prototype.visitQualifiedNameList =
BaseTranspiler.prototype.visitFormalParameters =
BaseTranspiler.prototype.visitFormalParameterList =
BaseTranspiler.prototype.visitFormalParameter =
BaseTranspiler.prototype.visitLastFormalParameter =
BaseTranspiler.prototype.visitMethodBody =
BaseTranspiler.prototype.visitConstructorBody =
BaseTranspiler.prototype.visitQualifiedName =
BaseTranspiler.prototype.visitAnnotation =
BaseTranspiler.prototype.visitAnnotationName =
BaseTranspiler.prototype.visitElementValuePairs =
BaseTranspiler.prototype.visitElementValuePair =
BaseTranspiler.prototype.visitElementValue =
BaseTranspiler.prototype.visitElementValueArrayInitializer =
BaseTranspiler.prototype.visitAnnotationTypeDeclaration =
BaseTranspiler.prototype.visitAnnotationTypeBody =
BaseTranspiler.prototype.visitAnnotationTypeElementDeclaration =
BaseTranspiler.prototype.visitAnnotationTypeElementRest =
BaseTranspiler.prototype.visitAnnotationMethodOrConstantRest =
BaseTranspiler.prototype.visitAnnotationMethodRest =
BaseTranspiler.prototype.visitAnnotationConstantRest =
BaseTranspiler.prototype.visitDefaultValue =
BaseTranspiler.prototype.visitBlock =
BaseTranspiler.prototype.visitBlockStatement =
BaseTranspiler.prototype.visitLocalVariableDeclarationStatement =
BaseTranspiler.prototype.visitLocalVariableDeclaration =
BaseTranspiler.prototype.visitStatement =
BaseTranspiler.prototype.visitCatchClause =
BaseTranspiler.prototype.visitCatchType =
BaseTranspiler.prototype.visitFinallyBlock =
BaseTranspiler.prototype.visitResourceSpecification =
BaseTranspiler.prototype.visitResources =
BaseTranspiler.prototype.visitResource =
BaseTranspiler.prototype.visitSwitchBlockStatementGroup =
BaseTranspiler.prototype.visitSwitchLabel =
BaseTranspiler.prototype.visitForControl =
BaseTranspiler.prototype.visitForInit =
BaseTranspiler.prototype.visitEnhancedForControl =
BaseTranspiler.prototype.visitForUpdate =
BaseTranspiler.prototype.visitParExpression =
BaseTranspiler.prototype.visitExpressionList =
BaseTranspiler.prototype.visitStatementExpression =
BaseTranspiler.prototype.visitConstantExpression =
BaseTranspiler.prototype.visitExpression =
BaseTranspiler.prototype.visitPrimary =
BaseTranspiler.prototype.visitCreator =
BaseTranspiler.prototype.visitCreatedName =
BaseTranspiler.prototype.visitInnerCreator =
BaseTranspiler.prototype.visitArrayCreatorRest =
BaseTranspiler.prototype.visitClassCreatorRest =
BaseTranspiler.prototype.visitExplicitGenericInvocation =
BaseTranspiler.prototype.visitNonWildcardTypeArguments =
BaseTranspiler.prototype.visitTypeArgumentsOrDiamond =
BaseTranspiler.prototype.visitNonWildcardTypeArgumentsOrDiamond =
BaseTranspiler.prototype.visitSuperSuffix =
BaseTranspiler.prototype.visitExplicitGenericInvocationSuffix =
BaseTranspiler.prototype.visitArguments =
BaseTranspiler.prototype.visitTerminal =
BaseTranspiler.prototype.visitChildren = function(ctx) {
	var result = [], item;
	for(var i = 0; i < ctx.getChildCount(); i++) {
		item = ctx.getChild(i).accept(this);
		if(item === undefined)
			continue;
		else if(util.isArray(item))
			result.push.apply(result, item);
		else
			result.push(item);
	}
	return result;
};

// Literals
BaseTranspiler.prototype.visitLiteral = function(ctx) {
	// BUG: We assume, that Java and Javascript have the same literals.
	// This is potentional unsafe.
	var result = {
		type: 'Literal',
		value: eval(ctx.getText()),
		raw: ctx.getText()
	};
	if(ctx.StringLiteral()) {
		result = {
				"type": "CallExpression",
				"callee": {
					"type": "Identifier",
					"name": "j$"
				},
				"arguments": [
					result
				]
		};
	}
	return result;
}

BaseTranspiler.prototype.visitWith = function(Proto, ctx) {
	var visitor = new Proto(this);
	return ctx.accept(visitor);
};

BaseTranspiler.prototype.addSymbol = function(type, node) {
	if(!(type in this.symbols))
		throw new Error("Type " + type + " is unkown!");
	else if(node.Identifier() in this.symbols[type]) {
		throw new Error(type + " `"+node.Identifier()+"` already defined.");
	}
	this.symbols[type].push(node);
	this.symbols[type][node.Identifier()](node);
}

BaseTranspiler.prototype.findSymbol = function(type, name) {
	var symbols = this.symbols[type]
	var uType = type[0] + type.substr(1);
	var result;
	if(this['_find'+uType] && (result = this['_find'+uType](name))) {
		return result;
	}
	if(symbols && (name in symbols)) {
		return symbols[name];
	}
	else if(this.parent) {
		return this.parent['find'+uType](name);
	}
	else {
		return null;
	}
}

BaseTranspiler.prototype.findField = function(name) {
	return this.findSymbol('field', name);
}

BaseTranspiler.prototype.findMethod = function(name) {
	return this.findSymbol('method', name);
}

BaseTranspiler.prototype.visitErrorNode = function() {
	// EMPTY
}

module.exports = BaseTranspiler;
