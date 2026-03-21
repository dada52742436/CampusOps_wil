import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Condition } from '../condition.enum.js';

// Query parameters for GET /listings
// All fields are optional — omitting a field means "no filter for that dimension".
// enableImplicitConversion (main.ts) converts query string values to the
// declared TypeScript types automatically, so @Type(() => Number) is not needed.
export class GetListingsQueryDto {
  // Full-text search across title and description (case-insensitive)
  @IsOptional()
  @IsString()
  search?: string;

  // Filter by exact condition enum value
  @IsOptional()
  @IsEnum(Condition)
  condition?: Condition;

  // Filter by brand (partial, case-insensitive)
  @IsOptional()
  @IsString()
  brand?: string;

  // Price range filters (inclusive)
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  // Pagination — defaults applied in the service, not here, so undefined propagates cleanly
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
