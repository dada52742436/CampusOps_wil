import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../../prisma/prisma.service.js';

const MAX_IMAGES_PER_LISTING = 5;

@Injectable()
export class ImagesService {
  constructor(private readonly prismaService: PrismaService) {}

  // ── ADD IMAGE ─────────────────────────────────────────────────────────────
  // Called after multer has already saved the file to disk.
  // Validates: listing exists, requester is owner, image count < 5.
  async addImage(listingId: number, requesterId: number, filename: string) {
    // Verify listing exists
    const listing = await this.prismaService.prisma.listing.findUnique({
      where: { id: listingId },
      include: { images: true },
    });
    if (!listing) {
      throw new NotFoundException(`Listing #${listingId} not found`);
    }

    // Only the owner may add images
    if (listing.ownerId !== requesterId) {
      throw new ForbiddenException('You do not own this listing');
    }

    // Enforce upload cap
    if (listing.images.length >= MAX_IMAGES_PER_LISTING) {
      throw new BadRequestException(
        `Maximum ${MAX_IMAGES_PER_LISTING} images per listing`,
      );
    }

    // order = current count so the new image goes to the end
    const order = listing.images.length;
    const url = `/uploads/${filename}`;

    return this.prismaService.prisma.listingImage.create({
      data: { listingId, url, order },
    });
  }

  // ── DELETE IMAGE ──────────────────────────────────────────────────────────
  // Removes the DB record and the file from disk.
  // Only the listing owner may delete images.
  async removeImage(listingId: number, imageId: number, requesterId: number) {
    // Verify image belongs to this listing
    const image = await this.prismaService.prisma.listingImage.findUnique({
      where: { id: imageId },
      include: { listing: true },
    });

    if (!image || image.listingId !== listingId) {
      throw new NotFoundException(`Image #${imageId} not found on listing #${listingId}`);
    }

    // Only the listing owner may remove images
    if (image.listing.ownerId !== requesterId) {
      throw new ForbiddenException('You do not own this listing');
    }

    // Delete DB record first — if file deletion fails the record is already gone,
    // which is acceptable (orphan file on disk). The reverse (file gone, record
    // stays) would be worse.
    await this.prismaService.prisma.listingImage.delete({ where: { id: imageId } });

    // Remove file from disk; ignore ENOENT (file already missing)
    const filename = image.url.replace('/uploads/', '');
    const filePath = join(process.cwd(), 'uploads', filename);
    await unlink(filePath).catch((err: NodeJS.ErrnoException) => {
      if (err.code !== 'ENOENT') throw err;
    });

    return { message: `Image #${imageId} deleted` };
  }
}
