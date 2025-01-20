import { Module } from '@nestjs/common';
import { LexerService } from './lexer.service';
import { CompilerService } from './compiler.service';
import { GherkinToJestGenerator } from './gherkin-to-jest-generator.class';
import { ASTTransformer } from './ast/ast-transformer.class';

@Module({
  providers: [LexerService, CompilerService, GherkinToJestGenerator, ASTTransformer],
  exports: [CompilerService],
})
export class CompilerModule {}
