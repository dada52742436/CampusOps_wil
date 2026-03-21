import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getListingBookings, updateBookingStatus, type Booking, type BookingStatus } from '../api/bookings';
import { getListingById, type Listing } from '../api/listings';

// Human-readable labels for each booking status value
const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   'Pending',
  accepted:  'Accepted',
  rejected:  'Rejected',
  cancelled: 'Cancelled',
};

// Per-status badge styles — same palette as MyBookingsPage
function statusStyle(status: BookingStatus): React.CSSProperties {
  const map: Record<BookingStatus, React.CSSProperties> = {
    pending:   { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' },
    accepted:  { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
    rejected:  { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
    cancelled: { background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb' },
  };
  return { ...styles.badge, ...map[status] };
}

export function ListingBookingsPage() {
  const { id } = useParams<{ id: string }>();

  const [listing, setListing] = useState<Listing | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the listing (for the title/header) and its bookings in parallel.
  // If the user is not the owner, getListingBookings will return 403 and we
  // surface the error — the listing fetch (public) will still succeed so we
  // still show the listing title in the error state.
  useEffect(() => {
    if (!id) return;
    const listingId = Number(id);

    Promise.all([
      getListingById(listingId),
      getListingBookings(listingId),
    ])
      .then(([l, b]) => {
        setListing(l);
        setBookings(b);
      })
      .catch((err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 403) {
          setError('You do not own this listing.');
        } else if (status === 404) {
          setError('Listing not found.');
        } else {
          setError('Failed to load bookings.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Seller accepts or rejects a pending booking.
  // Updates local state immediately so the UI reflects the change without refetch.
  async function handleStatusChange(bookingId: number, newStatus: 'accepted' | 'rejected') {
    const label = newStatus === 'accepted' ? 'Accept' : 'Reject';
    if (!window.confirm(`${label} this booking request?`)) return;
    try {
      const updated = await updateBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b)),
      );
    } catch {
      setError('Failed to update booking status. Please try again.');
    }
  }

  if (loading) return <p style={styles.info}>Loading...</p>;
  if (error && !listing) return <p style={styles.error}>{error}</p>;

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div style={styles.page}>
      {/* Back to the listing detail page */}
      <Link to={`/listings/${id}`} style={styles.back}>← Back to Listing</Link>

      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.heading}>
            Booking Requests
          </h2>
          {listing && (
            <p style={styles.subheading}>{listing.title}</p>
          )}
        </div>
        {pendingCount > 0 && (
          <span style={styles.pendingBadge}>{pendingCount} pending</span>
        )}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {!error && bookings.length === 0 && (
        <div style={styles.emptyBox}>
          <p style={{ color: '#6b7280', margin: 0 }}>
            No booking requests yet for this listing.
          </p>
        </div>
      )}

      <div style={styles.list}>
        {bookings.map((booking) => (
          <div key={booking.id} style={styles.row}>
            {/* Left: buyer info + message + meta */}
            <div style={styles.rowMain}>
              <div style={styles.rowTop}>
                <span style={statusStyle(booking.status)}>
                  {STATUS_LABELS[booking.status]}
                </span>
                <span style={styles.buyerName}>
                  {booking.buyer?.username ?? `User #${booking.buyerId}`}
                </span>
              </div>

              {/* Optional message from the buyer */}
              {booking.message && (
                <p style={styles.message}>"{booking.message}"</p>
              )}

              <span style={styles.rowDate}>
                Requested {new Date(booking.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Right: accept / reject — only shown for pending bookings */}
            {booking.status === 'pending' && (
              <div style={styles.rowActions}>
                <button
                  style={styles.btnAccept}
                  onClick={() => handleStatusChange(booking.id, 'accepted')}
                >
                  Accept
                </button>
                <button
                  style={styles.btnReject}
                  onClick={() => handleStatusChange(booking.id, 'rejected')}
                >
                  Reject
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
  page: { maxWidth: 760, margin: '40px auto', padding: '0 20px' },
  back: { display: 'inline-block', marginBottom: 16, color: '#2563eb', textDecoration: 'none', fontSize: 14 },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  heading: { margin: '0 0 4px', fontSize: 22, fontWeight: 700 },
  subheading: { margin: 0, fontSize: 14, color: '#6b7280' },
  pendingBadge: {
    fontSize: 13, padding: '4px 12px', borderRadius: 20,
    background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa',
    fontWeight: 600, flexShrink: 0,
  },
  info: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  error: { color: '#dc2626', marginTop: 12 },
  emptyBox: { textAlign: 'center', marginTop: 60 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  row: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '16px', border: '1px solid #e5e7eb', borderRadius: 8,
    background: '#fff', gap: 16,
  },
  rowMain: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  rowTop: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  badge: { fontSize: 12, padding: '2px 9px', borderRadius: 4, fontWeight: 500, flexShrink: 0 },
  buyerName: { fontWeight: 600, fontSize: 15, color: '#111827' },
  message: { margin: 0, fontSize: 13, color: '#374151', fontStyle: 'italic' },
  rowDate: { fontSize: 12, color: '#9ca3af' },
  rowActions: { display: 'flex', gap: 8, flexShrink: 0, paddingTop: 2 },
  btnAccept: {
    padding: '5px 14px', background: '#f0fdf4', color: '#15803d',
    border: '1px solid #bbf7d0', borderRadius: 5, fontSize: 13, cursor: 'pointer',
  },
  btnReject: {
    padding: '5px 14px', background: '#fef2f2', color: '#dc2626',
    border: '1px solid #fecaca', borderRadius: 5, fontSize: 13, cursor: 'pointer',
  },
};
