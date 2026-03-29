import type React from 'react';

/**
 * Shared style constants used across form pages (auth + listings).
 * Import only what you need to avoid bundling unused styles.
 */

export const sharedInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontSize: 14,
  border: '1px solid #d1d5db',
  borderRadius: 6,
  boxSizing: 'border-box',
  outline: 'none',
};

export const sharedBackLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  marginBottom: 20,
  color: '#2563eb',
  textDecoration: 'none',
  fontSize: 14,
};

export const sharedPageStyle: React.CSSProperties = {
  maxWidth: 760,
  margin: '40px auto',
  padding: '0 20px',
};

export const sharedFormPageStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: '40px auto',
  padding: '0 20px',
};

export const sharedPageHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  gap: 16,
  marginBottom: 24,
  flexWrap: 'wrap',
};

export const sharedPageHeadingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 700,
  color: '#0f172a',
};

export const sharedPageSubheadingStyle: React.CSSProperties = {
  margin: '8px 0 0',
  fontSize: 14,
  color: '#64748b',
  lineHeight: 1.6,
};
