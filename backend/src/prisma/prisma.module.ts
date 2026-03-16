import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

// @Global() 让 PrismaModule 在整个应用中只需导入一次（在 AppModule 中）
// 其他模块（AuthModule、UsersModule）无需再次 import，可以直接注入 PrismaService
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
