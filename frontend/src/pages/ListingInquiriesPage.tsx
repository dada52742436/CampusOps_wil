import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getListingById, type Listing } from '../api/listings';
import {
  getListingInquiries,
  updateInquiryStatus,
  type Inquiry,
  type InquiryStatus,
} from '../api/inquiries';
import {
  sharedBackLinkStyle,
  sharedPageHeadingStyle,
  sharedPageStyle,
  sharedPageSubheadingStyle,
} from '../styles/shared';

const STATUS_LABELS: Record<InquiryStatus, string> = {
  open: 'Open',
  closed: 'Closed',
};

function statusStyle(status: InquiryStatus): React.CSSProperties {
  const map: Record<InquiryStatus, React.CSSProperties> = {
    open: { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
    closed: { background: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db' },
  };
  return { ...styles.badge, ...map[status] };
}

export function ListingInquiriesPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const listingId = Number(id);

    Promise.all([getListingById(listingId), getListingInquiries(listingId)])
      .then(([loadedListing, loadedInquiries]) => {
        setListing(loadedListing);
        setInquiries(loadedInquiries);
      })
      .catch((err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 403) {
          setError('You do not own this listing.');
        } else if (status === 404) {
          setError('Listing not found.');
        } else {
          setError('Failed to load inquiries.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleClose(inquiryId: number) {
    if (!window.confirm('Close this inquiry?')) return;
    try {
      const updated = await updateInquiryStatus(inquiryId, 'closed');
      setInquiries((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      setError('Failed to update inquiry status. Please try again.');
    }
  }

  if (loading) return <p style={styles.info}>Loading...</p>;
  if (error && !listing) return <p style={styles.error}>{error}</p>;

  const openCount = inquiries.filter((item) => item.status === 'open').length;
  const closedCount = inquiries.filter((item) => item.status === 'closed').length;

  return (
    <div style={styles.page}>
      <Link to={`/listings/${id}`} style={styles.back}>Back to Listing</Link>

      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.heading}>Inquiry Requests</h2>
          {listing ? (
            <p style={styles.subheading}>{listing.title}</p>
          ) : (
            <p style={styles.subheading}>Review and manage incoming contact requests for this listing.</p>
          )}
        </div>
        {inquiries.length > 0 && (
          <span style={styles.pendingBadge}>{openCount} open</span>
        )}
      </div>

      {!error && inquiries.length > 0 && (
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Total</span>
            <strong style={styles.summaryValue}>{inquiries.length}</strong>
          </div>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Open</span>
            <strong style={styles.summaryValue}>{openCount}</strong>
          </div>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Closed</span>
            <strong style={styles.summaryValue}>{closedCount}</strong>
          </div>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}

      {!error && inquiries.length === 0 && (
        <div style={styles.emptyBox}>
          <p style={{ color: '#6b7280', margin: 0 }}>
            No inquiries yet for this listing.
          </p>
        </div>
      )}

      <div style={styles.list}>
        {inquiries.map((inquiry) => (
          <div key={inquiry.id} style={styles.row}>
            <div style={styles.rowMain}>
              <div style={styles.rowTop}>
                <span style={statusStyle(inquiry.status)}>
                  {STATUS_LABELS[inquiry.status]}
                </span>
                <span style={styles.requesterName}>
                  {inquiry.requester?.username ?? `User #${inquiry.requesterId}`}
                </span>
              </div>

              <p style={styles.message}>"{inquiry.message}"</p>

              {inquiry.status === 'open' ? (
                <p style={styles.stateHint}>
                  This buyer is still waiting for a reply or outcome. Close the inquiry when the conversation is finished.
                </p>
              ) : (
                <p style={styles.stateHintMuted}>
                  This inquiry has been closed and is now retained for record-keeping only.
                </p>
              )}

              <span style={styles.rowDate}>
                Sent {new Date(inquiry.createdAt).toLocaleDateString()}
              </span>
            </div>

            {inquiry.status === 'open' && (
              <div style={styles.rowActions}>
                <button style={styles.btnClose} onClick={() => void handleClose(inquiry.id)}>
                  Close
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: sharedPageStyle,
  back: sharedBackLinkStyle,
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  heading: { ...sharedPageHeadingStyle, margin: '0 0 4px' },
  subheading: { ...sharedPageSubheadingStyle, marginTop: 0 },
  pendingBadge: {
    fontSize: 13,
    padding: '4px 12px',
    borderRadius: 20,
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    fontWeight: 600,
    flexShrink: 0,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  summaryValue: {
    fontSize: 22,
    color: '#0f172a',
  },
  info: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  error: { color: '#dc2626', marginTop: 12 },
  emptyBox: { textAlign: 'center', marginTop: 60 },
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
  badge: { fontSize: 12, padding: '2px 9px', borderRadius: 4, fontWeight: 500, flexShrink: 0 },
  requesterName: { fontWeight: 600, fontSize: 15, color: '#111827' },
  message: { margin: 0, fontSize: 13, color: '#374151', fontStyle: 'italic' },
  stateHint: { margin: 0, fontSize: 12, color: '#1d4ed8', lineHeight: 1.6 },
  stateHintMuted: { margin: 0, fontSize: 12, color: '#6b7280', lineHeight: 1.6 },
  rowDate: { fontSize: 12, color: '#9ca3af' },
  rowActions: { display: 'flex', gap: 8, flexShrink: 0, paddingTop: 2 },
  btnClose: {
    padding: '5px 14px',
    background: '#f3f4f6',
    color: '#4b5563',
    border: '1px solid #d1d5db',
    borderRadius: 5,
    fontSize: 13,
    cursor: 'pointer',
  },
};
