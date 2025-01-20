import { Injectable } from '@nestjs/common';
import { parseGherkin } from './gherkin.parser';
import { LexerService } from './lexer.service';
import * as ts from 'typescript';
import { ASTTransformer } from './ast/ast-transformer.class';
import { GherkinToJestGenerator } from './gherkin-to-jest-generator.class';
import { JestParser } from './jest-parser.class';

@Injectable()
export class CompilerService {
  constructor(
    private lexerService: LexerService,
    private gherkinToJestGenerator: GherkinToJestGenerator,
    private jestParser: JestParser,
    private astTransformer: ASTTransformer,
  ) {}

  async compile(input: string): Promise<string> {
    try {
      // Parse Gherkin
      console.log('Parsing Gherkin input...');
      const gherkinEnvelopes = await parseGherkin(input);
      const gherkinDocumentEnvelope = gherkinEnvelopes.find(env => env.gherkinDocument != null);

      if (!gherkinDocumentEnvelope?.gherkinDocument) {
        throw new Error('No Gherkin document found');
      }

      // Generate Jest structure
      console.log('Generating Jest code...');
      const jestCode = this.gherkinToJestGenerator.generateTest(
        gherkinDocumentEnvelope.gherkinDocument,
      );
      console.log('\nGenerated Jest code:');
      console.log(jestCode);

      /*// Tokenize
      console.log('\nTokenizing Jest code...');
      const tokens = await this.lexerService.tokenize(jestCode);

      // Parse tokens
      console.log('Parsing tokens...');
      const cst = await this.jestParser.parse(tokens);
      console.log('\nCST generated:', JSON.stringify(cst, null, 2));

      // In compiler.service.ts
       try {
        console.log('\nTransforming to TypeScript AST...');
        const ast = await this.astTransformer.transformToTypeScript(cst);
        if (!ast) {
          throw new Error('AST transformation failed: No AST generated');
        }

        // Print result
        const result = this.printAST(ast);
        if (!result.trim()) {
          throw new Error('AST printing failed: Empty output');
        }

        console.log('\nFinal TypeScript output:');
        console.log(result);

        return result;
      } catch (error) {
        console.error('Error during compilation:', error);
        throw error;
      } */
      return jestCode;
    } catch (error) {
      console.error('Compilation error:', error);
      throw error;
    }
  }

  /* private printAST(ast: ts.Node): string {
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      removeComments: false,
      omitTrailingSemicolon: false,
    });

    const sourceFile = ts.createSourceFile(
      'generated.test.ts',
      '',
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS,
    );

    return printer.printNode(ts.EmitHint.Unspecified, ast, sourceFile);
  } */
}
