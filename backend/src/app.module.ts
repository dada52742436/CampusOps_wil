import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    // ConfigModule 让整个应用都能通过 process.env 读取 .env 变量
    ConfigModule.forRoot({ isGlobal: true }),
    // PrismaModule 是 @Global()，注册一次后所有模块都能注入 PrismaService
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
