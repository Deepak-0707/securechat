import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.code}>404</h1>
        <h2 style={styles.title}>Page Not Found</h2>
        <p style={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button onClick={() => navigate('/')} style={styles.button}>
          <FiArrowLeft size={20} /> Go Home
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
  },
  content: {
    textAlign: 'center',
    color: 'white'
  },
  code: {
    fontSize: '120px',
    fontWeight: 'bold',
    margin: 0,
    textShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
  },
  title: {
    fontSize: '32px',
    margin: '10px 0 20px 0'
  },
  description: {
    fontSize: '16px',
    marginBottom: '30px',
    opacity: 0.9
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'white',
    color: 'var(--primary-color)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};