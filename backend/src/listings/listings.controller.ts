import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ListingsService } from './listings.service.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
import { UpdateListingDto } from './dto/update-listing.dto.js';
import { GetListingsQueryDto } from './dto/get-listings-query.dto.js';
import type { User } from '../../generated/prisma/client.js';

// Extend Express Request to type req.user injected by JwtStrategy
interface AuthenticatedRequest extends Request {
  user: User;
}

// All routes are prefixed with /listings (registered in ListingsModule)
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  // ── GET /listings ─────────────────────────────────────────────────────────
  // Public: anyone can browse all listings, no token required.
  // Accepts optional query params: search, condition, brand, minPrice,
  // maxPrice, page, limit — all validated by GetListingsQueryDto.
  @Get()
  findAll(@Query() query: GetListingsQueryDto) {
    return this.listingsService.findAll(query);
  }

  // ── GET /listings/mine ────────────────────────────────────────────────────
  // Protected: returns only the listings owned by the current user.
  // IMPORTANT: this route MUST be declared before GET /listings/:id,
  // otherwise NestJS would try to parse "mine" as a numeric :id param.
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: AuthenticatedRequest) {
    return this.listingsService.findByOwner(req.user.id);
  }

  // ── GET /listings/:id ─────────────────────────────────────────────────────
  // Public: view a single listing's detail page, no token required.
  // ParseIntPipe ensures the :id param is a valid integer (returns 400 otherwise)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.listingsService.findOne(id);
  }

  // ── POST /listings ────────────────────────────────────────────────────────
  // Protected: create a new listing.
  // ownerId is taken from req.user (JWT), never from the request body.
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreateListingDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listingsService.create(dto, req.user.id);
  }

  // ── PATCH /listings/:id ───────────────────────────────────────────────────
  // Protected: edit an existing listing.
  // Service will throw 403 if req.user is not the owner.
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListingDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listingsService.update(id, dto, req.user.id);
  }

  // ── DELETE /listings/:id ──────────────────────────────────────────────────
  // Protected: delete a listing.
  // Returns 200 with a message (not 204) so the client gets confirmation text.
  // Service will throw 403 if req.user is not the owner.
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listingsService.remove(id, req.user.id);
  }
}
