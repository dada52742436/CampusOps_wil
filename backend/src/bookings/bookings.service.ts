import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BookingStatus } from './booking-status.enum.js';
import type { CreateBookingDto } from './dto/create-booking.dto.js';

@Injectable()
export class BookingsService {
  constructor(private readonly prismaService: PrismaService) {}

  // ── CREATE ────────────────────────────────────────────────────────────────
  // A buyer submits a booking request for a listing.
  // Guards (in order):
  //   1. Listing must exist                          → 404
  //   2. Buyer must not be the listing owner         → 400
  //   3. Buyer must not already have a booking here  → 409
  async create(listingId: number, buyerId: number, dto: CreateBookingDto) {
    // 1. Verify the listing exists
    const listing = await this.prismaService.prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) {
      throw new NotFoundException(`Listing #${listingId} not found`);
    }

    // 2. A user cannot book their own listing
    if (listing.ownerId === buyerId) {
      throw new BadRequestException('You cannot book your own listing');
    }

    // 3. Enforce one booking per buyer per listing (mirrors the DB @@unique)
    const existing = await this.prismaService.prisma.booking.findUnique({
      where: { listingId_buyerId: { listingId, buyerId } },
    });
    if (existing) {
      throw new ConflictException(
        'You already have a booking for this listing',
      );
    }

    return this.prismaService.prisma.booking.create({
      data: {
        listingId,
        buyerId,
        message: dto.message,
        // status defaults to BookingStatus.pending via schema default
      },
      include: {
        listing: { select: { id: true, title: true } },
        buyer:   { select: { id: true, username: true } },
      },
    });
  }

  // ── GET MY BOOKINGS (buyer view) ──────────────────────────────────────────
  // Returns all bookings the authenticated user has submitted as a buyer,
  // newest first, with basic listing info attached.
  findByBuyer(buyerId: number) {
    return this.prismaService.prisma.booking.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: { id: true, title: true, price: true, location: true },
        },
      },
    });
  }

  // ── GET BOOKINGS FOR A LISTING (seller view) ──────────────────────────────
  // Returns all bookings received on a specific listing.
  // Only the listing owner (seller) is allowed to view these.
  async findByListing(listingId: number, sellerId: number) {
    // Verify the listing exists before the ownership check
    const listing = await this.prismaService.prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) {
      throw new NotFoundException(`Listing #${listingId} not found`);
    }

    // Only the owner may see who has booked their listing
    if (listing.ownerId !== sellerId) {
      throw new ForbiddenException('You do not own this listing');
    }

    return this.prismaService.prisma.booking.findMany({
      where: { listingId },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { id: true, username: true } },
      },
    });
  }

  // ── UPDATE STATUS ─────────────────────────────────────────────────────────
  // Moves a booking through its lifecycle.
  //
  // Allowed transitions:
  //   Seller → accepted | rejected   (from pending only)
  //   Buyer  → cancelled             (from pending only)
  //
  // Any other actor or transition returns a 4xx error.
  async updateStatus(
    id: number,
    newStatus: BookingStatus,
    requesterId: number,
  ) {
    const booking = await this.prismaService.prisma.booking.findUnique({
      where: { id },
      include: { listing: true },
    });
    if (!booking) {
      throw new NotFoundException(`Booking #${id} not found`);
    }

    // Only pending bookings can be acted upon — all other states are terminal
    if (booking.status !== BookingStatus.pending) {
      throw new BadRequestException(
        `Booking is already '${booking.status}' and cannot be changed`,
      );
    }

    const isSeller = booking.listing.ownerId === requesterId;
    const isBuyer  = booking.buyerId === requesterId;

    // Requester must be a party to this booking
    if (!isSeller && !isBuyer) {
      throw new ForbiddenException('You are not a party to this booking');
    }

    // Validate the transition is allowed for the requester's role
    // Typed as BookingStatus[] so that .includes(newStatus) accepts the full enum type
    const sellerTransitions: BookingStatus[] = [BookingStatus.accepted, BookingStatus.rejected];
    const buyerTransitions: BookingStatus[]  = [BookingStatus.cancelled];

    if (isSeller && !sellerTransitions.includes(newStatus)) {
      throw new BadRequestException(
        'Sellers can only set status to accepted or rejected',
      );
    }
    if (isBuyer && !buyerTransitions.includes(newStatus)) {
      throw new BadRequestException(
        'Buyers can only set status to cancelled',
      );
    }

    return this.prismaService.prisma.booking.update({
      where: { id },
      data: { status: newStatus },
      include: {
        listing: { select: { id: true, title: true } },
        buyer:   { select: { id: true, username: true } },
      },
    });
  }
}
