import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getListingById, deleteListing, type Listing } from '../api/listings';
import { useAuth } from '../context/AuthContext';

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Fetch the listing when the component mounts or the id param changes
  useEffect(() => {
    if (!id) return;
    getListingById(Number(id))
      .then(setListing)
      .catch(() => setError('Listing not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  // True only when the current logged-in user is the owner of this listing
  const isOwner = user !== null && listing !== null && user.id === listing.ownerId;

  async function handleDelete() {
    if (!listing) return;
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    setDeleting(true);
    try {
      await deleteListing(listing.id);
      // After deletion, go back to the listings index
      navigate('/listings');
    } catch {
      setError('Failed to delete. Please try again.');
      setDeleting(false);
    }
  }

  if (loading) return <p style={styles.info}>Loading...</p>;
  if (error) return <p style={styles.error}>{error}</p>;
  if (!listing) return null;

  return (
    <div style={styles.page}>
      {/* Back link */}
      <Link to="/listings" style={styles.back}>← Back to Listings</Link>

      <div style={styles.card}>
        {/* Header: title + owner actions */}
        <div style={styles.cardHeader}>
          <div>
            <div style={styles.badges}>
              <span style={styles.condition}>{listing.condition.replace('_', ' ')}</span>
              {listing.brand && <span style={styles.brand}>{listing.brand}</span>}
            </div>
            <h2 style={styles.title}>{listing.title}</h2>
            <p style={styles.price}>${listing.price.toLocaleString()}</p>
          </div>

          {/* Edit / Delete buttons — only visible to the owner */}
          {isOwner && (
            <div style={styles.ownerActions}>
              <Link to={`/listings/${listing.id}/edit`} style={styles.btnEdit}>
                Edit
              </Link>
              <button
                style={styles.btnDelete}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        <hr style={styles.divider} />

        {/* Description */}
        <section style={styles.section}>
          <h4 style={styles.sectionLabel}>Description</h4>
          <p style={styles.description}>{listing.description}</p>
        </section>

        {/* Meta info */}
        <section style={styles.section}>
          <h4 style={styles.sectionLabel}>Details</h4>
          <div style={styles.metaGrid}>
            <MetaRow label="Location" value={listing.location ?? '—'} />
            <MetaRow label="Posted by" value={listing.owner.username} />
            <MetaRow
              label="Listed on"
              value={new Date(listing.createdAt).toLocaleDateString()}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// Small helper component for key-value rows in the details section
function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ width: 100, color: '#6b7280', fontSize: 14, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14 }}>{value}</span>
    </div>
  );
}

// ── Inline styles ─────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 700, margin: '40px auto', padding: '0 20px' },
  back: { display: 'inline-block', marginBottom: 20, color: '#2563eb', textDecoration: 'none', fontSize: 14 },
  card: { border: '1px solid #e5e7eb', borderRadius: 10, padding: 28, background: '#fff' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  badges: { display: 'flex', gap: 8, marginBottom: 10 },
  condition: {
    fontSize: 12, padding: '2px 8px', borderRadius: 4,
    background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0',
  },
  brand: {
    fontSize: 12, padding: '2px 8px', borderRadius: 4,
    background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
  },
  title: { margin: '0 0 8px', fontSize: 22, fontWeight: 700 },
  price: { margin: 0, fontSize: 24, fontWeight: 700, color: '#2563eb' },
  ownerActions: { display: 'flex', gap: 10, flexShrink: 0 },
  btnEdit: {
    padding: '7px 16px', background: '#f3f4f6', color: '#374151',
    borderRadius: 6, textDecoration: 'none', fontSize: 14,
    border: '1px solid #d1d5db',
  },
  btnDelete: {
    padding: '7px 16px', background: '#fee2e2', color: '#dc2626',
    borderRadius: 6, fontSize: 14, border: '1px solid #fca5a5',
    cursor: 'pointer',
  },
  divider: { margin: '20px 0', borderColor: '#e5e7eb' },
  section: { marginBottom: 20 },
  sectionLabel: { margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 },
  description: { margin: 0, lineHeight: 1.7, color: '#374151' },
  metaGrid: { display: 'flex', flexDirection: 'column' },
  info: { textAlign: 'center', marginTop: 60, color: '#6b7280' },
  error: { textAlign: 'center', marginTop: 60, color: '#dc2626' },
};
