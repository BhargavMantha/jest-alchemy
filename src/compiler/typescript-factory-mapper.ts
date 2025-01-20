import ts from 'typescript';
import { CreateTokenLexer } from './lexer.service';

export class TypeScriptFactoryMapper {
  static factoryMap = null;
  static async initialize() {
    const { tokenMap } = await CreateTokenLexer();
    TypeScriptFactoryMapper.factoryMap = {
      [tokenMap.Describe.name]: name =>
        ts.factory.createCallExpression(ts.factory.createIdentifier('describe'), undefined, [
          ts.factory.createStringLiteral(name),
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createBlock([], true),
          ),
        ]),
      [tokenMap.It.name]: name =>
        ts.factory.createCallExpression(ts.factory.createIdentifier('it'), undefined, [
          ts.factory.createStringLiteral(name),
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createBlock([], true),
          ),
        ]),
      [tokenMap.Test.name]: name =>
        ts.factory.createCallExpression(ts.factory.createIdentifier('test'), undefined, [
          ts.factory.createStringLiteral(name),
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createBlock([], true),
          ),
        ]),
      [tokenMap.Expect.name]: expression =>
        ts.factory.createCallExpression(ts.factory.createIdentifier('expect'), undefined, [
          expression,
        ]),
      [tokenMap.BeforeAll.name]: () =>
        ts.factory.createCallExpression(ts.factory.createIdentifier('beforeAll'), undefined, [
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createBlock([], true),
          ),
        ]),
      [tokenMap.AfterAll.name]: () =>
        ts.factory.createCallExpression(ts.factory.createIdentifier('afterAll'), undefined, [
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createBlock([], true),
          ),
        ]),
      [tokenMap.BeforeEach.name]: () =>
        ts.factory.createCallExpression(ts.factory.createIdentifier('beforeEach'), undefined, [
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createBlock([], true),
          ),
        ]),
      [tokenMap.AfterEach.name]: () =>
        ts.factory.createCallExpression(ts.factory.createIdentifier('afterEach'), undefined, [
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createBlock([], true),
          ),
        ]),
      [tokenMap.Let.name]: (identifier, initializer) =>
        ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [ts.factory.createVariableDeclaration(identifier, undefined, undefined, initializer)],
            ts.NodeFlags.Let,
          ),
        ),
      [tokenMap.Const.name]: (identifier, initializer) =>
        ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [ts.factory.createVariableDeclaration(identifier, undefined, undefined, initializer)],
            ts.NodeFlags.Const,
          ),
        ),
      [tokenMap.Function.name]: (name, parameters, body) =>
        ts.factory.createFunctionDeclaration(
          undefined,
          undefined,
          name,
          undefined,
          parameters,
          undefined,
          body,
        ),
      [tokenMap.Interface.name]: (name, members) =>
        ts.factory.createInterfaceDeclaration(
          [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
          name,
          undefined,
          undefined,
          members,
        ),
      [tokenMap.Class.name]: (name, members) =>
        ts.factory.createClassDeclaration(
          [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
          name,
          undefined,
          undefined,
          members,
        ),
      [tokenMap.Import.name]: (clauseName, moduleSpecifier) =>
        ts.factory.createImportDeclaration(
          undefined,
          ts.factory.createImportClause(false, ts.factory.createIdentifier(clauseName), undefined),
          ts.factory.createStringLiteral(moduleSpecifier),
        ),
      [tokenMap.Export.name]: declaration =>
        ts.factory.createExportDeclaration(undefined, false, declaration),
      [tokenMap.StringLiteral.name]: text => ts.factory.createStringLiteral(text),
      [tokenMap.NumberLiteral.name]: value => ts.factory.createNumericLiteral(value),
      [tokenMap.Arrow.name]: () => ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      [tokenMap.LParen.name]: () => ts.factory.createToken(ts.SyntaxKind.OpenParenToken),
      [tokenMap.RParen.name]: () => ts.factory.createToken(ts.SyntaxKind.CloseParenToken),
      [tokenMap.LCurly.name]: () => ts.factory.createToken(ts.SyntaxKind.OpenBraceToken),
      [tokenMap.RCurly.name]: () => ts.factory.createToken(ts.SyntaxKind.CloseBraceToken),
      [tokenMap.Semicolon.name]: () => ts.factory.createToken(ts.SyntaxKind.SemicolonToken),
      [tokenMap.Colon.name]: () => ts.factory.createToken(ts.SyntaxKind.ColonToken),
      [tokenMap.Comma.name]: () => ts.factory.createToken(ts.SyntaxKind.CommaToken),
      [tokenMap.Dot.name]: () => ts.factory.createToken(ts.SyntaxKind.DotToken),
      [tokenMap.Plus.name]: () => ts.factory.createToken(ts.SyntaxKind.PlusToken),
      [tokenMap.Minus.name]: () => ts.factory.createToken(ts.SyntaxKind.MinusToken),
      [tokenMap.Multiply.name]: () => ts.factory.createToken(ts.SyntaxKind.AsteriskToken),
      [tokenMap.Divide.name]: () => ts.factory.createToken(ts.SyntaxKind.SlashToken),
      [tokenMap.Equals.name]: () => ts.factory.createToken(ts.SyntaxKind.EqualsToken),
      ...(tokenMap.LessThan
        ? { [tokenMap.LessThan.name]: () => ts.factory.createToken(ts.SyntaxKind.LessThanToken) }
        : {}),
      ...(tokenMap.GreaterThan
        ? {
            [tokenMap.GreaterThan.name]: () =>
              ts.factory.createToken(ts.SyntaxKind.GreaterThanToken),
          }
        : {}),
      ...(tokenMap.Slash
        ? { [tokenMap.Slash.name]: () => ts.factory.createToken(ts.SyntaxKind.SlashToken) }
        : {}),
      [tokenMap.Identifier.name]: name => ts.factory.createIdentifier(name),
    };
  }
  static createNode(tokenType, ...args) {
    const factory = this.factoryMap[tokenType];
    if (!factory) {
      throw new Error(`No TypeScript factory method found for token type: ${tokenType}`);
    }
    return factory(...args);
  }
}

module.exports = TypeScriptFactoryMapper;
