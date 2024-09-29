// import { CreateToken, lexer } from './create-token-lexer';
// // 1. Define Tokens
// Jest-specific tokens
// export const Describe = CreateToken({ name: 'Describe', pattern: /describe/ });
// export const It = CreateToken({ name: 'It', pattern: /it/ });
// export const Test = CreateToken({ name: 'Test', pattern: /test/ });
// export const Expect = CreateToken({ name: 'Expect', pattern: /expect/ });
// export const BeforeAll = CreateToken({ name: 'BeforeAll', pattern: /beforeAll/ });
// export const AfterAll = CreateToken({ name: 'AfterAll', pattern: /afterAll/ });
// export const BeforeEach = CreateToken({ name: 'BeforeEach', pattern: /beforeEach/ });
// export const AfterEach = CreateToken({ name: 'AfterEach', pattern: /afterEach/ });

// // TypeScript tokens
// export const Let = CreateToken({ name: 'Let', pattern: /let/ });
// export const Const = CreateToken({ name: 'Const', pattern: /const/ });
// export const Function = CreateToken({ name: 'Function', pattern: /function/ });
// export const Interface = CreateToken({ name: 'Interface', pattern: /interface/ });
// export const Class = CreateToken({ name: 'Class', pattern: /class/ });
// export const Import = CreateToken({ name: 'Import', pattern: /import/ });
// export const Export = CreateToken({ name: 'Export', pattern: /export/ });

// // Common tokens
// export const Identifier = CreateToken({ name: 'Identifier', pattern: /[a-zA-Z_]\w*/ });
// export const StringLiteral = CreateToken({ name: 'StringLiteral', pattern: /"(?:[^"\\]|\\.)*"/ });
// export const NumberLiteral = CreateToken({ name: 'NumberLiteral', pattern: /\d+(\.\d+)?/ });
// export const Arrow = CreateToken({ name: 'Arrow', pattern: /=>/ });
// export const LParen = CreateToken({ name: 'LParen', pattern: /\(/ });
// export const RParen = CreateToken({ name: 'RParen', pattern: /\)/ });
// export const LCurly = CreateToken({ name: 'LCurly', pattern: /{/ });
// export const RCurly = CreateToken({ name: 'RCurly', pattern: /}/ });
// export const Semicolon = CreateToken({ name: 'Semicolon', pattern: /;/ });
// export const Colon = CreateToken({ name: 'Colon', pattern: /:/ });
// export const Comma = CreateToken({ name: 'Comma', pattern: /,/ });
// export const Dot = CreateToken({ name: 'Dot', pattern: /\./ });

// // Operators
// export const Plus = CreateToken({ name: 'Plus', pattern: /\+/ });
// export const Minus = CreateToken({ name: 'Minus', pattern: /-/ });
// export const Multiply = CreateToken({ name: 'Multiply', pattern: /\*/ });
// export const Divide = CreateToken({ name: 'Divide', pattern: /\// });
// export const Equals = CreateToken({ name: 'Equals', pattern: /=/ });

// // Comments
// export const SingleLineComment = CreateToken({
//   name: 'SingleLineComment',
//   pattern: /\/\/.*$/,
//   group: lexer.SKIPPED,
// });

// export const MultiLineComment = CreateToken({
//   name: 'MultiLineComment',
//   pattern: /\/\*[\s\S]*?\*\//,
//   group: lexer.SKIPPED,
// });

// // Whitespace
// export const WhiteSpace = CreateToken({
//   name: 'WhiteSpace',
//   pattern: /\s+/,
//   group: lexer.SKIPPED,
// });

// // 2. Define Token List
// const allTokens = [
//   WhiteSpace,
//   SingleLineComment,
//   MultiLineComment,
//   // Jest tokens
//   Describe,
//   It,
//   Test,
//   Expect,
//   BeforeAll,
//   AfterAll,
//   BeforeEach,
//   AfterEach,
//   // TypeScript tokens
//   Let,
//   Const,
//   Function,
//   Interface,
//   Class,
//   Import,
//   Export,
//   // Common tokens
//   Identifier,
//   StringLiteral,
//   NumberLiteral,
//   Arrow,
//   LParen,
//   RParen,
//   LCurly,
//   RCurly,
//   Semicolon,
//   Colon,
//   Comma,
//   Dot,
//   // Operators
//   Plus,
//   Minus,
//   Multiply,
//   Divide,
//   Equals,
// ];

// // 3. Create lexer
// export const JestAlchemylexer = new lexer(allTokens);
console.log('Hello');
