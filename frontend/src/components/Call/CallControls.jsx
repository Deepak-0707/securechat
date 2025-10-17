import React from 'react';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiPhoneForwarded } from 'react-icons/fi';

export function CallControls({
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  onEndCall,
  isAudioOnly = false
}) {
  return (
    <div style={styles.container}>
      <button
        style={{...styles.button, ...styles.controlButton}}
        onClick={onToggleMute}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <FiMicOff size={24} /> : <FiMic size={24} />}
      </button>

      {!isAudioOnly && (
        <button
          style={{...styles.button, ...styles.controlButton}}
          onClick={onToggleVideo}
          title={isVideoOff ? 'Turn on video' : 'Turn off video'}
        >
          {isVideoOff ? <FiVideoOff size={24} /> : <FiVideo size={24} />}
        </button>
      )}

      <button
        style={{...styles.button, ...styles.endButton}}
        onClick={onEndCall}
        title="End call"
      >
        <FiPhoneOff size={24} />
      </button>
    </div>
  );
}

const styles = {
  container: {
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
    transition: 'transform 0.2s, opacity 0.2s'
  },
  controlButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white'
  },
  endButton: {
    background: 'var(--error)',
    color: 'white'
  }
};