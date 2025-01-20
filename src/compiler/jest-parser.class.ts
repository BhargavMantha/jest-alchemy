import { IToken } from 'chevrotain';
import { CreateTokenLexer } from './lexer.service';

export class JestParserInternal {
  private parser: any;
  private tokenMap: any;
  private debugLevel = 2;

  private debug(level: number, ...args: any[]) {
    if (level <= this.debugLevel) {
      const padding = '  '.repeat(level);
      console.log(padding, ...args);
    }
  }

  private logRuleEntry(ruleName: string, token: any) {
    this.debug(1, `\nEntering rule: ${ruleName}`);
    if (token?.image) {
      this.debug(2, `Current token: ${token.image} (${token.tokenType?.name})`);
    } else {
      this.debug(2, 'No current token');
    }
  }

  private logRuleExit(ruleName: string, result: any) {
    this.debug(1, `Exiting rule: ${ruleName}`);
    this.debug(2, `Result:`, JSON.stringify(result, null, 2));
  }

  async initialize() {
    console.log('\nInitializing parser...');
    const module = await (eval(`import('chevrotain')`) as Promise<any>);
    const { CstParser } = module;
    const { tokenMap, allTokens } = await CreateTokenLexer();
    this.tokenMap = tokenMap;

    class JestParser extends CstParser {
      constructor(tokenMap: any, debugInstance: JestParserInternal) {
        super(allTokens, {
          recoveryEnabled: true,
          maxLookahead: 1,
        });
        console.log('Creating parser instance with token map...');

        const $ = this;

        $.RULE('program', () => {
          debugInstance.logRuleEntry('program', $.LA(1));
          const children: any = {};

          children.describeBlock = $.SUBRULE($.describeBlock);

          debugInstance.logRuleExit('program', children);
          return children;
        });

        $.RULE('describeBlock', () => {
          debugInstance.logRuleEntry('describeBlock', $.LA(1));
          const children: any = {};

          try {
            children.describe = $.CONSUME(tokenMap.Describe);
            debugInstance.debug(2, 'Consumed describe token');

            children.lparen = $.CONSUME(tokenMap.LParen);
            children.description = $.CONSUME(tokenMap.StringLiteral);
            children.comma = $.CONSUME(tokenMap.Comma);
            children.body = $.SUBRULE($.arrowFunction);
            children.rparen = $.CONSUME(tokenMap.RParen);
            children.semicolon = $.CONSUME(tokenMap.Semicolon);

            debugInstance.debug(2, 'Successfully parsed describe block');
          } catch (error) {
            debugInstance.debug(1, 'Error in describe block:', error);
            throw error;
          }

          debugInstance.logRuleExit('describeBlock', children);
          return children;
        });

        $.RULE('arrowFunction', () => {
          debugInstance.logRuleEntry('arrowFunction', $.LA(1));
          const children: any = {
            isAsync: false,
            params: [],
            body: null,
          };

          $.OPTION(() => {
            children.isAsync = true;
            $.CONSUME(tokenMap.Async);
          });

          $.CONSUME(tokenMap.LParen);
          $.CONSUME(tokenMap.RParen);
          $.CONSUME(tokenMap.Arrow);
          children.body = $.SUBRULE($.blockStatement);

          debugInstance.logRuleExit('arrowFunction', children);
          return children;
        });

        $.RULE('blockStatement', () => {
          debugInstance.logRuleEntry('blockStatement', $.LA(1));
          const children: any = {
            statements: [],
          };

          $.CONSUME(tokenMap.LCurly);

          $.MANY(() => {
            $.OR([
              {
                ALT: () => {
                  debugInstance.debug(2, 'Processing it statement');
                  children.statements.push($.SUBRULE($.itStatement));
                },
              },
              {
                ALT: () => {
                  debugInstance.debug(2, 'Processing variable declaration');
                  children.statements.push($.SUBRULE($.variableDeclaration));
                },
              },
              {
                ALT: () => {
                  debugInstance.debug(2, 'Processing expression statement');
                  children.statements.push($.SUBRULE($.expressionStatement));
                },
              },
            ]);
          });

          $.CONSUME(tokenMap.RCurly);

          debugInstance.logRuleExit('blockStatement', children);
          return children;
        });

        $.RULE('parameterList', () => {
          debugInstance.logRuleEntry('parameterList', $.LA(1));
          const children: any = {
            params: [],
          };

          children.params.push($.CONSUME(tokenMap.Identifier));
          $.MANY(() => {
            $.CONSUME(tokenMap.Comma);
            children.params.push($.CONSUME2(tokenMap.Identifier));
          });

          debugInstance.logRuleExit('parameterList', children);
          return children;
        });

        $.RULE('itStatement', () => {
          debugInstance.logRuleEntry('itStatement', $.LA(1));
          const children: any = {
            description: null,
            body: null,
          };

          $.CONSUME(tokenMap.It);
          debugInstance.debug(2, 'Found it token');

          $.CONSUME(tokenMap.LParen);
          children.description = $.CONSUME(tokenMap.StringLiteral);
          $.CONSUME(tokenMap.Comma);
          children.body = $.SUBRULE($.arrowFunction);
          $.CONSUME(tokenMap.RParen);
          $.CONSUME(tokenMap.Semicolon);

          debugInstance.logRuleExit('itStatement', children);
          return children;
        });

        $.RULE('expressionStatement', () => {
          debugInstance.logRuleEntry('expressionStatement', $.LA(1));
          const children: any = {
            expression: null,
          };

          children.expression = $.SUBRULE($.expression);
          debugInstance.debug(2, 'Processing expression');
          $.CONSUME(tokenMap.Semicolon);

          debugInstance.logRuleExit('expressionStatement', children);
          return children;
        });

        $.RULE('expression', () => {
          debugInstance.logRuleEntry('expression', $.LA(1));
          const children: any = {
            isAwait: false,
            expression: null,
            chainedCalls: [],
          };

          $.OPTION(() => {
            children.isAwait = true;
            $.CONSUME(tokenMap.Await);
            debugInstance.debug(2, 'Found await keyword');
          });

          children.expression = $.SUBRULE($.primaryExpression);

          $.MANY(() => {
            const chainedCall = {
              property: null,
              args: null,
            };

            $.CONSUME(tokenMap.Dot);
            chainedCall.property = $.CONSUME(tokenMap.Identifier);
            debugInstance.debug(2, `Found chained call: ${chainedCall.property.image}`);

            $.OPTION2(() => {
              chainedCall.args = $.SUBRULE($.callExpression);
            });

            children.chainedCalls.push(chainedCall);
          });

          debugInstance.logRuleExit('expression', children);
          return children;
        });

        $.RULE('primaryExpression', () => {
          debugInstance.logRuleEntry('primaryExpression', $.LA(1));
          const children: any = {
            value: null,
            callArgs: null,
          };

          $.OR([
            {
              ALT: () => {
                debugInstance.debug(2, 'Processing identifier');
                children.value = $.CONSUME(tokenMap.Identifier);
                $.OPTION(() => {
                  children.callArgs = $.SUBRULE($.callExpression);
                });
              },
            },
            {
              ALT: () => {
                debugInstance.debug(2, 'Processing string literal');
                children.value = $.CONSUME(tokenMap.StringLiteral);
              },
            },
            {
              ALT: () => {
                debugInstance.debug(2, 'Processing number literal');
                children.value = $.CONSUME(tokenMap.NumberLiteral);
              },
            },
            {
              ALT: () => {
                debugInstance.debug(2, 'Processing boolean literal');
                children.value = $.CONSUME(tokenMap.BooleanLiteral);
              },
            },
            {
              ALT: () => {
                debugInstance.debug(2, 'Processing object literal');
                children.value = $.SUBRULE($.objectLiteral);
              },
            },
          ]);

          debugInstance.logRuleExit('primaryExpression', children);
          return children;
        });

        $.RULE('callExpression', () => {
          debugInstance.logRuleEntry('callExpression', $.LA(1));
          const children: any = {
            args: [],
          };

          $.CONSUME(tokenMap.LParen);
          $.OPTION(() => {
            children.args = $.SUBRULE($.argumentList);
          });
          $.CONSUME(tokenMap.RParen);

          debugInstance.logRuleExit('callExpression', children);
          return children;
        });

        $.RULE('argumentList', () => {
          debugInstance.logRuleEntry('argumentList', $.LA(1));
          const children: any = {
            args: [],
          };

          children.args.push($.SUBRULE($.expression));
          $.MANY(() => {
            $.CONSUME(tokenMap.Comma);
            children.args.push($.SUBRULE2($.expression));
          });

          debugInstance.logRuleExit('argumentList', children);
          return children;
        });

        $.RULE('objectLiteral', () => {
          debugInstance.logRuleEntry('objectLiteral', $.LA(1));
          const children: any = {
            properties: [],
          };

          $.CONSUME(tokenMap.LCurly);
          $.OPTION(() => {
            children.properties = $.SUBRULE($.propertyList);
          });
          $.CONSUME(tokenMap.RCurly);

          debugInstance.logRuleExit('objectLiteral', children);
          return children;
        });

        $.RULE('propertyList', () => {
          debugInstance.logRuleEntry('propertyList', $.LA(1));
          const children: any = {
            properties: [],
          };

          children.properties.push($.SUBRULE($.property));
          $.MANY(() => {
            $.CONSUME(tokenMap.Comma);
            children.properties.push($.SUBRULE2($.property));
          });

          debugInstance.logRuleExit('propertyList', children);
          return children;
        });

        $.RULE('property', () => {
          debugInstance.logRuleEntry('property', $.LA(1));
          const children: any = {
            key: null,
            value: null,
          };

          children.key = $.CONSUME(tokenMap.Identifier);
          debugInstance.debug(2, `Processing property key: ${children.key.image}`);

          $.CONSUME(tokenMap.Colon);
          children.value = $.SUBRULE($.expression);

          debugInstance.logRuleExit('property', children);
          return children;
        });

        $.RULE('variableDeclaration', () => {
          debugInstance.logRuleEntry('variableDeclaration', $.LA(1));
          const children: any = {
            kind: null,
            name: null,
            initializer: null,
          };

          $.OR([
            {
              ALT: () => {
                debugInstance.debug(2, 'Processing let declaration');
                children.kind = 'let';
                $.CONSUME(tokenMap.Let);
              },
            },
            {
              ALT: () => {
                debugInstance.debug(2, 'Processing const declaration');
                children.kind = 'const';
                $.CONSUME(tokenMap.Const);
              },
            },
          ]);

          children.name = $.CONSUME(tokenMap.Identifier);
          debugInstance.debug(2, `Variable name: ${children.name.image}`);

          $.OPTION(() => {
            $.CONSUME(tokenMap.Equals);
            children.initializer = $.SUBRULE($.expression);
          });

          $.CONSUME(tokenMap.Semicolon);
          debugInstance.logRuleExit('variableDeclaration', children);
          return children;
        });

        console.log('Performing self-analysis on parser...');
        this.performSelfAnalysis();
        console.log('Parser initialization complete');
      }
    }

    this.parser = new JestParser(this.tokenMap, this);
    return this.parser;
  }

