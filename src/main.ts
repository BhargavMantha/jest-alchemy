import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CompilerService } from './compiler/compiler.service';

const gherkinInput = `
Feature: User Authentication
Scenario: Successful user login
Given a registered user exists
When the user enters valid credentials
Then the user should be logged in
`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const compilerService = app.get<CompilerService>(CompilerService);

  try {
    const compiledCode = await compilerService.compile(gherkinInput);

    console.log('\nGenerated TypeScript Test Code:');
    console.log('================================');
    console.log(compiledCode);
    console.log('================================\n');
  } catch (error) {
    console.error('Compilation failed:', error);
  }

  await app.listen(3003);
}

bootstrap();
