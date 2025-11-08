/**
 * REGISTER COMPONENT - WITH E2E ENCRYPTION
 * 
 * COPY THIS ENTIRE FILE TO: frontend/src/components/Auth/Register.jsx
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { validateEmail, validatePassword, validateUsername } from '../../utils/validation.js';
import { 
  generateKeyPair, 
  storeMyKeys
} from '../../services/e2eEncryption.js';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiKey } from 'react-icons/fi';

export function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters';
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Starting registration...');

    if (!validateForm()) {
      console.log('❌ Validation failed');
      return;
    }

    try {
      // Generate keys
      console.log('🔑 Generating encryption keys...');
      setIsGeneratingKeys(true);
      
      const keys = generateKeyPair();
      
      console.log('✅ Keys generated');
      console.log('   Private Key: [STORED LOCALLY]');
      console.log('   Public Key:', keys.publicKey.substring(0, 10) + '...');

      // Store private key locally
      storeMyKeys(keys.privateKey, keys.publicKey);
      console.log('✅ Private key stored locally');

      setIsGeneratingKeys(false);

      // Register with server
      console.log('📤 Sending registration...');
      
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        publicKey: keys.publicKey
      });

      console.log('✅ Registration successful');
      
      toast.success('Account created! 🔐 Encryption enabled', {
        duration: 4000
      });

      navigate('/');

    } catch (error) {
      setIsGeneratingKeys(false);
      console.error('❌ Registration failed:', error);

      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'User already exists');
      } else if (error.response?.status === 500) {
        toast.error('Server error');
      } else {
        toast.error('Registration failed');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create Account</h1>
          <div style={styles.encryptionBadge}>
            <FiKey size={16} />
            <span>End-to-End Encrypted</span>
          </div>
        </div>

        {isGeneratingKeys && (
          <div style={styles.keyGenNotice}>
            <div style={styles.spinner}></div>
            <div>
              <p style={styles.noticeTitle}>🔐 Generating Keys</p>
              <p style={styles.noticeText}>
                Creating your Curve25519 key pair...
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrapper}>
              <FiUser style={styles.icon} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                style={styles.input}
                disabled={isGeneratingKeys}
              />
            </div>
            {errors.username && <p style={styles.error}>{errors.username}</p>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <FiMail style={styles.icon} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={styles.input}
                disabled={isGeneratingKeys}
              />
            </div>
            {errors.email && <p style={styles.error}>{errors.email}</p>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <FiLock style={styles.icon} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                style={styles.input}
                disabled={isGeneratingKeys}
              />
            </div>
            {errors.password && <p style={styles.error}>{errors.password}</p>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrapper}>
              <FiLock style={styles.icon} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                style={styles.input}
                disabled={isGeneratingKeys}
              />
            </div>
            {errors.confirmPassword && <p style={styles.error}>{errors.confirmPassword}</p>}
          </div>

          <div style={styles.securityInfo}>
            <p style={styles.infoTitle}>🔒 Your Privacy</p>
            <ul style={styles.infoList}>
              <li>Private key never leaves device</li>
              <li>Messages encrypted before sending</li>
              <li>Server cannot read messages</li>
              <li>True E2E encryption</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || isGeneratingKeys}
            style={{
              ...styles.button,
              opacity: (loading || isGeneratingKeys) ? 0.6 : 1
            }}
          >
            {isGeneratingKeys ? 'Generating Keys...' : 
             loading ? 'Creating Account...' : 
             'Create Account'}
          </button>

          <p style={styles.footer}>
            Already have an account? <a href="/login" style={styles.link}>Login</a>
          </p>
        </form>
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
    maxWidth: '500px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    color: 'var(--primary-color)',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 10px 0'
  },
  encryptionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    background: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600'
  },
  keyGenNotice: {
    background: '#e3f2fd',
    border: '1px solid #2196f3',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid #e0e0e0',
    borderTop: '3px solid #2196f3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  noticeTitle: {
    margin: '0 0 8px 0',
    fontWeight: '600',
    fontSize: '14px',
    color: '#1976d2'
  },
  noticeText: {
    margin: '4px 0',
    fontSize: '12px',
    color: '#555'
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
  error: {
    color: 'var(--error)',
    fontSize: '12px',
    margin: 0
  },
  securityInfo: {
    background: '#f5f5f5',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '10px'
  },
  infoTitle: {
    margin: '0 0 8px 0',
    fontWeight: '600',
    fontSize: '14px',
    color: '#333'
  },
  infoList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#666'
  },
  button: {
    padding: '14px',
    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'opacity 0.3s'
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
    color: 'var(--text-secondary)'
  },
  link: {
    color: 'var(--primary-color)',
    textDecoration: 'none',
    fontWeight: '600'
  }
};