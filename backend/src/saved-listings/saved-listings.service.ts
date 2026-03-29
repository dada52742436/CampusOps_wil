import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SavedListingsService {
  constructor(private readonly prismaService: PrismaService) {}

  async save(listingId: number, userId: number) {
    const listing = await this.prismaService.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException(`Listing #${listingId} not found`);
    }

    if (listing.ownerId === userId) {
      throw new BadRequestException('You cannot save your own listing');
    }

    const existing = await this.prismaService.prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Listing is already saved');
    }

    return this.prismaService.prisma.savedListing.create({
      data: {
        userId,
        listingId,
      },
      include: {
        listing: {
          include: {
            owner: { select: { id: true, username: true } },
            images: { orderBy: { order: 'asc' } },
          },
        },
      },
    });
  }

  findMine(userId: number) {
    return this.prismaService.prisma.savedListing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: {
            owner: { select: { id: true, username: true } },
            images: { orderBy: { order: 'asc' } },
          },
        },
      },
    });
  }

  async remove(listingId: number, userId: number) {
    const savedListing = await this.prismaService.prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (!savedListing) {
      throw new NotFoundException('Saved listing not found');
    }

    await this.prismaService.prisma.savedListing.delete({
      where: { id: savedListing.id },
    });

    return { message: `Listing #${listingId} removed from saved listings` };
  }
}