  async parse(tokens: IToken[]) {
    try {
      console.log('\n=== Starting parsing process ===');

      if (!this.parser) {
        console.log('Parser not initialized, initializing...');
        await this.initialize();
      }

      if (!tokens?.length) {
        throw new Error('No tokens provided for parsing');
      }

      console.log(`\nProcessing ${tokens.length} tokens...`);
      console.log(
        'First few tokens:',
        tokens.slice(0, 3).map(t => ({
          type: t.tokenType?.name,
          image: t.image,
        })),
      );

      this.parser.input = tokens;

      console.log('\nStarting program rule parsing...');
      const cst = this.parser.program();

      if (this.parser.errors.length > 0) {
        console.error('\nParser encountered errors:', this.parser.errors);
        this.debug(1, 'Detailed errors:', JSON.stringify(this.parser.errors, null, 2));
        if (!cst) {
          throw new Error('Parsing failed completely');
        }
      }

      console.log('\nParse completed successfully');
      return {
        name: 'program',
        children: cst,
      };
    } catch (error) {
      console.error('\nCritical parser error:', error);
      throw error;
    }
  }
}

export class JestParser {
  private parserInstance: JestParserInternal;

  constructor() {
    console.log('Creating JestParser wrapper instance');
    this.parserInstance = new JestParserInternal();
  }

  async parse(tokens: IToken[]) {
    return this.parserInstance.parse(tokens);
  }
}
