import {
  IsString,
  IsNumber,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  IsIn,
} from 'class-validator';

// Valid condition values — enforced at the DTO level so bad data never reaches the DB
const VALID_CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor'] as const;

export class CreateListingDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(100, { message: 'Title must be at most 100 characters' })
  title: string;

  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @MaxLength(2000, { message: 'Description must be at most 2000 characters' })
  description: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  // Optional fields — frontend can omit them entirely
  @IsOptional()
  @IsString()
  @MaxLength(50)
  brand?: string;

  @IsIn(VALID_CONDITIONS, {
    message: `Condition must be one of: ${VALID_CONDITIONS.join(', ')}`,
  })
  condition: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}
