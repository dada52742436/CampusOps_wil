import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import type { User } from '../../generated/prisma/client.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateInquiryDto } from './dto/create-inquiry.dto.js';
import { InquiriesService } from './inquiries.service.js';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto.js';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller()
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post('listings/:listingId/inquiries')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Body() dto: CreateInquiryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.inquiriesService.create(listingId, req.user.id, dto);
  }

  @Get('inquiries/mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: AuthenticatedRequest) {
    return this.inquiriesService.findMine(req.user.id);
  }

  @Get('listings/:listingId/inquiries')
  @UseGuards(JwtAuthGuard)
  findByListing(
    @Param('listingId', ParseIntPipe) listingId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.inquiriesService.findByListing(listingId, req.user.id);
  }

  @Patch('inquiries/:id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInquiryStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.inquiriesService.updateStatus(id, dto.status, req.user.id);
  }
}
