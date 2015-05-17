var JavaListener = require('./grammars/java/JavaListener.js').JavaListener;
var util = require('util');

function Transpiler() {
	JavaListener.call(this);
	return this;
}
util.inherits(Transpiler, JavaListener)

Transpiler.prototype.constructor = Transpiler;

// Enter a parse tree produced by JavaParser#compilationUnit.
Transpiler.prototype.enterCompilationUnit = function enterCompilationUnit(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#compilationUnit.
Transpiler.prototype.exitCompilationUnit = function exitCompilationUnit(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#packageDeclaration.
Transpiler.prototype.enterPackageDeclaration = function enterPackageDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#packageDeclaration.
Transpiler.prototype.exitPackageDeclaration = function exitPackageDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#importDeclaration.
Transpiler.prototype.enterImportDeclaration = function enterImportDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#importDeclaration.
Transpiler.prototype.exitImportDeclaration = function exitImportDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeDeclaration.
Transpiler.prototype.enterTypeDeclaration = function enterTypeDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeDeclaration.
Transpiler.prototype.exitTypeDeclaration = function exitTypeDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#modifier.
Transpiler.prototype.enterModifier = function enterModifier(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#modifier.
Transpiler.prototype.exitModifier = function exitModifier(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#classOrInterfaceModifier.
Transpiler.prototype.enterClassOrInterfaceModifier = function enterClassOrInterfaceModifier(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#classOrInterfaceModifier.
Transpiler.prototype.exitClassOrInterfaceModifier = function exitClassOrInterfaceModifier(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#variableModifier.
Transpiler.prototype.enterVariableModifier = function enterVariableModifier(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#variableModifier.
Transpiler.prototype.exitVariableModifier = function exitVariableModifier(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#classDeclaration.
Transpiler.prototype.enterClassDeclaration = function enterClassDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#classDeclaration.
Transpiler.prototype.exitClassDeclaration = function exitClassDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeParameters.
Transpiler.prototype.enterTypeParameters = function enterTypeParameters(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeParameters.
Transpiler.prototype.exitTypeParameters = function exitTypeParameters(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeParameter.
Transpiler.prototype.enterTypeParameter = function enterTypeParameter(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeParameter.
Transpiler.prototype.exitTypeParameter = function exitTypeParameter(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeBound.
Transpiler.prototype.enterTypeBound = function enterTypeBound(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeBound.
Transpiler.prototype.exitTypeBound = function exitTypeBound(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#enumDeclaration.
Transpiler.prototype.enterEnumDeclaration = function enterEnumDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#enumDeclaration.
Transpiler.prototype.exitEnumDeclaration = function exitEnumDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#enumConstants.
Transpiler.prototype.enterEnumConstants = function enterEnumConstants(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#enumConstants.
Transpiler.prototype.exitEnumConstants = function exitEnumConstants(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#enumConstant.
Transpiler.prototype.enterEnumConstant = function enterEnumConstant(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#enumConstant.
Transpiler.prototype.exitEnumConstant = function exitEnumConstant(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#enumBodyDeclarations.
Transpiler.prototype.enterEnumBodyDeclarations = function enterEnumBodyDeclarations(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#enumBodyDeclarations.
Transpiler.prototype.exitEnumBodyDeclarations = function exitEnumBodyDeclarations(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#interfaceDeclaration.
Transpiler.prototype.enterInterfaceDeclaration = function enterInterfaceDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#interfaceDeclaration.
Transpiler.prototype.exitInterfaceDeclaration = function exitInterfaceDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeList.
Transpiler.prototype.enterTypeList = function enterTypeList(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeList.
Transpiler.prototype.exitTypeList = function exitTypeList(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#classBody.
Transpiler.prototype.enterClassBody = function enterClassBody(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#classBody.
Transpiler.prototype.exitClassBody = function exitClassBody(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#interfaceBody.
Transpiler.prototype.enterInterfaceBody = function enterInterfaceBody(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#interfaceBody.
Transpiler.prototype.exitInterfaceBody = function exitInterfaceBody(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#classBodyDeclaration.
Transpiler.prototype.enterClassBodyDeclaration = function enterClassBodyDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#classBodyDeclaration.
Transpiler.prototype.exitClassBodyDeclaration = function exitClassBodyDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#memberDeclaration.
Transpiler.prototype.enterMemberDeclaration = function enterMemberDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#memberDeclaration.
Transpiler.prototype.exitMemberDeclaration = function exitMemberDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#methodDeclaration.
Transpiler.prototype.enterMethodDeclaration = function enterMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#methodDeclaration.
Transpiler.prototype.exitMethodDeclaration = function exitMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#genericMethodDeclaration.
Transpiler.prototype.enterGenericMethodDeclaration = function enterGenericMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#genericMethodDeclaration.
Transpiler.prototype.exitGenericMethodDeclaration = function exitGenericMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#constructorDeclaration.
Transpiler.prototype.enterConstructorDeclaration = function enterConstructorDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#constructorDeclaration.
Transpiler.prototype.exitConstructorDeclaration = function exitConstructorDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#genericConstructorDeclaration.
Transpiler.prototype.enterGenericConstructorDeclaration = function enterGenericConstructorDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#genericConstructorDeclaration.
Transpiler.prototype.exitGenericConstructorDeclaration = function exitGenericConstructorDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#fieldDeclaration.
Transpiler.prototype.enterFieldDeclaration = function enterFieldDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#fieldDeclaration.
Transpiler.prototype.exitFieldDeclaration = function exitFieldDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#interfaceBodyDeclaration.
Transpiler.prototype.enterInterfaceBodyDeclaration = function enterInterfaceBodyDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#interfaceBodyDeclaration.
Transpiler.prototype.exitInterfaceBodyDeclaration = function exitInterfaceBodyDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#interfaceMemberDeclaration.
Transpiler.prototype.enterInterfaceMemberDeclaration = function enterInterfaceMemberDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#interfaceMemberDeclaration.
Transpiler.prototype.exitInterfaceMemberDeclaration = function exitInterfaceMemberDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#constDeclaration.
Transpiler.prototype.enterConstDeclaration = function enterConstDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#constDeclaration.
Transpiler.prototype.exitConstDeclaration = function exitConstDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#constantDeclarator.
Transpiler.prototype.enterConstantDeclarator = function enterConstantDeclarator(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#constantDeclarator.
Transpiler.prototype.exitConstantDeclarator = function exitConstantDeclarator(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#interfaceMethodDeclaration.
Transpiler.prototype.enterInterfaceMethodDeclaration = function enterInterfaceMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#interfaceMethodDeclaration.
Transpiler.prototype.exitInterfaceMethodDeclaration = function exitInterfaceMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#genericInterfaceMethodDeclaration.
Transpiler.prototype.enterGenericInterfaceMethodDeclaration = function enterGenericInterfaceMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#genericInterfaceMethodDeclaration.
Transpiler.prototype.exitGenericInterfaceMethodDeclaration = function exitGenericInterfaceMethodDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#variableDeclarators.
Transpiler.prototype.enterVariableDeclarators = function enterVariableDeclarators(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#variableDeclarators.
Transpiler.prototype.exitVariableDeclarators = function exitVariableDeclarators(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#variableDeclarator.
Transpiler.prototype.enterVariableDeclarator = function enterVariableDeclarator(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#variableDeclarator.
Transpiler.prototype.exitVariableDeclarator = function exitVariableDeclarator(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#variableDeclaratorId.
Transpiler.prototype.enterVariableDeclaratorId = function enterVariableDeclaratorId(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#variableDeclaratorId.
Transpiler.prototype.exitVariableDeclaratorId = function exitVariableDeclaratorId(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#variableInitializer.
Transpiler.prototype.enterVariableInitializer = function enterVariableInitializer(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#variableInitializer.
Transpiler.prototype.exitVariableInitializer = function exitVariableInitializer(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#arrayInitializer.
Transpiler.prototype.enterArrayInitializer = function enterArrayInitializer(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#arrayInitializer.
Transpiler.prototype.exitArrayInitializer = function exitArrayInitializer(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#enumConstantName.
Transpiler.prototype.enterEnumConstantName = function enterEnumConstantName(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#enumConstantName.
Transpiler.prototype.exitEnumConstantName = function exitEnumConstantName(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#type.
Transpiler.prototype.enterType = function enterType(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#type.
Transpiler.prototype.exitType = function exitType(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#classOrInterfaceType.
Transpiler.prototype.enterClassOrInterfaceType = function enterClassOrInterfaceType(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#classOrInterfaceType.
Transpiler.prototype.exitClassOrInterfaceType = function exitClassOrInterfaceType(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#primitiveType.
Transpiler.prototype.enterPrimitiveType = function enterPrimitiveType(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#primitiveType.
Transpiler.prototype.exitPrimitiveType = function exitPrimitiveType(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeArguments.
Transpiler.prototype.enterTypeArguments = function enterTypeArguments(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeArguments.
Transpiler.prototype.exitTypeArguments = function exitTypeArguments(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeArgument.
Transpiler.prototype.enterTypeArgument = function enterTypeArgument(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeArgument.
Transpiler.prototype.exitTypeArgument = function exitTypeArgument(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#qualifiedNameList.
Transpiler.prototype.enterQualifiedNameList = function enterQualifiedNameList(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#qualifiedNameList.
Transpiler.prototype.exitQualifiedNameList = function exitQualifiedNameList(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#formalParameters.
Transpiler.prototype.enterFormalParameters = function enterFormalParameters(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#formalParameters.
Transpiler.prototype.exitFormalParameters = function exitFormalParameters(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#formalParameterList.
Transpiler.prototype.enterFormalParameterList = function enterFormalParameterList(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#formalParameterList.
Transpiler.prototype.exitFormalParameterList = function exitFormalParameterList(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#formalParameter.
Transpiler.prototype.enterFormalParameter = function enterFormalParameter(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#formalParameter.
Transpiler.prototype.exitFormalParameter = function exitFormalParameter(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#lastFormalParameter.
Transpiler.prototype.enterLastFormalParameter = function enterLastFormalParameter(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#lastFormalParameter.
Transpiler.prototype.exitLastFormalParameter = function exitLastFormalParameter(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#methodBody.
Transpiler.prototype.enterMethodBody = function enterMethodBody(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#methodBody.
Transpiler.prototype.exitMethodBody = function exitMethodBody(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#constructorBody.
Transpiler.prototype.enterConstructorBody = function enterConstructorBody(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#constructorBody.
Transpiler.prototype.exitConstructorBody = function exitConstructorBody(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#qualifiedName.
Transpiler.prototype.enterQualifiedName = function enterQualifiedName(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#qualifiedName.
Transpiler.prototype.exitQualifiedName = function exitQualifiedName(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#literal.
Transpiler.prototype.enterLiteral = function enterLiteral(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#literal.
Transpiler.prototype.exitLiteral = function exitLiteral(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotation.
Transpiler.prototype.enterAnnotation = function enterAnnotation(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotation.
Transpiler.prototype.exitAnnotation = function exitAnnotation(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationName.
Transpiler.prototype.enterAnnotationName = function enterAnnotationName(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationName.
Transpiler.prototype.exitAnnotationName = function exitAnnotationName(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#elementValuePairs.
Transpiler.prototype.enterElementValuePairs = function enterElementValuePairs(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#elementValuePairs.
Transpiler.prototype.exitElementValuePairs = function exitElementValuePairs(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#elementValuePair.
Transpiler.prototype.enterElementValuePair = function enterElementValuePair(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#elementValuePair.
Transpiler.prototype.exitElementValuePair = function exitElementValuePair(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#elementValue.
Transpiler.prototype.enterElementValue = function enterElementValue(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#elementValue.
Transpiler.prototype.exitElementValue = function exitElementValue(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#elementValueArrayInitializer.
Transpiler.prototype.enterElementValueArrayInitializer = function enterElementValueArrayInitializer(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#elementValueArrayInitializer.
Transpiler.prototype.exitElementValueArrayInitializer = function exitElementValueArrayInitializer(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationTypeDeclaration.
Transpiler.prototype.enterAnnotationTypeDeclaration = function enterAnnotationTypeDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationTypeDeclaration.
Transpiler.prototype.exitAnnotationTypeDeclaration = function exitAnnotationTypeDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationTypeBody.
Transpiler.prototype.enterAnnotationTypeBody = function enterAnnotationTypeBody(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationTypeBody.
Transpiler.prototype.exitAnnotationTypeBody = function exitAnnotationTypeBody(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationTypeElementDeclaration.
Transpiler.prototype.enterAnnotationTypeElementDeclaration = function enterAnnotationTypeElementDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationTypeElementDeclaration.
Transpiler.prototype.exitAnnotationTypeElementDeclaration = function exitAnnotationTypeElementDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationTypeElementRest.
Transpiler.prototype.enterAnnotationTypeElementRest = function enterAnnotationTypeElementRest(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationTypeElementRest.
Transpiler.prototype.exitAnnotationTypeElementRest = function exitAnnotationTypeElementRest(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationMethodOrConstantRest.
Transpiler.prototype.enterAnnotationMethodOrConstantRest = function enterAnnotationMethodOrConstantRest(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationMethodOrConstantRest.
Transpiler.prototype.exitAnnotationMethodOrConstantRest = function exitAnnotationMethodOrConstantRest(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationMethodRest.
Transpiler.prototype.enterAnnotationMethodRest = function enterAnnotationMethodRest(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationMethodRest.
Transpiler.prototype.exitAnnotationMethodRest = function exitAnnotationMethodRest(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#annotationConstantRest.
Transpiler.prototype.enterAnnotationConstantRest = function enterAnnotationConstantRest(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#annotationConstantRest.
Transpiler.prototype.exitAnnotationConstantRest = function exitAnnotationConstantRest(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#defaultValue.
Transpiler.prototype.enterDefaultValue = function enterDefaultValue(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#defaultValue.
Transpiler.prototype.exitDefaultValue = function exitDefaultValue(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#block.
Transpiler.prototype.enterBlock = function enterBlock(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#block.
Transpiler.prototype.exitBlock = function exitBlock(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#blockStatement.
Transpiler.prototype.enterBlockStatement = function enterBlockStatement(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#blockStatement.
Transpiler.prototype.exitBlockStatement = function exitBlockStatement(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#localVariableDeclarationStatement.
Transpiler.prototype.enterLocalVariableDeclarationStatement = function enterLocalVariableDeclarationStatement(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#localVariableDeclarationStatement.
Transpiler.prototype.exitLocalVariableDeclarationStatement = function exitLocalVariableDeclarationStatement(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#localVariableDeclaration.
Transpiler.prototype.enterLocalVariableDeclaration = function enterLocalVariableDeclaration(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#localVariableDeclaration.
Transpiler.prototype.exitLocalVariableDeclaration = function exitLocalVariableDeclaration(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#statement.
Transpiler.prototype.enterStatement = function enterStatement(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#statement.
Transpiler.prototype.exitStatement = function exitStatement(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#catchClause.
Transpiler.prototype.enterCatchClause = function enterCatchClause(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#catchClause.
Transpiler.prototype.exitCatchClause = function exitCatchClause(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#catchType.
Transpiler.prototype.enterCatchType = function enterCatchType(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#catchType.
Transpiler.prototype.exitCatchType = function exitCatchType(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#finallyBlock.
Transpiler.prototype.enterFinallyBlock = function enterFinallyBlock(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#finallyBlock.
Transpiler.prototype.exitFinallyBlock = function exitFinallyBlock(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#resourceSpecification.
Transpiler.prototype.enterResourceSpecification = function enterResourceSpecification(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#resourceSpecification.
Transpiler.prototype.exitResourceSpecification = function exitResourceSpecification(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#resources.
Transpiler.prototype.enterResources = function enterResources(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#resources.
Transpiler.prototype.exitResources = function exitResources(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#resource.
Transpiler.prototype.enterResource = function enterResource(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#resource.
Transpiler.prototype.exitResource = function exitResource(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#switchBlockStatementGroup.
Transpiler.prototype.enterSwitchBlockStatementGroup = function enterSwitchBlockStatementGroup(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#switchBlockStatementGroup.
Transpiler.prototype.exitSwitchBlockStatementGroup = function exitSwitchBlockStatementGroup(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#switchLabel.
Transpiler.prototype.enterSwitchLabel = function enterSwitchLabel(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#switchLabel.
Transpiler.prototype.exitSwitchLabel = function exitSwitchLabel(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#forControl.
Transpiler.prototype.enterForControl = function enterForControl(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#forControl.
Transpiler.prototype.exitForControl = function exitForControl(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#forInit.
Transpiler.prototype.enterForInit = function enterForInit(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#forInit.
Transpiler.prototype.exitForInit = function exitForInit(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#enhancedForControl.
Transpiler.prototype.enterEnhancedForControl = function enterEnhancedForControl(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#enhancedForControl.
Transpiler.prototype.exitEnhancedForControl = function exitEnhancedForControl(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#forUpdate.
Transpiler.prototype.enterForUpdate = function enterForUpdate(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#forUpdate.
Transpiler.prototype.exitForUpdate = function exitForUpdate(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#parExpression.
Transpiler.prototype.enterParExpression = function enterParExpression(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#parExpression.
Transpiler.prototype.exitParExpression = function exitParExpression(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#expressionList.
Transpiler.prototype.enterExpressionList = function enterExpressionList(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#expressionList.
Transpiler.prototype.exitExpressionList = function exitExpressionList(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#statementExpression.
Transpiler.prototype.enterStatementExpression = function enterStatementExpression(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#statementExpression.
Transpiler.prototype.exitStatementExpression = function exitStatementExpression(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#constantExpression.
Transpiler.prototype.enterConstantExpression = function enterConstantExpression(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#constantExpression.
Transpiler.prototype.exitConstantExpression = function exitConstantExpression(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#expression.
Transpiler.prototype.enterExpression = function enterExpression(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#expression.
Transpiler.prototype.exitExpression = function exitExpression(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#primary.
Transpiler.prototype.enterPrimary = function enterPrimary(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#primary.
Transpiler.prototype.exitPrimary = function exitPrimary(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#creator.
Transpiler.prototype.enterCreator = function enterCreator(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#creator.
Transpiler.prototype.exitCreator = function exitCreator(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#createdName.
Transpiler.prototype.enterCreatedName = function enterCreatedName(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#createdName.
Transpiler.prototype.exitCreatedName = function exitCreatedName(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#innerCreator.
Transpiler.prototype.enterInnerCreator = function enterInnerCreator(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#innerCreator.
Transpiler.prototype.exitInnerCreator = function exitInnerCreator(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#arrayCreatorRest.
Transpiler.prototype.enterArrayCreatorRest = function enterArrayCreatorRest(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#arrayCreatorRest.
Transpiler.prototype.exitArrayCreatorRest = function exitArrayCreatorRest(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#classCreatorRest.
Transpiler.prototype.enterClassCreatorRest = function enterClassCreatorRest(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#classCreatorRest.
Transpiler.prototype.exitClassCreatorRest = function exitClassCreatorRest(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#explicitGenericInvocation.
Transpiler.prototype.enterExplicitGenericInvocation = function enterExplicitGenericInvocation(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#explicitGenericInvocation.
Transpiler.prototype.exitExplicitGenericInvocation = function exitExplicitGenericInvocation(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#nonWildcardTypeArguments.
Transpiler.prototype.enterNonWildcardTypeArguments = function enterNonWildcardTypeArguments(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#nonWildcardTypeArguments.
Transpiler.prototype.exitNonWildcardTypeArguments = function exitNonWildcardTypeArguments(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#typeArgumentsOrDiamond.
Transpiler.prototype.enterTypeArgumentsOrDiamond = function enterTypeArgumentsOrDiamond(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#typeArgumentsOrDiamond.
Transpiler.prototype.exitTypeArgumentsOrDiamond = function exitTypeArgumentsOrDiamond(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#nonWildcardTypeArgumentsOrDiamond.
Transpiler.prototype.enterNonWildcardTypeArgumentsOrDiamond = function enterNonWildcardTypeArgumentsOrDiamond(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#nonWildcardTypeArgumentsOrDiamond.
Transpiler.prototype.exitNonWildcardTypeArgumentsOrDiamond = function exitNonWildcardTypeArgumentsOrDiamond(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#superSuffix.
Transpiler.prototype.enterSuperSuffix = function enterSuperSuffix(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#superSuffix.
Transpiler.prototype.exitSuperSuffix = function exitSuperSuffix(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#explicitGenericInvocationSuffix.
Transpiler.prototype.enterExplicitGenericInvocationSuffix = function enterExplicitGenericInvocationSuffix(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#explicitGenericInvocationSuffix.
Transpiler.prototype.exitExplicitGenericInvocationSuffix = function exitExplicitGenericInvocationSuffix(ctx) {
	console.log(arguments.callee.name);
};


// Enter a parse tree produced by JavaParser#arguments.
Transpiler.prototype.enterArguments = function enterArguments(ctx) {
	console.log(arguments.callee.name);
};

// Exit a parse tree produced by JavaParser#arguments.
Transpiler.prototype.exitArguments = function exitArguments(ctx) {
	console.log(arguments.callee.name);
};



exports.Transpiler = Transpiler;
