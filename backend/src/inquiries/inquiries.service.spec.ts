jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class MockPrismaService {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InquiriesService } from './inquiries.service';

const mockPrismaService = {
  prisma: {
    listing: {
      findUnique: jest.fn(),
    },
    inquiry: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
};

describe('InquiriesService', () => {
  let service: InquiriesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InquiriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InquiriesService>(InquiriesService);
  });

  it('creates an inquiry for a valid requester', async () => {
    mockPrismaService.prisma.listing.findUnique.mockResolvedValue({
      id: 10,
      ownerId: 1,
      status: 'active',
    });
    mockPrismaService.prisma.inquiry.findUnique.mockResolvedValue(null);
    mockPrismaService.prisma.inquiry.create.mockResolvedValue({
      id: 50,
      listingId: 10,
      requesterId: 2,
      status: 'open',
      message: 'Is this piano still available?',
    });

    const result = await service.create(10, 2, {
      message: 'Is this piano still available?',
    });

    expect(result).toMatchObject({
      id: 50,
      listingId: 10,
      requesterId: 2,
      status: 'open',
    });
  });

  it('rejects inquiries for missing listings', async () => {
    mockPrismaService.prisma.listing.findUnique.mockResolvedValue(null);

    await expect(
      service.create(999, 2, { message: 'Interested buyer message.' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects inquiries on your own listing', async () => {
    mockPrismaService.prisma.listing.findUnique.mockResolvedValue({
      id: 10,
      ownerId: 2,
      status: 'active',
    });

    await expect(
      service.create(10, 2, { message: 'Trying to message myself.' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects inquiries for non-active listings', async () => {
    mockPrismaService.prisma.listing.findUnique.mockResolvedValue({
      id: 10,
      ownerId: 1,
      status: 'sold',
    });

    await expect(
      service.create(10, 2, { message: 'Interested in a sold piano.' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects duplicate inquiries for the same listing', async () => {
    mockPrismaService.prisma.listing.findUnique.mockResolvedValue({
      id: 10,
      ownerId: 1,
      status: 'active',
    });
    mockPrismaService.prisma.inquiry.findUnique.mockResolvedValue({
      id: 88,
      listingId: 10,
      requesterId: 2,
    });

    await expect(
      service.create(10, 2, { message: 'Following up on this listing.' }),
    ).rejects.toThrow(ConflictException);
  });

  it('returns inquiries sent by the current requester', async () => {
    mockPrismaService.prisma.inquiry.findMany.mockResolvedValue([
      { id: 1, requesterId: 2, listingId: 10 },
    ]);

    const result = await service.findMine(2);

    expect(result).toHaveLength(1);
    expect(mockPrismaService.prisma.inquiry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { requesterId: 2 },
      }),
    );
  });

  it('prevents non-owners from viewing listing inquiries', async () => {
    mockPrismaService.prisma.listing.findUnique.mockResolvedValue({
      id: 10,
      ownerId: 1,
    });

    await expect(service.findByListing(10, 99)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows the listing owner to close an open inquiry', async () => {
    mockPrismaService.prisma.inquiry.findUnique.mockResolvedValue({
      id: 77,
      requesterId: 2,
      status: 'open',
      listing: { id: 10, ownerId: 1 },
    });
    mockPrismaService.prisma.inquiry.update.mockResolvedValue({
      id: 77,
      status: 'closed',
    });

    const result = await service.updateStatus(77, 'closed' as never, 1);

    expect(result).toMatchObject({
      id: 77,
      status: 'closed',
    });
    expect(mockPrismaService.prisma.inquiry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 77 },
        data: { status: 'closed' },
      }),
    );
  });

  it('allows the requester to close their own open inquiry', async () => {
    mockPrismaService.prisma.inquiry.findUnique.mockResolvedValue({
      id: 77,
      requesterId: 2,
      status: 'open',
      listing: { id: 10, ownerId: 1 },
    });
    mockPrismaService.prisma.inquiry.update.mockResolvedValue({
      id: 77,
      status: 'closed',
    });

    const result = await service.updateStatus(77, 'closed' as never, 2);

    expect(result.status).toBe('closed');
  });

  it('rejects inquiry status changes from unrelated users', async () => {
    mockPrismaService.prisma.inquiry.findUnique.mockResolvedValue({
      id: 77,
      requesterId: 2,
      status: 'open',
      listing: { id: 10, ownerId: 1 },
    });

    await expect(service.updateStatus(77, 'closed' as never, 99)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rejects reopening an inquiry', async () => {
    mockPrismaService.prisma.inquiry.findUnique.mockResolvedValue({
      id: 77,
      requesterId: 2,
      status: 'open',
      listing: { id: 10, ownerId: 1 },
    });

    await expect(service.updateStatus(77, 'open' as never, 1)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects changing an inquiry that is already closed', async () => {
    mockPrismaService.prisma.inquiry.findUnique.mockResolvedValue({
      id: 77,
      requesterId: 2,
      status: 'closed',
      listing: { id: 10, ownerId: 1 },
    });

    await expect(service.updateStatus(77, 'closed' as never, 1)).rejects.toThrow(
      BadRequestException,
    );
  });
});
