/**
 * Condition enum for piano listings.
 *
 * This enum is the single source of truth for valid condition values on the
 * backend. It mirrors the 'Condition' enum defined in prisma/schema.prisma —
 * both must be kept in sync whenever a new value is added.
 *
 * Used by CreateListingDto and UpdateListingDto via @IsEnum(Condition) so that
 * class-validator rejects any value not in this set before the request reaches
 * the service layer.
 */
export enum Condition {
  new      = 'new',
  like_new = 'like_new',
  good     = 'good',
  fair     = 'fair',
  poor     = 'poor',
}
