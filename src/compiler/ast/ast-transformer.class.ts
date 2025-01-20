import * as ts from 'typescript';
import { IToken } from 'chevrotain';
import { TypeScriptFactoryMapper } from '../typescript-factory-mapper';

export class ASTTransformer {
  async transformToTypeScript(cst: any): Promise<ts.Node> {
    try {
      await TypeScriptFactoryMapper.initialize();

      if (!cst?.children) {
        throw new Error('Invalid CST: CST is undefined or missing children');
      }

      // Transform the Program node
      const statements = await this.transformProgram(cst.children);

      // Create source file
      return TypeScriptFactoryMapper.createNode('Program', statements);
    } catch (error) {
      console.error('Error in AST transformation:', error);
      throw error;
    }
  }

  private async transformProgram(cst: any): Promise<ts.Statement[]> {
    const statements: ts.Statement[] = [];

    // Add Jest import declaration
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

    if (!cst.describeBlock) {
      throw new Error('No describe block found in CST');
    }

    const description = this.getStringLiteralValue(cst.describeBlock.description);
    if (!description) {
      throw new Error('Describe block missing description');
    }

    const blockStatements = await this.transformBlockStatement(
      cst.describeBlock.body?.blockStatement,
    );

    statements.push(
      TypeScriptFactoryMapper.createStatement(
        'DescribeCall',
        description,
        ts.factory.createArrowFunction(
          undefined,
          undefined,
          [],
          undefined,
          ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          ts.factory.createBlock(blockStatements, true),
        ),
      ),
    );

    return statements;
  }

  private async transformBlockStatement(cst: any): Promise<ts.Statement[]> {
    const statements: ts.Statement[] = [];

    if (!cst?.children) {
      return statements;
    }

    for (const statement of Object.values(cst.children)) {
      if (Array.isArray(statement)) {
        for (const item of statement) {
          if (item.name === 'itStatement') {
            const itStatement = await this.transformItStatement(item);
            if (itStatement) statements.push(itStatement);
          } else if (item.name === 'variableDeclaration') {
            const varStatement = await this.transformVariableDeclaration(item);
            if (varStatement) statements.push(varStatement);
          } else if (item.name === 'expressionStatement') {
            const exprStatement = await this.transformExpressionStatement(item);
            if (exprStatement) statements.push(exprStatement);
          }
        }
      }
    }

    return statements;
  }

