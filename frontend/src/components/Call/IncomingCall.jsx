import React from 'react';
import { FiPhone, FiPhoneOff } from 'react-icons/fi';
import { useCall } from '../../hooks/useCall.js';

export function IncomingCall({ caller, onAnswer, onReject }) {
  const playSound = () => {
    const audio = new Audio('/assets/sounds/incoming-call.mp3');
    audio.play();
  };

  React.useEffect(() => {
    playSound();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.modal}>
        <div style={styles.content}>
          <h2 style={styles.title}>Incoming Call</h2>
          <p style={styles.caller}>{caller?.username}</p>
          <p style={styles.subtitle}>is calling you...</p>
        </div>

        <div style={styles.buttons}>
          <button
            style={{...styles.button, ...styles.acceptButton}}
            onClick={onAnswer}
          >
            <FiPhone size={24} />
          </button>
          <button
            style={{...styles.button, ...styles.rejectButton}}
            onClick={onReject}
          >
            <FiPhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: 'var(--shadow-lg)',
    minWidth: '300px'
  },
  content: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
    color: 'var(--text-primary)'
  },
  caller: {
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: 'var(--primary-color)'
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0
  },
  buttons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center'
  },
  button: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  acceptButton: {
    background: 'var(--success)',
    color: 'white'
  },
  rejectButton: {
    background: 'var(--error)',
    color: 'white'
  }
};