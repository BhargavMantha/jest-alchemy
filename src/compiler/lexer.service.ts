import { Injectable } from '@nestjs/common';

export async function CreateTokenLexer() {
  const module = await (eval(`import('chevrotain')`) as Promise<any>);
  const { createToken, Lexer } = module;

  const EOF = createToken({
    name: 'EOF',
    pattern: Lexer.NA,
  });

  const Identifier = createToken({
    name: 'Identifier',
    pattern: /[a-zA-Z_]\w*/,
    line_breaks: false,
  });

  const WhiteSpace = createToken({
    name: 'WhiteSpace',
    pattern: /\s+/,
    group: Lexer.SKIPPED,
    line_breaks: true,
  });

  const SingleLineComment = createToken({
    name: 'SingleLineComment',
    pattern: /\/\/[^\n\r]*/,
    group: Lexer.SKIPPED,
    line_breaks: false,
  });

  // Create token definitions with consistent naming and patterns
  const tokens = {
    // Keywords with exact matches
    Describe: createToken({
      name: 'Describe',
      pattern: 'describe', // Changed from regex to exact string match
      longer_alt: Identifier,
    }),
    It: createToken({
      name: 'It',
      pattern: 'it', // Changed from regex to exact string match
      longer_alt: Identifier,
    }),
    Expect: createToken({
      name: 'Expect',
      pattern: 'expect', // Changed from regex to exact string match
      longer_alt: Identifier,
    }),
    Async: createToken({
      name: 'Async',
      pattern: 'async', // Changed from regex to exact string match
      longer_alt: Identifier,
    }),
    Await: createToken({
      name: 'Await',
      pattern: 'await', // Changed from regex to exact string match
      longer_alt: Identifier,
    }),
    Let: createToken({
      name: 'Let',
      pattern: 'let', // Changed from regex to exact string match
      longer_alt: Identifier,
    }),
    Const: createToken({
      name: 'Const',
      pattern: 'const', // Changed from regex to exact string match
      longer_alt: Identifier,
    }),

    // Matchers as identifiers
    ToBe: createToken({
      name: 'ToBe',
      pattern: 'toBe', // Changed from regex to exact string match
      categories: Identifier,
    }),
    ToEqual: createToken({
      name: 'ToEqual',
      pattern: 'toEqual', // Changed from regex to exact string match
      categories: Identifier,
    }),
    ToContain: createToken({
      name: 'ToContain',
      pattern: 'toContain', // Changed from regex to exact string match
      categories: Identifier,
    }),

    // Literals with more precise patterns
    StringLiteral: createToken({
      name: 'StringLiteral',
      pattern: /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/,
    }),

    NumberLiteral: createToken({
      name: 'NumberLiteral',
      pattern: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/,
    }),

    BooleanLiteral: createToken({
      name: 'BooleanLiteral',
      pattern: /true|false/,
      longer_alt: Identifier,
    }),

    // Punctuation
    LParen: createToken({ name: 'LParen', pattern: '(' }),
    RParen: createToken({ name: 'RParen', pattern: ')' }),
    LCurly: createToken({ name: 'LCurly', pattern: '{' }),
    RCurly: createToken({ name: 'RCurly', pattern: '}' }),
    Semicolon: createToken({ name: 'Semicolon', pattern: ';' }),
    Comma: createToken({ name: 'Comma', pattern: ',' }),
    Dot: createToken({ name: 'Dot', pattern: '.' }),
    Colon: createToken({ name: 'Colon', pattern: ':' }),
    Arrow: createToken({ name: 'Arrow', pattern: '=>' }),
    Equals: createToken({ name: 'Equals', pattern: '=' }),
  };

  // Define token order with precise precedence
  const allTokens = [
    WhiteSpace,
    SingleLineComment,
    // Keywords first
    tokens.Describe,
    tokens.Expect,
    tokens.Async,
    tokens.Await,
    tokens.Const,
    tokens.Let,
    tokens.It,
    tokens.ToBe,
    tokens.ToEqual,
    tokens.ToContain,
    // Literals
    tokens.StringLiteral,
    tokens.NumberLiteral,
    tokens.BooleanLiteral,
    // Operators and punctuation
    tokens.LParen,
    tokens.RParen,
    tokens.LCurly,
    tokens.RCurly,
    tokens.Semicolon,
    tokens.Comma,
    tokens.Dot,
    tokens.Colon,
    tokens.Arrow,
    tokens.Equals,
    // Base identifier last as fallback
    Identifier,
    EOF,
  ];

  return {
    tokenMap: {
      ...tokens,
      Identifier,
      SingleLineComment,
      EOF, // Include EOF in tokenMap
    },
    allTokens,
    JestAlchemyLexer: new Lexer(allTokens, {
      errorMessageProvider: {
        buildUnexpectedCharactersMessage: (fullText, startOffset, length, line, column) => {
          return `Unexpected character "${fullText.substr(startOffset, length)}" at line: ${line}, column: ${column}`;
        },
      },
      recoveryEnabled: true,
    }),
  };
}
@Injectable()
export class LexerService {
  async tokenize(input: string) {
    try {
      const { JestAlchemyLexer } = await CreateTokenLexer();
      const lexingResult = JestAlchemyLexer.tokenize(input);

      if (lexingResult.errors.length > 0) {
        console.error('Lexing Errors:', lexingResult.errors);
        throw new Error(`Lexing errors detected: ${JSON.stringify(lexingResult.errors, null, 2)}`);
      }

      // Debug output for tokens
      console.log('\nTokenization result:');
      lexingResult.tokens.forEach((token, index) => {
        console.log(`${index}: ${token.tokenType.name} -> '${token.image}'`);
      });

      return lexingResult.tokens;
    } catch (error) {
      console.error('Tokenization error:', error);
      throw error;
    }
  }
}
