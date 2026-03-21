/**
 * BookingStatus enum — single source of truth for the booking lifecycle.
 *
 * Must stay in sync with the BookingStatus enum in prisma/schema.prisma.
 * Used by UpdateBookingStatusDto (@IsEnum) and BookingsService (status transitions).
 *
 * State transitions:
 *   Seller: pending → accepted | rejected
 *   Buyer:  pending → cancelled
 */
export enum BookingStatus {
  pending   = 'pending',
  accepted  = 'accepted',
  rejected  = 'rejected',
  cancelled = 'cancelled',
}
