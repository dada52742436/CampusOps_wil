import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getMyInquiries,
  updateInquiryStatus,
  type Inquiry,
  type InquiryStatus,
} from '../api/inquiries';
import {
  sharedPageHeadingStyle,
  sharedPageHeaderStyle,
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

export function MyInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyInquiries()
      .then(setInquiries)
      .catch(() => setError('Failed to load your inquiries.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleClose(id: number) {
    if (!window.confirm('Close this inquiry?')) return;
    try {
      const updated = await updateInquiryStatus(id, 'closed');
      setInquiries((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      setError('Failed to close inquiry. Please try again.');
    }
  }

  const openCount = inquiries.filter((item) => item.status === 'open').length;
  const closedCount = inquiries.filter((item) => item.status === 'closed').length;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <Link to="/listings" style={styles.back}>Back to Listings</Link>
          <h2 style={styles.heading}>My Inquiries</h2>
          <p style={styles.subheading}>
            Track the questions you have sent to sellers and close any inquiry that no longer needs a reply.
          </p>
        </div>
        {inquiries.length > 0 && <span style={styles.summaryChip}>{openCount} open</span>}
      </div>

      {!loading && !error && inquiries.length > 0 && (
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

      {loading && <p style={styles.info}>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && inquiries.length === 0 && (
        <div style={styles.emptyBox}>
          <p style={{ margin: '0 0 12px', color: '#6b7280' }}>
            You have not sent any inquiries yet.
          </p>
          <Link to="/listings" style={styles.btnBrowse}>
            Browse Listings
          </Link>
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
                {inquiry.listing ? (
                  <Link to={`/listings/${inquiry.listing.id}`} style={styles.rowTitle}>
                    {inquiry.listing.title}
                  </Link>
                ) : (
                  <span style={styles.rowTitle}>Listing #{inquiry.listingId}</span>
                )}
              </div>

              {inquiry.listing && (
                <span style={styles.rowMeta}>
                  Seller: {inquiry.listing.owner?.username ?? 'Unknown seller'}
                  {inquiry.listing.location ? ` · ${inquiry.listing.location}` : ''}
                </span>
              )}

              <p style={styles.message}>"{inquiry.message}"</p>

              {inquiry.status === 'open' ? (
                <p style={styles.stateHint}>
                  This conversation is still open. If you decide not to follow up, you can close it here.
                </p>
              ) : (
                <p style={styles.stateHintMuted}>
                  This inquiry has been closed. It remains visible here for your reference.
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
  header: sharedPageHeaderStyle,
  back: { display: 'block', color: '#2563eb', textDecoration: 'none', fontSize: 13, marginBottom: 6 },
  heading: sharedPageHeadingStyle,
  subheading: sharedPageSubheadingStyle,
  summaryChip: {
    fontSize: 13,
    padding: '4px 12px',
    borderRadius: 999,
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    fontWeight: 600,
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
  badge: { fontSize: 12, padding: '2px 9px', borderRadius: 4, fontWeight: 500, flexShrink: 0 },
  rowTitle: { fontWeight: 600, fontSize: 15, color: '#111827', textDecoration: 'none' },
  rowMeta: { fontSize: 13, color: '#6b7280' },
  message: { margin: 0, fontSize: 13, color: '#374151', fontStyle: 'italic' },
  stateHint: { margin: 0, fontSize: 12, color: '#1d4ed8', lineHeight: 1.6 },
  stateHintMuted: { margin: 0, fontSize: 12, color: '#6b7280', lineHeight: 1.6 },
  rowDate: { fontSize: 12, color: '#9ca3af' },
  rowActions: { flexShrink: 0, paddingTop: 2 },
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
