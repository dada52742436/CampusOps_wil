import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProtectedController } from './protected/protected.controller.js';
import { ListingsModule } from './listings/listings.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ListingsModule, // Listing CRUD module
  ],
  controllers: [AppController, ProtectedController],
  providers: [AppService],
})
export class AppModule {}
