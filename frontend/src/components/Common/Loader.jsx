import React from 'react';

export function Loader({ size = 40, text = 'Loading...' }) {
  return (
    <div style={styles.container}>
      <div style={{...styles.spinner, width: size, height: size}} />
      {text && <p style={styles.text}>{text}</p>}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px'
  },
  spinner: {
    border: '4px solid var(--border-color)',
    borderTop: '4px solid var(--primary-color)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  text: {
    color: 'var(--text-secondary)',
    fontSize: '14px'
  }
};