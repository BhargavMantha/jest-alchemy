import { Injectable } from '@nestjs/common';

async function CreateTokenLexer() {
  const module = await (eval(`import('chevrotain')`) as Promise<any>);
  const createToken = module.createToken;
  const Lexer = module.Lexer;

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
  const Divide = createToken({ name: 'Divide', pattern: /\/(?![\/\*])/ }); // Exclude // and /* to avoid conflicts with comments
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

  // Whitespace
  const WhiteSpace = createToken({
    name: 'WhiteSpace',
    pattern: /\s+/,
    group: Lexer.SKIPPED,
  });

  const Identifier = createToken({
    name: 'Identifier',
    pattern: /[a-zA-Z_]\w*/,
    longer_alt: HtmlIdentifier,
  });
  // Catch all tokens
  const Any = createToken({ name: 'Any', pattern: /./ });
  // 2. Define Token List
  const allTokens = [
    WhiteSpace,
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
    // Operators
    Plus,
    Minus,
    Multiply,
    Divide,
    Equals,
    // HTML-like tokens (add these near the top, before other tokens that might conflict)
    LessThan,
    GreaterThan,
    Slash,
    HtmlIdentifier,
    Any,
  ];

  // 3. Create lexer
  const JestAlchemylexer = new Lexer(allTokens);

  return {
    createToken,
    JestAlchemylexer,
    Lexer,
    WhiteSpace,
    SingleLineComment,
    MultiLineComment,
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
  };
}

@Injectable()
export class LexerService {
  async tokenize(input: string) {
    const { JestAlchemylexer } = await CreateTokenLexer();
    const lexingResult = JestAlchemylexer.tokenize(input);

    if (lexingResult.errors.length > 0) {
      console.error('Lexing errors:', lexingResult.errors);
      throw new Error(`Lexing errors detected: ${JSON.stringify(lexingResult.errors)}`);
    }

    return lexingResult.tokens;
  }
}
