import React, { useEffect, useRef, useState } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC.js';
import { useCall } from '../../hooks/useCall.js';
import { FiPhoneOff, FiMic, FiMicOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export function AudioCall({ recipientId, recipientName }) {
  const { getLocalStream, createOffer, stopCall } = useWebRTC();
  const { endCall } = useCall();
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    initializeCall();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const initializeCall = async () => {
    try {
      const stream = await getLocalStream(true, false);
      const offer = await createOffer();
      // Send offer to backend/socket
    } catch (error) {
      toast.error('Failed to initialize call');
      console.error('Call error:', error);
    }
  };

  const handleEndCall = () => {
    stopCall();
    endCall();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Mute audio tracks
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.avatar}>📞</div>
        <h2 style={styles.name}>{recipientName}</h2>
        <p style={styles.duration}>{formatDuration(callDuration)}</p>
        <p style={styles.status}>In Call</p>
      </div>

      <div style={styles.controls}>
        <button
          style={{...styles.button, ...styles.muteButton}}
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <FiMicOff size={24} /> : <FiMic size={24} />}
        </button>
        <button
          style={{...styles.button, ...styles.endButton}}
          onClick={handleEndCall}
          title="End call"
        >
          <FiPhoneOff size={24} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
    color: 'white'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '60px'
  },
  avatar: {
    fontSize: '80px',
    marginBottom: '24px'
  },
  name: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 8px 0'
  },
  duration: {
    fontSize: '24px',
    margin: '8px 0',
    opacity: 0.9
  },
  status: {
    fontSize: '16px',
    margin: '8px 0 0 0',
    opacity: 0.8
  },
  controls: {
    display: 'flex',
    gap: '16px'
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
  muteButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white'
  },
  endButton: {
    background: 'var(--error)',
    color: 'white'
  }
};