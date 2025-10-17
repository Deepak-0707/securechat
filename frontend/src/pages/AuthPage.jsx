import React, { useState } from 'react';
import { Login } from '../components/Auth/Login.jsx';
import { Register } from '../components/Auth/Register.jsx';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div style={styles.container}>
      {isLogin ? (
        <div>
          <Login />
          <div style={styles.toggleSection}>
            <p style={styles.toggleText}>
              Don't have an account?{' '}
              <button
                onClick={() => setIsLogin(false)}
                style={styles.toggleButton}
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      ) : (
        <div>
          <Register />
          <div style={styles.toggleSection}>
            <p style={styles.toggleText}>
              Already have an account?{' '}
              <button
                onClick={() => setIsLogin(true)}
                style={styles.toggleButton}
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  },
  toggleSection: {
    textAlign: 'center',
    padding: '20px'
  },
  toggleText: {
    color: 'var(--text-secondary)',
    fontSize: '14px'
  },
  toggleButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--primary-color)',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'underline'
  }
};