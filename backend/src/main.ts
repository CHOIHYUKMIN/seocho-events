import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 활성화
  app.enableCors();

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
}
bootstrap();
