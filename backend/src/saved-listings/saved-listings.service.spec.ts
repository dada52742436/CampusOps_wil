jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class MockPrismaService {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SavedListingsService } from './saved-listings.service';

const mockPrismaService = {
  prisma: {
    listing: {
      findUnique: jest.fn(),
    },
    savedListing: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  },
};

describe('SavedListingsService', () => {
  let service: SavedListingsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedListingsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SavedListingsService>(SavedListingsService);
  });

  it('saves a listing for a user', async () => {
    mockPrismaService.prisma.listing.findUnique.mockResolvedValue({
      id: 10,
      ownerId: 1,
    });
    mockPrismaService.prisma.savedListing.findUnique.mockResolvedValue(null);
    mockPrismaService.prisma.savedListing.create.mockResolvedValue({
      id: 1,
      userId: 2,
      listingId: 10,
    });

    const result = await service.save(10, 2);

    expect(result).toMatchObject({
      id: 1,
      userId: 2,
      listingId: 10,
    });
  });

  it('rejects saving your own listing', async () => {
    mockPrismaService.prisma.listing.findUnique.mockResolvedValue({
      id: 10,
      ownerId: 2,
    });

    await expect(service.save(10, 2)).rejects.toThrow(BadRequestException);
    expect(mockPrismaService.prisma.savedListing.create).not.toHaveBeenCalled();
  });

  it('rejects duplicate saved listings', async () => {
    mockPrismaService.prisma.listing.findUnique.mockResolvedValue({
      id: 10,
      ownerId: 1,
    });
    mockPrismaService.prisma.savedListing.findUnique.mockResolvedValue({
      id: 5,
      userId: 2,
      listingId: 10,
    });

    await expect(service.save(10, 2)).rejects.toThrow(ConflictException);
  });

  it('returns saved listings for the current user', async () => {
    mockPrismaService.prisma.savedListing.findMany.mockResolvedValue([
      { id: 1, listingId: 10, userId: 2 },
    ]);

    const result = await service.findMine(2);

    expect(result).toHaveLength(1);
    expect(mockPrismaService.prisma.savedListing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 2 },
      }),
    );
  });

  it('removes a saved listing', async () => {
    mockPrismaService.prisma.savedListing.findUnique.mockResolvedValue({
      id: 11,
      userId: 2,
      listingId: 10,
    });

    const result = await service.remove(10, 2);

    expect(result.message).toContain('removed from saved listings');
    expect(mockPrismaService.prisma.savedListing.delete).toHaveBeenCalledWith({
      where: { id: 11 },
    });
  });

  it('throws when removing a missing saved listing', async () => {
    mockPrismaService.prisma.savedListing.findUnique.mockResolvedValue(null);

    await expect(service.remove(10, 2)).rejects.toThrow(NotFoundException);
  });
});
