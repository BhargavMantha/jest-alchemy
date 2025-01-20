import { IToken } from 'chevrotain';
import {
  TestSuiteNode,
  TestCaseNode,
  ExpectStatementNode,
  ExpressionNode,
  IdentifierNode,
  StringLiteralNode,
  NumberLiteralNode,
} from './interface/ast.interfaces';

export class ASTBuilder {
  private CstNode: any;

  async initialize() {
    const module = await (eval(`import('chevrotain')`) as Promise<any>);
    this.CstNode = module.CstNode;
  }

  async buildAST(cstNode: any): Promise<TestSuiteNode> {
    if (!this.CstNode) {
      await this.initialize();
    }

    if (!(cstNode instanceof this.CstNode)) {
      throw new Error('Invalid CST node');
    }

    return this.testSuite(cstNode.children);
  }

  private testSuite(ctx: any): TestSuiteNode {
    return {
      type: 'TestSuite',
      description: this.getTokenImage(ctx.StringLiteral[0]),
      testCases: ctx.testCase.map((tc: any) => this.testCase(tc.children)),
    };
  }

  private testCase(ctx: any): TestCaseNode {
    return {
      type: 'TestCase',
      description: this.getTokenImage(ctx.StringLiteral[0]),
      expectations: ctx.expectStatement.map((es: any) => this.expectStatement(es.children)),
    };
  }

  private expectStatement(ctx: any): ExpectStatementNode {
    return {
      type: 'ExpectStatement',
      expected: this.expression(ctx.expression[0]),
      matcher: ctx.Identifier[0].image,
      actual: this.expression(ctx.expression[1]),
    };
  }

  private expression(ctx: any): ExpressionNode {
    if (ctx.Identifier) {
      return this.identifier(ctx.Identifier[0]);
    } else if (ctx.StringLiteral) {
      return this.stringLiteral(ctx.StringLiteral[0]);
    } else if (ctx.NumberLiteral) {
      return this.numberLiteral(ctx.NumberLiteral[0]);
    }
    throw new Error('Unknown expression type');
  }

  private identifier(token: IToken): IdentifierNode {
    return {
      type: 'Identifier',
      name: token.image,
    };
  }

  private stringLiteral(token: IToken): StringLiteralNode {
    return {
      type: 'StringLiteral',
      value: this.getTokenImage(token),
    };
  }

  private numberLiteral(token: IToken): NumberLiteralNode {
    return {
      type: 'NumberLiteral',
      value: parseFloat(token.image),
    };
  }

  private getTokenImage(token: IToken): string {
    // Remove surrounding quotes from string literals
    return token.image.replace(/^["']|["']$/g, '');
  }
}
