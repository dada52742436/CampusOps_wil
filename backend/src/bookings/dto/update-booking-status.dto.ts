import { IsEnum } from 'class-validator';
import { BookingStatus } from '../booking-status.enum.js';

// Payload sent when a buyer or seller wants to change a booking's status.
// The service layer enforces which roles are allowed to set which values.
export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus, {
    message: `status must be one of: ${Object.values(BookingStatus).join(', ')}`,
  })
  status: BookingStatus;
}
