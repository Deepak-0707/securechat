import React from 'react';
import { FiMenu, FiX, FiLogOut, FiUser, FiHome, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import toast from 'react-hot-toast';

export function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
    toast.success('Logged out successfully');
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div style={styles.overlay} onClick={onClose} />
      )}
      <div style={{...styles.sidebar, left: isOpen ? 0 : '-100%'}}>
        <button onClick={onClose} style={styles.closeButton}>
          <FiX size={24} />
        </button>

        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userInfo}>
            <h3 style={styles.username}>{user?.username}</h3>
            <p style={styles.email}>{user?.email}</p>
          </div>
        </div>

        <nav style={styles.nav}>
          <button
            onClick={() => handleNavigation('/')}
            style={styles.navItem}
          >
            <FiHome size={20} />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleNavigation('/profile')}
            style={styles.navItem}
          >
            <FiUser size={20} />
            <span>Profile</span>
          </button>

          <button
            onClick={() => handleNavigation('/edit-profile')}
            style={styles.navItem}
          >
            <FiSettings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        <button
          onClick={handleLogout}
          style={{...styles.navItem, ...styles.logoutButton}}
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
}

export function SidebarToggle({ onClick }) {
  return (
    <button onClick={onClick} style={styles.toggleButton}>
      <FiMenu size={24} />
    </button>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
    animation: 'fadeIn 0.3s ease'
  },
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: '280px',
    background: 'white',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 999,
    transition: 'left 0.3s ease',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    padding: '8px'
  },
  userSection: {
    padding: '24px 16px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    gap: '12px',
    marginTop: '24px'
  },
  userAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
    flexShrink: 0
  },
  userInfo: {
    flex: 1,
    minWidth: 0
  },
  username: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  email: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 0'
  },
  navItem: {
    background: 'transparent',
    border: 'none',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.2s',
    borderLeft: '3px solid transparent'
  },
  logoutButton: {
    marginTop: 'auto',
    padding: '16px',
    color: 'var(--error)',
    borderBottom: '1px solid var(--border-color)',
    justifyContent: 'flex-start'
  },
  toggleButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    fontSize: '24px',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};