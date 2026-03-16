import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // Prisma 7 使用组合模式（composition），而非继承（extends PrismaClient）
  // 原因：Prisma 7 必须通过 adapter 注入驱动，不能直接 new PrismaClient()
  readonly prisma: PrismaClient;

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    this.prisma = new PrismaClient({ adapter });
  }

  // NestJS 模块启动时，自动连接数据库
  async onModuleInit(): Promise<void> {
    await this.prisma.$connect();
  }

  // NestJS 模块销毁时（如关闭服务器），自动断开连接，防止连接池泄漏
  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
