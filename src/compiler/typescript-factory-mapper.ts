import * as ts from 'typescript';
import { CreateTokenLexer } from './lexer.service';

export class TypeScriptFactoryMapper {
  static factoryMap = null;

  static async initialize() {
    const { tokenMap } = await CreateTokenLexer();

    TypeScriptFactoryMapper.factoryMap = {
      // Basic literals and identifiers
      [tokenMap.Identifier.name]: (name: string) => ts.factory.createIdentifier(name),

      [tokenMap.StringLiteral.name]: (text: string) =>
        ts.factory.createStringLiteral(text.replace(/^['"]|['"]$/g, '')),

      [tokenMap.NumberLiteral.name]: (value: string) => ts.factory.createNumericLiteral(value),

      // Keywords
      ['Program']: (statements: ts.Statement[]) =>
        ts.factory.createSourceFile(
          statements,
          ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
          ts.NodeFlags.None,
        ),

      ['DescribeCall']: (description: string, callback: ts.ArrowFunction) =>
        ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(ts.factory.createIdentifier('describe'), undefined, [
            ts.factory.createStringLiteral(description),
            callback,
          ]),
        ),

      ['ItCall']: (description: string, isAsync: boolean, callback: ts.ArrowFunction) =>
        ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(ts.factory.createIdentifier('it'), undefined, [
            ts.factory.createStringLiteral(description),
            callback,
          ]),
        ),

      ['ExpectCall']: (expression: ts.Expression) =>
        ts.factory.createCallExpression(ts.factory.createIdentifier('expect'), undefined, [
          expression,
        ]),

      // Variable declarations
      [tokenMap.Let.name]: (name: string, initializer?: ts.Expression) =>
        ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                ts.factory.createIdentifier(name),
                undefined,
                undefined,
                initializer,
              ),
            ],
            ts.NodeFlags.Let,
          ),
        ),

      [tokenMap.Const.name]: (name: string, initializer?: ts.Expression) =>
        ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                ts.factory.createIdentifier(name),
                undefined,
                undefined,
                initializer,
              ),
            ],
            ts.NodeFlags.Const,
          ),
        ),

      // Basic punctuation
      [tokenMap.LParen.name]: () => ts.factory.createToken(ts.SyntaxKind.OpenParenToken),

      [tokenMap.RParen.name]: () => ts.factory.createToken(ts.SyntaxKind.CloseParenToken),

      [tokenMap.LCurly.name]: () => ts.factory.createToken(ts.SyntaxKind.OpenBraceToken),

      [tokenMap.RCurly.name]: () => ts.factory.createToken(ts.SyntaxKind.CloseBraceToken),

      [tokenMap.Semicolon.name]: () => ts.factory.createToken(ts.SyntaxKind.SemicolonToken),

      [tokenMap.Colon.name]: () => ts.factory.createToken(ts.SyntaxKind.ColonToken),

      [tokenMap.Comma.name]: () => ts.factory.createToken(ts.SyntaxKind.CommaToken),

      [tokenMap.Dot.name]: () => ts.factory.createToken(ts.SyntaxKind.DotToken),

      [tokenMap.Arrow.name]: () => ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),

      [tokenMap.Equals.name]: () => ts.factory.createToken(ts.SyntaxKind.EqualsToken),
    };
  }

  static createNode(nodeType: string, ...args: any[]): ts.Node {
    if (!this.factoryMap || !this.factoryMap[nodeType]) {
      throw new Error(`No TypeScript factory method found for node type: ${nodeType}`);
    }
    return this.factoryMap[nodeType](...args);
  }

  static createExpression(expressionType: string, ...args: any[]): ts.Expression {
    const node = this.createNode(expressionType, ...args);
    if (!ts.isExpression(node)) {
      throw new Error(`Created node is not an expression: ${expressionType}`);
    }
    return node;
  }

  static createStatement(statementType: string, ...args: any[]): ts.Statement {
    const node = this.createNode(statementType, ...args);
    if (!ts.isStatement(node)) {
      throw new Error(`Created node is not a statement: ${statementType}`);
    }
    return node;
  }
}
