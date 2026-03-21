import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto.js';
import type { User } from '../../generated/prisma/client.js';

// Extend Express Request to type req.user injected by JwtStrategy
interface AuthenticatedRequest extends Request {
  user: User;
}

// Routes are declared without a shared @Controller prefix so we can use two
// different URL patterns: /listings/:id/bookings and /bookings/...
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ── POST /listings/:listingId/bookings ────────────────────────────────────
  // Buyer creates a booking request for a specific listing.
  // listingId comes from the URL; buyerId comes from the JWT — never from body.
  @Post('listings/:listingId/bookings')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Body() dto: CreateBookingDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bookingsService.create(listingId, req.user.id, dto);
  }

  // ── GET /bookings/mine ────────────────────────────────────────────────────
  // Buyer views all bookings they have submitted, with listing info attached.
  @Get('bookings/mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: AuthenticatedRequest) {
    return this.bookingsService.findByBuyer(req.user.id);
  }

  // ── GET /listings/:listingId/bookings ─────────────────────────────────────
  // Seller views all booking requests on one of their listings.
  // Service will throw 403 if the requester is not the listing owner.
  @Get('listings/:listingId/bookings')
  @UseGuards(JwtAuthGuard)
  findByListing(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bookingsService.findByListing(listingId, req.user.id);
  }

  // ── PATCH /bookings/:id/status ────────────────────────────────────────────
  // Buyer or seller updates the booking status.
  // Service enforces which transitions each role is allowed to make.
  @Patch('bookings/:id/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bookingsService.updateStatus(id, dto.status, req.user.id);
  }
}
