import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { BookingsController } from './bookings.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

// BookingsModule wires together the service and controller for the /bookings
// and /listings/:id/bookings routes. PrismaModule is imported so the service
// can access the database via PrismaService.
@Module({
  imports: [PrismaModule],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
