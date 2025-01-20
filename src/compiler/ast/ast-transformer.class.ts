import * as ts from 'typescript';

export class ASTTransformer {
  transformToTypeScript(parsedTokens: any[]): ts.SourceFile {
    const statements: ts.Statement[] = [];

    // Add necessary imports
    statements.push(
      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier('describe'),
            ),
            ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('it')),
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier('expect'),
            ),
          ]),
        ),
        ts.factory.createStringLiteral('@jest/globals'),
        undefined,
      ),
    );

    // Transform tokens to AST nodes
    let currentDescribeBlock: ts.Statement[] = [];
    let currentTestBlock: ts.Statement[] = [];

    parsedTokens.forEach(token => {
      switch (token.type) {
        case 'DescribeStart':
          if (currentDescribeBlock.length > 0) {
            statements.push(this.createDescribeBlock(token.text, currentDescribeBlock));
            currentDescribeBlock = [];
          }
          break;
        case 'TestStart':
          if (currentTestBlock.length > 0) {
            currentDescribeBlock.push(this.createTestBlock(token.text, currentTestBlock));
            currentTestBlock = [];
          }
          break;
        case 'Expectation':
          currentTestBlock.push(this.createExpectation(token));
          break;
      }
    });

    // Add any remaining blocks
    if (currentTestBlock.length > 0) {
      currentDescribeBlock.push(this.createTestBlock('', currentTestBlock));
    }
    if (currentDescribeBlock.length > 0) {
      statements.push(this.createDescribeBlock('', currentDescribeBlock));
    }

    return ts.factory.createSourceFile(
      statements,
      ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
      ts.NodeFlags.None,
    );
  }

  private createDescribeBlock(description: string, statements: ts.Statement[]): ts.Statement {
    return ts.factory.createExpressionStatement(
      ts.factory.createCallExpression(ts.factory.createIdentifier('describe'), undefined, [
        ts.factory.createStringLiteral(description),
        ts.factory.createArrowFunction(
          undefined,
          undefined,
          [],
          undefined,
          ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          ts.factory.createBlock(statements, true),
        ),
      ]),
    );
  }

  private createTestBlock(description: string, statements: ts.Statement[]): ts.Statement {
    return ts.factory.createExpressionStatement(
      ts.factory.createCallExpression(ts.factory.createIdentifier('it'), undefined, [
        ts.factory.createStringLiteral(description),
        ts.factory.createArrowFunction(
          undefined,
          undefined,
          [],
          undefined,
          ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          ts.factory.createBlock(statements, true),
        ),
      ]),
    );
  }

  private createExpectation(token: any): ts.Statement {
    return ts.factory.createExpressionStatement(
      ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createCallExpression(ts.factory.createIdentifier('expect'), undefined, [
            ts.factory.createIdentifier(token.actual),
          ]),
          ts.factory.createIdentifier(token.matcher),
        ),
        undefined,
        [ts.factory.createIdentifier(token.expected)],
      ),
    );
  }
}
