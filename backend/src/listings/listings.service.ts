import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Listing } from '../../generated/prisma/client.js';
import type { CreateListingDto } from './dto/create-listing.dto.js';
import type { UpdateListingDto } from './dto/update-listing.dto.js';

// Shape of a listing returned to the client — includes owner's public info
export interface ListingWithOwner extends Listing {
  owner: {
    id: number;
    username: string;
  };
}

@Injectable()
export class ListingsService {
  constructor(private readonly prismaService: PrismaService) {}

  // ── GET ALL ───────────────────────────────────────────────────────────────
  // Returns all listings, newest first, with the owner's public profile attached.
  // This is a public endpoint — no auth required.
  async findAll(): Promise<ListingWithOwner[]> {
    return this.prismaService.prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, username: true },
        },
      },
    });
  }

  // ── GET MINE ──────────────────────────────────────────────────────────────
  // Returns only the listings belonging to the authenticated user.
  async findByOwner(ownerId: number): Promise<ListingWithOwner[]> {
    return this.prismaService.prisma.listing.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, username: true },
        },
      },
    });
  }

  // ── GET ONE ───────────────────────────────────────────────────────────────
  // Returns a single listing by ID.
  // Throws 404 if not found — caller should not have to handle null.
  async findOne(id: number): Promise<ListingWithOwner> {
    const listing = await this.prismaService.prisma.listing.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, username: true },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException(`Listing #${id} not found`);
    }

    return listing;
  }

  // ── CREATE ────────────────────────────────────────────────────────────────
  // Creates a new listing and sets ownerId from the JWT-authenticated user.
  // The ownerId is injected by the controller from req.user — never from the request body.
  async create(dto: CreateListingDto, ownerId: number): Promise<ListingWithOwner> {
    return this.prismaService.prisma.listing.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        brand: dto.brand,
        condition: dto.condition,
        location: dto.location,
        ownerId,
      },
      include: {
        owner: {
          select: { id: true, username: true },
        },
      },
    });
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────
  // Updates an existing listing.
  // Ownership check: throws 403 if the authenticated user is not the owner.
  async update(
    id: number,
    dto: UpdateListingDto,
    requesterId: number,
  ): Promise<ListingWithOwner> {
    // First verify the listing exists (throws 404 if not)
    const listing = await this.findOne(id);

    // Authorization check: only the owner may edit their own listing
    if (listing.ownerId !== requesterId) {
      throw new ForbiddenException('You are not allowed to edit this listing');
    }

    return this.prismaService.prisma.listing.update({
      where: { id },
      data: {
        // Only include fields that were actually sent — undefined values are ignored by Prisma
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.brand !== undefined && { brand: dto.brand }),
        ...(dto.condition !== undefined && { condition: dto.condition }),
        ...(dto.location !== undefined && { location: dto.location }),
      },
      include: {
        owner: {
          select: { id: true, username: true },
        },
      },
    });
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  // Deletes a listing.
  // Ownership check: throws 403 if the authenticated user is not the owner.
  async remove(id: number, requesterId: number): Promise<{ message: string }> {
    // First verify the listing exists (throws 404 if not)
    const listing = await this.findOne(id);

    // Authorization check: only the owner may delete their own listing
    if (listing.ownerId !== requesterId) {
      throw new ForbiddenException('You are not allowed to delete this listing');
    }

    await this.prismaService.prisma.listing.delete({ where: { id } });

    return { message: `Listing #${id} deleted successfully` };
  }
}
