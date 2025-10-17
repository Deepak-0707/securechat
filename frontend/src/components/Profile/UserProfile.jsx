import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { userAPI } from '../../services/api.js';
import { FiEdit2, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../Common/Loader.jsx';
import toast from 'react-hot-toast';

export function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data.user);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/')} style={styles.backButton}>
        <FiArrowLeft size={20} /> Back
      </button>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.avatar}>{user?.username?.charAt(0).toUpperCase()}</div>
          <div style={styles.info}>
            <h1 style={styles.name}>{profile?.username}</h1>
            <p style={styles.email}>{profile?.email}</p>
            <span style={{...styles.status, background: profile?.status === 'online' ? 'var(--success)' : 'var(--text-secondary)'}}>
              {profile?.status}
            </span>
          </div>
        </div>

        <div style={styles.details}>
          <div style={styles.detailItem}>
            <label style={styles.label}>Username</label>
            <p style={styles.value}>{profile?.username}</p>
          </div>

          <div style={styles.detailItem}>
            <label style={styles.label}>Email</label>
            <p style={styles.value}>{profile?.email}</p>
          </div>

          <div style={styles.detailItem}>
            <label style={styles.label}>Status</label>
            <p style={styles.value}>{profile?.status}</p>
          </div>
        </div>

        <button onClick={() => navigate('/edit-profile')} style={styles.editButton}>
          <FiEdit2 size={18} /> Edit Profile
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  backButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--primary-color)',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: 'var(--shadow)',
  },
  header: {
    display: 'flex',
    gap: '24px',
    marginBottom: '40px',
    paddingBottom: '40px',
    borderBottom: '1px solid var(--border-color)'
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    fontWeight: 'bold'
  },
  info: {
    flex: 1
  },
  name: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  email: {
    margin: '0 0 12px 0',
    color: 'var(--text-secondary)'
  },
  status: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600'
  },
  details: {
    marginBottom: '30px'
  },
  detailItem: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
    textTransform: 'uppercase'
  },
  value: {
    margin: 0,
    fontSize: '16px',
    color: 'var(--text-primary)'
  },
  editButton: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  }
};