export const LISTING_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
  { value: 'archived', label: 'Archived' },
] as const;

export type ListingStatus = (typeof LISTING_STATUSES)[number]['value'];

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  active: 'Active',
  sold: 'Sold',
  archived: 'Archived',
};