  private async transformItStatement(cst: any): Promise<ts.Statement | undefined> {
    if (!cst?.children) return undefined;

    const description = this.getStringLiteralValue(cst.children.StringLiteral?.[0]);
    if (!description) {
      throw new Error('It block missing description');
    }

    const isAsync = !!cst.children.async;
    const blockStatements = await this.transformBlockStatement(
      cst.children.arrowFunction?.[0]?.children?.blockStatement?.[0],
    );

    return TypeScriptFactoryMapper.createStatement(
      'ItCall',
      description,
      isAsync,
      ts.factory.createArrowFunction(
        isAsync ? [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)] : undefined,
        undefined,
        [],
        undefined,
        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.factory.createBlock(blockStatements, true),
      ),
    );
  }

  private async transformVariableDeclaration(cst: any): Promise<ts.Statement | undefined> {
    if (!cst?.children) return undefined;

    const kind = cst.children.Let ? 'Let' : 'Const';
    const name = cst.children.Identifier?.[0]?.image;
    if (!name) {
      throw new Error('Variable declaration missing identifier');
    }

    let initializer: ts.Expression | undefined;
    if (cst.children.expression) {
      initializer = await this.transformExpression(cst.children.expression[0]);
    }

    return TypeScriptFactoryMapper.createStatement(kind, name, initializer);
  }

  private async transformExpressionStatement(cst: any): Promise<ts.Statement | undefined> {
    if (!cst?.children?.expression?.[0]) return undefined;

    const expression = await this.transformExpression(cst.children.expression[0]);
    return ts.factory.createExpressionStatement(expression);
  }

  private async transformExpression(cst: any): Promise<ts.Expression> {
    if (!cst?.children) {
      throw new Error('Invalid expression CST');
    }

    // Handle chain of expressions (e.g., expect(result).toBe("value"))
    if (cst.children.primaryExpression) {
      const primary = await this.transformPrimaryExpression(cst.children.primaryExpression[0]);

      if (cst.children.Dot) {
        let result = primary;
        for (let i = 0; i < cst.children.Dot.length; i++) {
          const identifier = cst.children.Identifier[i + 1];
          const callArgs = cst.children.callExpression?.[i];

          if (callArgs) {
            result = ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(result, identifier.image),
              undefined,
              await this.transformCallArguments(callArgs),
            );
          } else {
            result = ts.factory.createPropertyAccessExpression(result, identifier.image);
          }
        }
        return result;
      }

      return primary;
    }

    // Handle identifiers
    if (cst.children.Identifier) {
      return TypeScriptFactoryMapper.createExpression(
        'Identifier',
        cst.children.Identifier[0].image,
      );
    }

    // Handle literals
    if (cst.children.StringLiteral) {
      return TypeScriptFactoryMapper.createExpression(
        'StringLiteral',
        cst.children.StringLiteral[0].image,
      );
    }

    if (cst.children.NumberLiteral) {
      return TypeScriptFactoryMapper.createExpression(
        'NumberLiteral',
        cst.children.NumberLiteral[0].image,
      );
    }

    throw new Error('Unsupported expression type');
  }

  private async transformPrimaryExpression(cst: any): Promise<ts.Expression> {
    if (cst.children.Identifier) {
      const identifier = cst.children.Identifier[0].image;
      if (cst.children.callExpression) {
        const args = await this.transformCallArguments(cst.children.callExpression[0]);
        if (identifier === 'expect') {
          return TypeScriptFactoryMapper.createExpression('ExpectCall', args[0]);
        }
        return ts.factory.createCallExpression(
          ts.factory.createIdentifier(identifier),
          undefined,
          args,
        );
      }
      return TypeScriptFactoryMapper.createExpression('Identifier', identifier);
    }

    if (cst.children.StringLiteral) {
      return TypeScriptFactoryMapper.createExpression(
        'StringLiteral',
        cst.children.StringLiteral[0].image,
      );
    }

    if (cst.children.NumberLiteral) {
      return TypeScriptFactoryMapper.createExpression(
        'NumberLiteral',
        cst.children.NumberLiteral[0].image,
      );
    }

    if (cst.children.objectLiteral) {
      return this.transformObjectLiteral(cst.children.objectLiteral[0]);
    }

    throw new Error('Unsupported primary expression type');
  }

  private async transformCallArguments(cst: any): Promise<ts.Expression[]> {
    if (!cst?.children?.argumentList) {
      return [];
    }

    const args: ts.Expression[] = [];
    for (const arg of cst.children.argumentList) {
      if (arg.children.expression) {
        args.push(await this.transformExpression(arg.children.expression[0]));
      }
    }

    return args;
  }

  private async transformObjectLiteral(cst: any): Promise<ts.ObjectLiteralExpression> {
    const properties: ts.PropertyAssignment[] = [];

    if (cst.children.propertyList) {
      for (const prop of cst.children.propertyList) {
        if (prop.children.Identifier && prop.children.expression) {
          properties.push(
            ts.factory.createPropertyAssignment(
              prop.children.Identifier[0].image,
              await this.transformExpression(prop.children.expression[0]),
            ),
          );
        }
      }
    }

    return ts.factory.createObjectLiteralExpression(properties, true);
  }

  private getStringLiteralValue(token: IToken | undefined): string {
    if (!token?.image) return '';
    return token.image.replace(/^["']|["']$/g, '');
  }
}
