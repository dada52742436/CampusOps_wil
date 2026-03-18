import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller.js';
import { ListingsService } from './listings.service.js';

// PrismaModule is @Global(), so PrismaService is available here without importing PrismaModule again.
// AuthModule is also global for JwtAuthGuard — no extra import needed.
@Module({
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
