import {
  IsString,
  IsNumber,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  IsEnum,
} from 'class-validator';
import { Condition } from '../condition.enum.js';

// Re-export so consumers (e.g. tests) can reference the enum via the DTO module
export { Condition };

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

  // @IsEnum validates against the Condition enum; any unknown value returns 400
  @IsEnum(Condition, {
    message: `condition must be one of: ${Object.values(Condition).join(', ')}`,
  })
  condition: Condition;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}
