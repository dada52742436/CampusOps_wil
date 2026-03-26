// Prevent ts-jest from loading PrismaService -> generated Prisma client.
jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class MockPrismaService {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  prisma: {
    listing: {
      findUnique: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
};

describe('BookingsService', () => {
  let service: BookingsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  it('rejects new bookings for a sold listing', async () => {
    mockPrismaService.prisma.listing.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 1,
      status: 'sold',
    });

    await expect(
      service.create(1, 2, { message: 'Can I inspect this piano?' }),
    ).rejects.toThrow(BadRequestException);

    expect(mockPrismaService.prisma.booking.create).not.toHaveBeenCalled();
  });

  it('rejects new bookings for an archived listing', async () => {
    mockPrismaService.prisma.listing.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 1,
      status: 'archived',
    });

    await expect(
      service.create(1, 2, { message: 'Interested in this listing.' }),
    ).rejects.toThrow(BadRequestException);

    expect(mockPrismaService.prisma.booking.create).not.toHaveBeenCalled();
  });
});
