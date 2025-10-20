import React, { useEffect, useRef, useState } from 'react';
import { FiPhoneOff, FiPhone, FiVideo, FiMic, FiMicOff } from 'react-icons/fi';

export function CallModal({ 
  isOpen, 
  callType, 
  recipientName, 
  onAnswer, 
  onReject, 
  onEnd,
  localStream,
  remoteStream,
  isCallActive 
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  // Display local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Display remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Remote Stream */}
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={styles.remoteVideo}
          />
        ) : (
          <div style={styles.remoteVideoPlaceholder}>
            <div style={styles.placeholderContent}>
              <div style={styles.avatar}>{recipientName?.charAt(0).toUpperCase()}</div>
              <p style={styles.placeholderText}>{recipientName}</p>
              <p style={styles.placeholderSubtext}>
                {isCallActive ? 'Call in progress...' : 'Connecting...'}
              </p>
            </div>
          </div>
        )}

        {/* Local Stream (Picture in Picture) */}
        {localStream && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={styles.localVideo}
          />
        )}

        {/* Call Controls */}
        <div style={styles.controls}>
          {!isCallActive ? (
            <>
              {/* Incoming Call - Answer/Reject */}
              <button 
                style={{...styles.button, ...styles.rejectButton}}
                onClick={onReject}
              >
                <FiPhoneOff size={24} />
              </button>
              <button 
                style={{...styles.button, ...styles.answerButton}}
                onClick={onAnswer}
              >
                <FiPhone size={24} />
              </button>
            </>
          ) : (
            <>
              {/* Active Call - Mute/End */}
              <button 
                style={{...styles.button, ...(isMuted ? styles.muteButtonActive : styles.muteButton)}}
                onClick={toggleMute}
              >
                {isMuted ? <FiMicOff size={24} /> : <FiMic size={24} />}
              </button>
              <button 
                style={{...styles.button, ...styles.endButton}}
                onClick={onEnd}
              >
                <FiPhoneOff size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    background: '#000'
  },
  remoteVideoPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderContent: {
    textAlign: 'center',
    color: 'white'
  },
  avatar: {
    fontSize: '80px',
    marginBottom: '20px',
    fontWeight: 'bold'
  },
  placeholderText: {
    fontSize: '24px',
    margin: '0 0 10px 0',
    fontWeight: '600'
  },
  placeholderSubtext: {
    fontSize: '16px',
    margin: 0,
    opacity: 0.8
  },
  localVideo: {
    position: 'absolute',
    bottom: '80px',
    right: '20px',
    width: '150px',
    height: '200px',
    borderRadius: '12px',
    border: '3px solid white',
    objectFit: 'cover',
    background: '#000'
  },
  controls: {
    position: 'absolute',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '20px',
    zIndex: 10
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
    fontSize: '24px',
    transition: 'all 0.3s',
    color: 'white'
  },
  answerButton: {
    background: '#4CAF50',
    '&:hover': {
      background: '#45a049'
    }
  },
  rejectButton: {
    background: '#f44336',
    '&:hover': {
      background: '#da190b'
    }
  },
  endButton: {
    background: '#f44336',
    '&:hover': {
      background: '#da190b'
    }
  },
  muteButton: {
    background: '#2196F3',
    '&:hover': {
      background: '#0b7dda'
    }
  },
  muteButtonActive: {
    background: '#ff9800',
    '&:hover': {
      background: '#e68900'
    }
  }
};