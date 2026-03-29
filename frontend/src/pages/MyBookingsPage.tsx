import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, updateBookingStatus, type Booking, type BookingStatus } from '../api/bookings';
import {
  sharedPageHeadingStyle,
  sharedPageHeaderStyle,
  sharedPageStyle,
  sharedPageSubheadingStyle,
} from '../styles/shared';

// Human-readable labels for each booking status value
const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   'Pending',
  accepted:  'Accepted',
  rejected:  'Rejected',
  cancelled: 'Cancelled',
};

// Per-status badge styles (background / text / border)
function statusStyle(status: BookingStatus): React.CSSProperties {
  const map: Record<BookingStatus, React.CSSProperties> = {
    pending:   { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' },
    accepted:  { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
    rejected:  { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
    cancelled: { background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb' },
  };
  return { ...styles.badge, ...map[status] };
}

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all bookings made by the authenticated user on mount
  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch(() => setError('Failed to load your bookings.'))
      .finally(() => setLoading(false));
  }, []);

  // Cancel a pending booking — updates local state on success to avoid refetch
  async function handleCancel(id: number) {
    if (!window.confirm('Cancel this booking request?')) return;
    try {
      const updated = await updateBookingStatus(id, 'cancelled');
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b)),
      );
    } catch {
      setError('Failed to cancel. Please try again.');
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <Link to="/listings" style={styles.back}>← All Listings</Link>
          <h2 style={styles.heading}>My Booking Requests</h2>
          <p style={styles.subheading}>
            Track every request you have sent and cancel any booking that is still pending.
          </p>
        </div>
      </div>

      {loading && <p style={styles.info}>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <div style={styles.emptyBox}>
          <p style={{ margin: '0 0 12px', color: '#6b7280' }}>
            You haven't made any booking requests yet.
          </p>
          <Link to="/listings" style={styles.btnBrowse}>
            Browse Listings
          </Link>
        </div>
      )}

      <div style={styles.list}>
        {bookings.map((booking) => (
          <div key={booking.id} style={styles.row}>
            {/* Left: listing info + message */}
            <div style={styles.rowMain}>
              <div style={styles.rowTop}>
                {/* Status badge */}
                <span style={statusStyle(booking.status)}>
                  {STATUS_LABELS[booking.status]}
                </span>

                {/* Listing title links to the listing detail page */}
                {booking.listing ? (
                  <Link
                    to={`/listings/${booking.listing.id}`}
                    style={styles.rowTitle}
                  >
                    {booking.listing.title}
                  </Link>
                ) : (
                  <span style={styles.rowTitle}>Listing #{booking.listingId}</span>
                )}
              </div>

              {/* Price + location from the included listing object */}
              {booking.listing && (
                <span style={styles.rowMeta}>
                  ${booking.listing.price?.toLocaleString()}
                  {booking.listing.location ? ` · ${booking.listing.location}` : ''}
                </span>
              )}

              {/* Optional message the buyer sent at booking time */}
              {booking.message && (
                <p style={styles.message}>"{booking.message}"</p>
              )}

              <span style={styles.rowDate}>
                {new Date(booking.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Right: cancel action — only available while pending */}
            {booking.status === 'pending' && (
              <div style={styles.rowActions}>
                <button
                  style={styles.btnCancel}
                  onClick={() => handleCancel(booking.id)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Inline styles ─────────────────────────────────────────────────────────────
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
    display: 'inline-block', padding: '8px 18px', background: '#2563eb',
    color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 14,
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  row: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '16px', border: '1px solid #e5e7eb', borderRadius: 8,
    background: '#fff', gap: 16,
  },
  rowMain: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  rowTop: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  badge: { fontSize: 12, padding: '2px 9px', borderRadius: 4, fontWeight: 500, flexShrink: 0 },
  rowTitle: { fontWeight: 600, fontSize: 15, color: '#111827', textDecoration: 'none' },
  rowMeta: { fontSize: 13, color: '#6b7280' },
  message: { margin: 0, fontSize: 13, color: '#374151', fontStyle: 'italic' },
  rowDate: { fontSize: 12, color: '#9ca3af' },
  rowActions: { flexShrink: 0, paddingTop: 2 },
  btnCancel: {
    padding: '5px 14px', background: '#fef2f2', color: '#dc2626',
    border: '1px solid #fecaca', borderRadius: 5, fontSize: 13, cursor: 'pointer',
  },
};
