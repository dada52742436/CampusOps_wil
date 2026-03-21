import {
  Controller,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { ImagesService } from './images.service.js';
import type { User } from '../../../generated/prisma/client.js';

interface AuthenticatedRequest extends Request {
  user: User;
}

// Allowed MIME types — only common image formats
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@Controller('listings/:listingId/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  // ── POST /listings/:listingId/images ─────────────────────────────────────
  // Upload a single image for a listing (owner-only, JWT required).
  // Field name in the multipart form must be "file".
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file: Express.Multer.File, cb: (err: Error | null, name: string) => void) => {
          // e.g. listing-3-1711234567890.jpg — predictable, no collisions
          const req = _req as AuthenticatedRequest;
          const listingId = Array.isArray(req.params['listingId'])
            ? req.params['listingId'][0]
            : (req.params['listingId'] ?? 'unknown');
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `listing-${listingId}-${Date.now()}${ext}`);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only JPEG, PNG, and WebP images are allowed'), false);
        }
      },
    }),
  )
  uploadImage(
    @Param('listingId', ParseIntPipe) listingId: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded — use field name "file"');
    }
    return this.imagesService.addImage(listingId, req.user.id, file.filename);
  }

  // ── DELETE /listings/:listingId/images/:imageId ───────────────────────────
  // Delete a specific image from a listing (owner-only, JWT required).
  @Delete(':imageId')
  @UseGuards(JwtAuthGuard)
  removeImage(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.imagesService.removeImage(listingId, imageId, req.user.id);
  }
}
