/**
 * Canonical list of piano listing condition values and their human-readable labels.
 *
 * This is the single source of truth for the frontend:
 *   - CreateListingPage and EditListingPage use CONDITIONS for the <select> options.
 *   - ListingsPage, ListingDetailPage, and MyListingsPage use CONDITION_LABELS
 *     to display a formatted label instead of the raw DB value.
 *
 * Values must stay in sync with the Condition enum in:
 *   backend/src/listings/condition.enum.ts
 */
export const CONDITIONS = [
  { value: 'new',      label: 'New'      },
  { value: 'like_new', label: 'Like New' },
  { value: 'good',     label: 'Good'     },
  { value: 'fair',     label: 'Fair'     },
  { value: 'poor',     label: 'Poor'     },
] as const;

// Quick lookup: raw DB value → display label (e.g. 'like_new' → 'Like New')
export const CONDITION_LABELS: Record<string, string> = Object.fromEntries(
  CONDITIONS.map((c) => [c.value, c.label]),
);

// The union type of all valid condition values, derived from the constant above
export type ListingCondition = (typeof CONDITIONS)[number]['value'];
