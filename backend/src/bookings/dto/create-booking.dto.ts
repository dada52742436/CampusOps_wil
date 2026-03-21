import { IsOptional, IsString, MaxLength } from 'class-validator';

// Payload sent by the buyer when creating a new booking request.
// listingId comes from the URL param, not the body — so it is not declared here.
export class CreateBookingDto {
  // Optional note to the seller, e.g. "Available weekends after 2pm"
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Message cannot exceed 500 characters' })
  message?: string;
}
