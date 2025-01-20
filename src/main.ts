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
  const tokens = await compilerService.compile(gherkinInput);
  console.log(tokens);
  await app.listen(3003);
}
bootstrap();
