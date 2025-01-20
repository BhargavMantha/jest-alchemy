import { Injectable } from '@nestjs/common';
import { parseGherkin } from './gherkin.parser';
import { LexerService } from './lexer.service';
import * as ts from 'typescript';
import { JestParser } from './jest-parser.class';
import { GherkinToJestGenerator } from './gherkin-to-jest-generator.class';
import { ASTTransformer } from './ast/ast-transformer.class';

@Injectable()
export class CompilerService {
  constructor(
    private lexerService: LexerService,
    private gherkinToJestGenerator: GherkinToJestGenerator,
    private astTransformer: ASTTransformer,
  ) {}

  async compile(input: string): Promise<string> {
    try {
      // Parse Gherkin
      const gherkinEnvelopes = await parseGherkin(input);
      const gherkinDocumentEnvelope = gherkinEnvelopes.find(env => env.gherkinDocument != null);

      if (!gherkinDocumentEnvelope?.gherkinDocument) {
        throw new Error('No Gherkin document found');
      }

      // Generate Jest structure
      const jestCode = this.gherkinToJestGenerator.generateTest(
        gherkinDocumentEnvelope.gherkinDocument,
      );

      // Tokenize
      const tokens = await this.lexerService.tokenize(jestCode);

      // Parse tokens
      const jestParser = new JestParser();
      const cst = await jestParser.parse(tokens);

      // Transform to TypeScript AST
      const ast = this.astTransformer.transformToTypeScript(cst);

      // Print result
      return this.printAST(ast);
    } catch (error) {
      console.error('Compilation error:', error);
      throw error;
    }
  }

  private printAST(node: ts.Node): string {
    // Create a source file for printing
    const resultFile = ts.createSourceFile(
      'generated.test.ts', // Use .test.ts extension for Jest files
      '',
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS,
    );

    // Create printer with formatting options
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      // Add formatting options
      removeComments: false,
      omitTrailingSemicolon: false,
    });

    // Print the AST node
    const result = printer.printNode(ts.EmitHint.Unspecified, node, resultFile);

    // Add Jest environment directive at the top if needed
    const jestEnvironment = '/** @jest-environment node */\n\n';

    // Return formatted code
    return jestEnvironment + result;
  }

  // Helper method to format the code with proper indentation
  private formatCode(code: string): string {
    return code
      .split('\n')
      .map(line => line.trim()) // Remove existing whitespace
      .map(line => {
        // Count the nesting level based on brackets
        const nestingLevel =
          (line.match(/[{(]/g) || []).length - (line.match(/[})]/g) || []).length;
        const indent = '  '.repeat(Math.max(0, nestingLevel));
        return indent + line;
      })
      .join('\n');
  }
}
