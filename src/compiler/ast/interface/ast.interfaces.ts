export interface ASTNode {
  type: string;
}

export interface TestSuiteNode extends ASTNode {
  type: 'TestSuite';
  description: string;
  testCases: TestCaseNode[];
}

export interface TestCaseNode extends ASTNode {
  type: 'TestCase';
  description: string;
  expectations: ExpectStatementNode[];
}

export interface ExpectStatementNode extends ASTNode {
  type: 'ExpectStatement';
  expected: ExpressionNode;
  matcher: string;
  actual: ExpressionNode;
}

export type ExpressionNode = IdentifierNode | StringLiteralNode | NumberLiteralNode;

export interface IdentifierNode extends ASTNode {
  type: 'Identifier';
  name: string;
}

export interface StringLiteralNode extends ASTNode {
  type: 'StringLiteral';
  value: string;
}

export interface NumberLiteralNode extends ASTNode {
  type: 'NumberLiteral';
  value: number;
}
