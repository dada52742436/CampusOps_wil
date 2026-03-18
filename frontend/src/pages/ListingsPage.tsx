import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllListings, type Listing } from '../api/listings';
import { useAuth } from '../context/AuthContext';

export function ListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all listings when the component mounts
  useEffect(() => {
    getAllListings()
      .then(setListings)
      .catch(() => setError('Failed to load listings.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>All Listings</h2>
        <div style={styles.actions}>
          {/* Show "Post a Listing" only when logged in */}
          {user && (
            <Link to="/listings/new" style={styles.btnPrimary}>
              + Post a Listing
            </Link>
          )}
          {user && (
            <Link to="/listings/mine" style={styles.btnSecondary}>
              My Listings
            </Link>
          )}
          {!user && (
            <Link to="/login" style={styles.btnSecondary}>
              Login to Post
            </Link>
          )}
        </div>
      </div>

      {loading && <p style={styles.info}>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && listings.length === 0 && (
        <p style={styles.info}>No listings yet. Be the first to post one!</p>
      )}

      <div style={styles.grid}>
        {listings.map((listing) => (
          <Link to={`/listings/${listing.id}`} key={listing.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.condition}>{listing.condition.replace('_', ' ')}</span>
              {listing.brand && <span style={styles.brand}>{listing.brand}</span>}
            </div>
            <h3 style={styles.cardTitle}>{listing.title}</h3>
            <p style={styles.price}>${listing.price.toLocaleString()}</p>
            <p style={styles.meta}>
              {listing.location ?? 'Location not specified'} · by {listing.owner.username}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Inline styles (minimal, functional) ──────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 900, margin: '40px auto', padding: '0 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { margin: 0, fontSize: 24 },
  actions: { display: 'flex', gap: 12 },
  btnPrimary: {
    padding: '8px 16px', background: '#2563eb', color: '#fff',
    borderRadius: 6, textDecoration: 'none', fontSize: 14,
  },
  btnSecondary: {
    padding: '8px 16px', background: '#f3f4f6', color: '#374151',
    borderRadius: 6, textDecoration: 'none', fontSize: 14,
    border: '1px solid #d1d5db',
  },
  info: { color: '#6b7280', textAlign: 'center', marginTop: 40 },
  error: { color: '#dc2626', textAlign: 'center', marginTop: 40 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  card: {
    display: 'block', padding: 16, border: '1px solid #e5e7eb',
    borderRadius: 8, textDecoration: 'none', color: 'inherit',
    background: '#fff', transition: 'box-shadow 0.15s',
  },
  cardHeader: { display: 'flex', gap: 8, marginBottom: 8 },
  condition: {
    fontSize: 12, padding: '2px 8px', borderRadius: 4,
    background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0',
  },
  brand: {
    fontSize: 12, padding: '2px 8px', borderRadius: 4,
    background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
  },
  cardTitle: { margin: '0 0 8px', fontSize: 16, fontWeight: 600 },
  price: { margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#2563eb' },
  meta: { margin: 0, fontSize: 13, color: '#6b7280' },
};
