import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMySavedListings, removeSavedListing, type SavedListingRecord } from '../api/savedListings';
import { CONDITION_LABELS } from '../constants/conditions';
import { LISTING_STATUS_LABELS } from '../constants/listingStatus';
import {
  sharedPageHeadingStyle,
  sharedPageHeaderStyle,
  sharedPageStyle,
  sharedPageSubheadingStyle,
} from '../styles/shared';

export function MySavedListingsPage() {
  const [savedListings, setSavedListings] = useState<SavedListingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMySavedListings()
      .then(setSavedListings)
      .catch(() => setError('Failed to load your saved listings.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(listingId: number) {
    try {
      await removeSavedListing(listingId);
      setSavedListings((prev) => prev.filter((item) => item.listingId !== listingId));
    } catch {
      setError('Failed to remove this saved listing. Please try again.');
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <Link to="/listings" style={styles.back}>All Listings</Link>
          <h2 style={styles.heading}>My Saved Listings</h2>
          <p style={styles.subheading}>
            Keep a shortlist of pianos you want to revisit, compare, or inspect later.
          </p>
        </div>
      </div>

      {loading && <p style={styles.info}>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && savedListings.length === 0 && (
        <div style={styles.emptyBox}>
          <p style={{ margin: '0 0 12px', color: '#6b7280' }}>
            You have not saved any listings yet.
          </p>
          <Link to="/listings" style={styles.btnBrowse}>
            Browse Listings
          </Link>
        </div>
      )}

      <div style={styles.list}>
        {savedListings.map((saved) => (
          <div key={saved.id} style={styles.row}>
            <div style={styles.rowMain}>
              <div style={styles.rowTop}>
                <span style={styles.condition}>
                  {CONDITION_LABELS[saved.listing.condition] ?? saved.listing.condition}
                </span>
                <span
                  style={{
                    ...styles.status,
                    ...(saved.listing.status === 'active'
                      ? styles.statusActive
                      : saved.listing.status === 'sold'
                        ? styles.statusSold
                        : styles.statusArchived),
                  }}
                >
                  {LISTING_STATUS_LABELS[saved.listing.status]}
                </span>
                <Link to={`/listings/${saved.listing.id}`} style={styles.rowTitle}>
                  {saved.listing.title}
                </Link>
              </div>
              <span style={styles.rowMeta}>
                ${saved.listing.price.toLocaleString()}
                {saved.listing.location ? ` · ${saved.listing.location}` : ''}
                {' · '}
                by {saved.listing.owner.username}
              </span>
              <span style={styles.rowDate}>
                Saved on {new Date(saved.createdAt).toLocaleDateString()}
              </span>
            </div>

            <button
              type="button"
              style={styles.btnRemove}
              onClick={() => void handleRemove(saved.listingId)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: sharedPageStyle,
  header: sharedPageHeaderStyle,
  back: { display: 'block', color: '#2563eb', textDecoration: 'none', fontSize: 13, marginBottom: 6 },
  heading: sharedPageHeadingStyle,
  subheading: sharedPageSubheadingStyle,
  info: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  error: { color: '#dc2626', marginTop: 12 },
  emptyBox: { textAlign: 'center', marginTop: 60 },
  btnBrowse: {
    display: 'inline-block',
    padding: '8px 18px',
    background: '#2563eb',
    color: '#fff',
    borderRadius: 6,
    textDecoration: 'none',
    fontSize: 14,
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    background: '#fff',
    gap: 16,
  },
  rowMain: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  rowTop: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  condition: {
    fontSize: 12,
    padding: '2px 8px',
    borderRadius: 4,
    background: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0',
  },
  status: {
    fontSize: 12,
    padding: '2px 8px',
    borderRadius: 4,
    border: '1px solid transparent',
  },
  statusActive: { background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' },
  statusSold: { background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' },
  statusArchived: { background: '#f3f4f6', color: '#4b5563', borderColor: '#d1d5db' },
  rowTitle: { fontWeight: 600, fontSize: 15, color: '#111827', textDecoration: 'none' },
  rowMeta: { fontSize: 13, color: '#6b7280' },
  rowDate: { fontSize: 12, color: '#9ca3af' },
  btnRemove: {
    padding: '6px 14px',
    background: '#fff7ed',
    color: '#c2410c',
    border: '1px solid #fed7aa',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
    flexShrink: 0,
  },
};
