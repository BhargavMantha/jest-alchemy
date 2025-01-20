import { Module } from '@nestjs/common';
import { LexerService } from './lexer.service';
import { CompilerService } from './compiler.service';
import { GherkinToJestGenerator } from './gherkin-to-jest-generator.class';
import { ASTTransformer } from './ast/ast-transformer.class';
import { JestParser } from './jest-parser.class';

@Module({
  providers: [LexerService, CompilerService, GherkinToJestGenerator, ASTTransformer, JestParser],
  exports: [CompilerService],
})
export class CompilerModule {}
