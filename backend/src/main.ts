import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 允许前端开发服务器（localhost:3000）跨域访问
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // 全局启用 DTO 校验管道
  // whitelist: true  — 自动过滤掉 DTO 中未声明的多余字段，防止恶意注入
  // forbidNonWhitelisted: true — 遇到多余字段时直接报错，而非静默忽略
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
