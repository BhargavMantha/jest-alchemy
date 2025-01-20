import { CreateTokenLexer } from './lexer.service';

export class JestParser {
  private parser: any;
  private tokenMap: any;

  async initialize() {
    const module = await (eval(`import('chevrotain')`) as Promise<any>);
    const CstParser = module.CstParser;
    const { tokenMap } = await CreateTokenLexer();
    this.tokenMap = tokenMap;

    class JestParserInternal extends CstParser {
      constructor() {
        super(Object.values(tokenMap));
        this.performSelfAnalysis();
      }

      // Root rule for a test file
      public testFile = this.RULE('testFile', () => {
        this.MANY(() => {
          this.OR([
            { ALT: () => this.SUBRULE(this.describeBlock) },
            { ALT: () => this.SUBRULE(this.testBlock) },
          ]);
        });
      });

      // Rule for describe blocks
      private describeBlock = this.RULE('describeBlock', () => {
        this.CONSUME(tokenMap.Describe);
        this.CONSUME(tokenMap.LParen);
        this.CONSUME(tokenMap.StringLiteral);
        this.CONSUME(tokenMap.Comma);
        this.SUBRULE(this.arrowFunction);
        this.CONSUME(tokenMap.RParen);
      });

      // Rule for test blocks (it/test)
      private testBlock = this.RULE('testBlock', () => {
        this.OR([
          { ALT: () => this.CONSUME(tokenMap.It) },
          { ALT: () => this.CONSUME(tokenMap.Test) },
        ]);
        this.CONSUME(tokenMap.LParen);
        this.CONSUME(tokenMap.StringLiteral);
        this.CONSUME(tokenMap.Comma);
        this.SUBRULE(this.arrowFunction);
        this.CONSUME(tokenMap.RParen);
      });

      // Rule for arrow functions
      private arrowFunction = this.RULE('arrowFunction', () => {
        this.CONSUME(tokenMap.LParen);
        this.OPTION(() => this.SUBRULE(this.parameterList));
        this.CONSUME(tokenMap.RParen);
        this.CONSUME(tokenMap.Arrow);
        this.SUBRULE(this.functionBody);
      });

      // Rule for parameter list
      private parameterList = this.RULE('parameterList', () => {
        this.MANY_SEP({
          SEP: tokenMap.Comma,
          DEF: () => this.CONSUME(tokenMap.Identifier),
        });
      });

      // Rule for function body
      private functionBody = this.RULE('functionBody', () => {
        this.CONSUME(tokenMap.LCurly);
        this.MANY(() => {
          this.SUBRULE(this.statement);
        });
        this.CONSUME(tokenMap.RCurly);
      });

      // Rule for statements
      private statement = this.RULE('statement', () => {
        this.OR([
          { ALT: () => this.SUBRULE(this.expectStatement) },
          { ALT: () => this.SUBRULE(this.variableDeclaration) },
          { ALT: () => this.SUBRULE(this.expressionStatement) },
        ]);
      });

      // Rule for expect statements
      private expectStatement = this.RULE('expectStatement', () => {
        this.CONSUME(tokenMap.Expect);
        this.CONSUME(tokenMap.LParen);
        this.SUBRULE(this.expression);
        this.CONSUME(tokenMap.RParen);
        this.CONSUME(tokenMap.Dot);
        this.CONSUME(tokenMap.Identifier); // matcher (toBe, toEqual, etc.)
        this.CONSUME2(tokenMap.LParen);
        this.SUBRULE2(this.expression);
        this.CONSUME2(tokenMap.RParen);
        this.CONSUME(tokenMap.Semicolon);
      });

      // Rule for variable declarations
      private variableDeclaration = this.RULE('variableDeclaration', () => {
        this.OR([
          { ALT: () => this.CONSUME(tokenMap.Let) },
          { ALT: () => this.CONSUME(tokenMap.Const) },
        ]);
        this.CONSUME(tokenMap.Identifier);
        this.OPTION(() => {
          this.CONSUME(tokenMap.Equals);
          this.SUBRULE(this.expression);
        });
        this.CONSUME(tokenMap.Semicolon);
      });

      // Rule for expression statements
      private expressionStatement = this.RULE('expressionStatement', () => {
        this.SUBRULE(this.expression);
        this.CONSUME(tokenMap.Semicolon);
      });

      // Rule for expressions
      private expression = this.RULE('expression', () => {
        this.OR([
          { ALT: () => this.CONSUME(tokenMap.Identifier) },
          { ALT: () => this.CONSUME(tokenMap.StringLiteral) },
          { ALT: () => this.CONSUME(tokenMap.NumberLiteral) },
        ]);
      });
    }

    this.parser = new JestParserInternal();
  }

  async parse(tokens: any[]) {
    if (!this.parser) {
      await this.initialize();
    }

    // Set the input tokens
    this.parser.input = tokens;

    // Parse the input
    const cst = this.parser.testFile();

    if (this.parser.errors.length > 0) {
      throw new Error(`Parsing errors detected: ${JSON.stringify(this.parser.errors, null, 2)}`);
    }

    return cst;
  }
}
