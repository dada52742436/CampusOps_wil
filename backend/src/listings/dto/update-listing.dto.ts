import {
  IsString,
  IsNumber,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  IsIn,
} from 'class-validator';

// Valid condition values — same as CreateListingDto
const VALID_CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor'] as const;

// All fields are optional for PATCH — caller only sends what they want to change.
// This is the standard partial-update pattern; we avoid PartialType from @nestjs/mapped-types
// to keep the module dependency surface minimal.
export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  brand?: string;

  @IsOptional()
  @IsIn(VALID_CONDITIONS, {
    message: `Condition must be one of: ${VALID_CONDITIONS.join(', ')}`,
  })
  condition?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}
