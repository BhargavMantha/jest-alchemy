import { NestFactory } from '@nestjs/core';
import { LexerService } from './compiler/lexer.service';
import { AppModule } from './app.module';

const inputCode = `
  describe('My Test Suite', () => {
    it('should work', () => {
      expect(2 + 2).toBe(4);
    });
  });
`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const lexerService = app.get<LexerService>(LexerService);
  const tokens = await lexerService.tokenize(inputCode);
  console.log(tokens);
  await app.listen(3000);
}
bootstrap();
