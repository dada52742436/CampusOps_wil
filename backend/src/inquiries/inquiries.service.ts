import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListingStatus } from '../listings/listing-status.enum.js';
import type { CreateInquiryDto } from './dto/create-inquiry.dto.js';
import { InquiryStatus } from './inquiry-status.enum.js';

@Injectable()
export class InquiriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(listingId: number, requesterId: number, dto: CreateInquiryDto) {
    const listing = await this.prismaService.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException(`Listing #${listingId} not found`);
    }

    if (listing.ownerId === requesterId) {
      throw new BadRequestException('You cannot inquire about your own listing');
    }

    if (listing.status !== ListingStatus.active) {
      throw new BadRequestException(
        'Only active listings can receive inquiries',
      );
    }

    const existingInquiry = await this.prismaService.prisma.inquiry.findUnique({
      where: {
        listingId_requesterId: {
          listingId,
          requesterId,
        },
      },
    });

    if (existingInquiry) {
      throw new ConflictException(
        'You have already sent an inquiry for this listing',
      );
    }

    return this.prismaService.prisma.inquiry.create({
      data: {
        listingId,
        requesterId,
        message: dto.message,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            status: true,
            owner: { select: { id: true, username: true } },
          },
        },
        requester: {
          select: { id: true, username: true },
        },
      },
    });
  }

  findMine(requesterId: number) {
    return this.prismaService.prisma.inquiry.findMany({
      where: { requesterId },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            location: true,
            status: true,
            owner: { select: { id: true, username: true } },
          },
        },
      },
    });
  }

  async findByListing(listingId: number, sellerId: number) {
    const listing = await this.prismaService.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException(`Listing #${listingId} not found`);
    }

    if (listing.ownerId !== sellerId) {
      throw new ForbiddenException('You do not own this listing');
    }

    return this.prismaService.prisma.inquiry.findMany({
      where: { listingId },
      orderBy: { createdAt: 'desc' },
      include: {
        requester: {
          select: { id: true, username: true },
        },
      },
    });
  }

  async updateStatus(id: number, status: InquiryStatus, requesterId: number) {
    const inquiry = await this.prismaService.prisma.inquiry.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!inquiry) {
      throw new NotFoundException(`Inquiry #${id} not found`);
    }

    const isSeller = inquiry.listing.ownerId === requesterId;
    const isBuyer = inquiry.requesterId === requesterId;

    if (!isSeller && !isBuyer) {
      throw new ForbiddenException('You are not a party to this inquiry');
    }

    if (status !== InquiryStatus.closed) {
      throw new BadRequestException('Inquiries can only be moved to closed');
    }

    if (inquiry.status !== InquiryStatus.open) {
      throw new BadRequestException(
        `Inquiry is already '${inquiry.status}' and cannot be changed`,
      );
    }

    return this.prismaService.prisma.inquiry.update({
      where: { id },
      data: { status },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            status: true,
            owner: { select: { id: true, username: true } },
          },
        },
        requester: {
          select: { id: true, username: true },
        },
      },
    });
  }
}
