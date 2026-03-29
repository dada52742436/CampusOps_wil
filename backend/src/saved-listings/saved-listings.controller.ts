import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import type { User } from '../../generated/prisma/client.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SavedListingsService } from './saved-listings.service.js';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('saved-listings')
@UseGuards(JwtAuthGuard)
export class SavedListingsController {
  constructor(private readonly savedListingsService: SavedListingsService) {}

  @Post(':listingId')
  save(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.savedListingsService.save(listingId, req.user.id);
  }

  @Get('mine')
  findMine(@Req() req: AuthenticatedRequest) {
    return this.savedListingsService.findMine(req.user.id);
  }

  @Delete(':listingId')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.savedListingsService.remove(listingId, req.user.id);
  }
}
