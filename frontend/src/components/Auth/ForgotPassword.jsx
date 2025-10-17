import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api.js';
import { validateEmail } from '../../utils/validation.js';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button
          onClick={() => navigate('/login')}
          style={styles.backButton}
        >
          <FiArrowLeft size={20} /> Back to Login
        </button>

        <h1 style={styles.title}>Reset Password</h1>

        {submitted ? (
          <div style={styles.successMessage}>
            <h2 style={styles.successTitle}>Check Your Email</h2>
            <p style={styles.successText}>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p style={styles.successText}>
              Click the link in the email to reset your password.
            </p>
            <p style={styles.hint}>
              The link will expire in 1 hour for security reasons.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <FiMail style={styles.icon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  style={styles.input}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>

            <p style={styles.info}>
              You'll receive an email with instructions to reset your password.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: 'var(--shadow-lg)',
    width: '100%',
    maxWidth: '400px',
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'transparent',
    border: 'none',
    color: 'var(--primary-color)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500'
  },
  title: {
    textAlign: 'center',
    marginTop: '30px',
    marginBottom: '20px',
    color: 'var(--primary-color)',
    fontSize: '28px',
    fontWeight: 'bold'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)'
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    gap: '10px'
  },
  icon: {
    color: 'var(--text-secondary)',
    fontSize: '18px'
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    background: 'transparent'
  },
  button: {
    padding: '12px',
    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px'
  },
  info: {
    textAlign: 'center',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '10px'
  },
  successMessage: {
    textAlign: 'center'
  },
  successTitle: {
    color: 'var(--success)',
    marginBottom: '16px',
    fontSize: '22px'
  },
  successText: {
    color: 'var(--text-secondary)',
    marginBottom: '12px',
    fontSize: '14px'
  },
  hint: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
    marginTop: '20px'
  }
};