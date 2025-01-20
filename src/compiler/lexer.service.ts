import { Injectable } from '@nestjs/common';

export async function CreateTokenLexer() {
  const module = await (eval(`import('chevrotain')`) as Promise<any>);
  const createToken = module.createToken;
  const Lexer = module.Lexer;
  const CstParser = module.CstParser;

  // Whitespace (including newlines)
  const WhiteSpace = createToken({
    name: 'WhiteSpace',
    pattern: /\s+/,
    group: Lexer.SKIPPED,
  });

  // Jest tokens
  const Describe = createToken({ name: 'Describe', pattern: /describe/ });
  const It = createToken({ name: 'It', pattern: /it/ });
  const Test = createToken({ name: 'Test', pattern: /test/ });
  const Expect = createToken({ name: 'Expect', pattern: /expect/ });
  const BeforeAll = createToken({ name: 'BeforeAll', pattern: /beforeAll/ });
  const AfterAll = createToken({ name: 'AfterAll', pattern: /afterAll/ });
  const BeforeEach = createToken({ name: 'BeforeEach', pattern: /beforeEach/ });
  const AfterEach = createToken({ name: 'AfterEach', pattern: /afterEach/ });

  // TypeScript tokens
  const Let = createToken({ name: 'Let', pattern: /let/ });
  const Const = createToken({ name: 'Const', pattern: /const/ });
  const Function = createToken({ name: 'Function', pattern: /function/ });
  const Interface = createToken({ name: 'Interface', pattern: /interface/ });
  const Class = createToken({ name: 'Class', pattern: /class/ });
  const Import = createToken({ name: 'Import', pattern: /import/ });
  const Export = createToken({ name: 'Export', pattern: /export/ });

  // Common tokens
  const StringLiteral = createToken({ name: 'StringLiteral', pattern: /"(?:[^"\\]|\\.)*"/ });
  const NumberLiteral = createToken({ name: 'NumberLiteral', pattern: /\d+(\.\d+)?/ });
  const Arrow = createToken({ name: 'Arrow', pattern: /=>/ });
  const LParen = createToken({ name: 'LParen', pattern: /\(/ });
  const RParen = createToken({ name: 'RParen', pattern: /\)/ });
  const LCurly = createToken({ name: 'LCurly', pattern: /{/ });
  const RCurly = createToken({ name: 'RCurly', pattern: /}/ });
  const Semicolon = createToken({ name: 'Semicolon', pattern: /;/ });
  const Colon = createToken({ name: 'Colon', pattern: /:/ });
  const Comma = createToken({ name: 'Comma', pattern: /,/ });
  const Dot = createToken({ name: 'Dot', pattern: /\./ });

  // Operators
  const Plus = createToken({ name: 'Plus', pattern: /\+/ });
  const Minus = createToken({ name: 'Minus', pattern: /-/ });
  const Multiply = createToken({ name: 'Multiply', pattern: /\*/ });
  const Divide = createToken({ name: 'Divide', pattern: /\/(?![\\/\\*])/ });
  const Equals = createToken({ name: 'Equals', pattern: /=/ });

  // HTML-like tokens
  const LessThan = createToken({ name: 'LessThan', pattern: /</ });
  const GreaterThan = createToken({ name: 'GreaterThan', pattern: />/ });
  const Slash = createToken({ name: 'Slash', pattern: /\// });
  const HtmlIdentifier = createToken({ name: 'HtmlIdentifier', pattern: /[a-zA-Z][a-zA-Z0-9-]*/ });

  // Comments
  const SingleLineComment = createToken({
    name: 'SingleLineComment',
    pattern: /\/\/.*/,
    group: Lexer.SKIPPED,
  });

  const MultiLineComment = createToken({
    name: 'MultiLineComment',
    pattern: /\/\*[\s\S]*?\*\//,
    group: Lexer.SKIPPED,
  });

  const Identifier = createToken({
    name: 'Identifier',
    pattern: /[a-zA-Z_]\w*/,
    longer_alt: HtmlIdentifier,
  });

  // EOF token
  const EOF = createToken({ name: 'EOF', pattern: Lexer.EOF });

  // Define Token List
  const allTokens = [
    WhiteSpace,
    // Comments
    SingleLineComment,
    MultiLineComment,
    // Jest tokens
    Describe,
    It,
    Test,
    Expect,
    BeforeAll,
    AfterAll,
    BeforeEach,
    AfterEach,
    // TypeScript tokens
    Let,
    Const,
    Function,
    Interface,
    Class,
    Import,
    Export,
    // Common tokens
    StringLiteral,
    NumberLiteral,
    Arrow,
    LParen,
    RParen,
    LCurly,
    RCurly,
    Semicolon,
    Colon,
    Comma,
    Dot,
    // Operators
    Plus,
    Minus,
    Multiply,
    Divide,
    Equals,
    // HTML-like tokens
    LessThan,
    GreaterThan,
    Slash,
    HtmlIdentifier,
    // Identifier (after more specific tokens)
    Identifier,
    // EOF
    EOF,
  ];

  // Create lexer
  const JestAlchemyLexer = new Lexer(allTokens, {
    positionTracking: 'full',
    ensureOptimizations: false,
    skipValidations: true,
  });

  return {
    createToken,
    JestAlchemyLexer,
    Lexer,
    CstParser,
    allTokens,
    tokenMap: {
      Describe,
      It,
      Test,
      Expect,
      BeforeAll,
      AfterAll,
      BeforeEach,
      AfterEach,
      Let,
      Const,
      Function,
      Interface,
      Class,
      Import,
      Export,
      Identifier,
      StringLiteral,
      NumberLiteral,
      Arrow,
      LParen,
      RParen,
      LCurly,
      RCurly,
      Semicolon,
      Colon,
      Comma,
      Dot,
      Plus,
      Minus,
      Multiply,
      Divide,
      Equals,
      LessThan,
      GreaterThan,
      Slash,
      HtmlIdentifier,
      EOF,
    },
  };
}

@Injectable()
export class LexerService {
  async tokenize(input: string) {
    const { JestAlchemyLexer } = await CreateTokenLexer();
    const lexingResult = JestAlchemyLexer.tokenize(input);

    if (lexingResult.errors.length > 0) {
      console.error('Lexing errors:', lexingResult.errors);
      throw new Error(`Lexing errors detected: ${JSON.stringify(lexingResult.errors)}`);
    }

    return lexingResult.tokens;
  }
}

export async function createTestLanguageParser() {
  const { CstParser, tokenMap } = await CreateTokenLexer();

  return class TestLanguageParser extends CstParser {
    constructor() {
      super(Object.values(tokenMap));
      this.performSelfAnalysis();
    }

    public testSuite = this.RULE('testSuite', () => {
      this.CONSUME(tokenMap.Describe);
      this.CONSUME(tokenMap.StringLiteral);
      this.CONSUME(tokenMap.LParen);
      this.CONSUME(tokenMap.LCurly);
      this.AT_LEAST_ONE(() => {
        this.SUBRULE(this.testCase);
      });
      this.CONSUME(tokenMap.RCurly);
      this.CONSUME(tokenMap.RParen);
    });

    public testCase = this.RULE('testCase', () => {
      this.CONSUME(tokenMap.It);
      this.CONSUME(tokenMap.StringLiteral);
      this.CONSUME(tokenMap.LParen);
      this.CONSUME(tokenMap.LCurly);
      this.AT_LEAST_ONE(() => {
        this.SUBRULE(this.expectStatement);
      });
      this.CONSUME(tokenMap.RCurly);
      this.CONSUME(tokenMap.RParen);
    });

    public expectStatement = this.RULE('expectStatement', () => {
      this.CONSUME(tokenMap.Expect);
      this.CONSUME(tokenMap.LParen);
      this.SUBRULE(this.expression);
      this.CONSUME(tokenMap.RParen);
      this.CONSUME(tokenMap.Dot);
      this.CONSUME(tokenMap.Identifier); // toBe, toEqual, etc.
      this.CONSUME2(tokenMap.LParen);
      this.SUBRULE2(this.expression);
      this.CONSUME2(tokenMap.RParen);
      this.CONSUME(tokenMap.Semicolon);
    });

    public expression = this.RULE('expression', () => {
      this.OR([
        { ALT: () => this.CONSUME(tokenMap.Identifier) },
        { ALT: () => this.CONSUME(tokenMap.StringLiteral) },
        { ALT: () => this.CONSUME(tokenMap.NumberLiteral) },
      ]);
    });
  };
}
