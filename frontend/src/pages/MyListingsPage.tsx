import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyListings, deleteListing, type Listing } from '../api/listings';

export function MyListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch only the current user's listings on mount
  useEffect(() => {
    getMyListings()
      .then(setListings)
      .catch(() => setError('Failed to load your listings.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await deleteListing(id);
      // Remove the deleted item from local state — no need to refetch
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setError('Failed to delete. Please try again.');
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <Link to="/listings" style={styles.back}>← All Listings</Link>
          <h2 style={styles.heading}>My Listings</h2>
        </div>
        <Link to="/listings/new" style={styles.btnNew}>
          + Post a Listing
        </Link>
      </div>

      {loading && <p style={styles.info}>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && listings.length === 0 && (
        <div style={styles.emptyBox}>
          <p style={{ margin: '0 0 12px', color: '#6b7280' }}>
            You haven't posted any listings yet.
          </p>
          <Link to="/listings/new" style={styles.btnNew}>
            Post your first listing
          </Link>
        </div>
      )}

      <div style={styles.list}>
        {listings.map((listing) => (
          <div key={listing.id} style={styles.row}>
            {/* Left: info */}
            <div style={styles.rowInfo}>
              <span style={styles.condition}>{listing.condition.replace('_', ' ')}</span>
              <Link to={`/listings/${listing.id}`} style={styles.rowTitle}>
                {listing.title}
              </Link>
              <span style={styles.rowMeta}>
                ${listing.price.toLocaleString()}
                {listing.location ? ` · ${listing.location}` : ''}
                {' · '}
                {new Date(listing.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Right: actions */}
            <div style={styles.rowActions}>
              <button
                style={styles.btnEdit}
                onClick={() => navigate(`/listings/${listing.id}/edit`)}
              >
                Edit
              </button>
              <button
                style={styles.btnDelete}
                onClick={() => handleDelete(listing.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Inline styles ─────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 760, margin: '40px auto', padding: '0 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  back: { display: 'block', color: '#2563eb', textDecoration: 'none', fontSize: 13, marginBottom: 6 },
  heading: { margin: 0, fontSize: 22, fontWeight: 700 },
  btnNew: {
    padding: '8px 16px', background: '#2563eb', color: '#fff',
    borderRadius: 6, textDecoration: 'none', fontSize: 14,
  },
  info: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  error: { color: '#dc2626', marginTop: 12 },
  emptyBox: { textAlign: 'center', marginTop: 60 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  row: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: 8,
    background: '#fff', gap: 16,
  },
  rowInfo: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 },
  condition: {
    fontSize: 12, padding: '2px 8px', borderRadius: 4, flexShrink: 0,
    background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0',
  },
  rowTitle: { fontWeight: 600, fontSize: 15, color: '#111827', textDecoration: 'none' },
  rowMeta: { fontSize: 13, color: '#6b7280' },
  rowActions: { display: 'flex', gap: 8, flexShrink: 0 },
  btnEdit: {
    padding: '6px 14px', background: '#f3f4f6', color: '#374151',
    border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, cursor: 'pointer',
  },
  btnDelete: {
    padding: '6px 14px', background: '#fee2e2', color: '#dc2626',
    border: '1px solid #fca5a5', borderRadius: 6, fontSize: 13, cursor: 'pointer',
  },
};
