import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import {
  sharedPageHeadingStyle,
  sharedPageHeaderStyle,
  sharedPageStyle,
  sharedPageSubheadingStyle,
} from '../styles/shared';

interface ProfileData {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
    createdAt: string;
  };
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState('');

  // Request the protected profile endpoint when the page loads.
  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => {
        setError('Your session has expired. Please log in again.');
      });
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Welcome back, {user?.username}</h2>
          <p style={styles.subheading}>
            Review your protected profile details and confirm your current login session is active.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/listings" style={styles.secondaryBtn}>Browse Listings</Link>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.divider} />

        {error && <div style={styles.error}>{error}</div>}

        {profile ? (
          <div>
            <p style={styles.badge}>Protected page access confirmed. Backend token validation succeeded.</p>
            <div style={styles.infoBox}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>User ID</span>
                <span>{profile.user.id}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Email</span>
                <span>{profile.user.email}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Username</span>
                <span>{profile.user.username}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Registered At</span>
                <span>{new Date(profile.user.createdAt).toLocaleString('en-AU')}</span>
              </div>
            </div>
            <p style={styles.desc}>{profile.message}</p>
          </div>
        ) : !error ? (
          <p style={{ color: '#888' }}>Loading...</p>
        ) : null}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { ...sharedPageStyle, maxWidth: 760 },
  card: { background: '#fff', padding: '32px', borderRadius: '10px', boxShadow: '0 2px 12px rgba(15, 23, 42, 0.08)' },
  header: sharedPageHeaderStyle,
  title: sharedPageHeadingStyle,
  subheading: sharedPageSubheadingStyle,
  secondaryBtn: {
    padding: '8px 16px',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'none',
    color: '#374151',
  },
  logoutBtn: { padding: '8px 16px', background: '#fff1f2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#be123c' },
  divider: { height: '1px', background: '#f0f0f0', margin: '20px 0' },
  error: { background: '#fff1f0', border: '1px solid #ffa39e', color: '#cf1322', padding: '8px 12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' },
  badge: { background: '#f6ffed', border: '1px solid #b7eb8f', color: '#389e0d', padding: '8px 12px', borderRadius: '4px', fontSize: '14px', marginBottom: '16px' },
  infoBox: { background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '6px', padding: '16px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' },
  infoLabel: { color: '#888', fontWeight: 500 },
  desc: { marginTop: '16px', color: '#555', fontSize: '14px', textAlign: 'center' },
};
