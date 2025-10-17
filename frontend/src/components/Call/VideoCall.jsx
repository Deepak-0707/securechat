import React, { useEffect, useRef, useState } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC.js';
import { useCall } from '../../hooks/useCall.js';
import { FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export function VideoCall({ recipientId, recipientName }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { getLocalStream, createOffer, stopCall } = useWebRTC();
  const { endCall } = useCall();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    initializeCall();
  }, []);

  const initializeCall = async () => {
    try {
      const stream = await getLocalStream(true, true);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

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

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // Stop video tracks
  };

  return (
    <div style={styles.container}>
      <div style={styles.videosContainer}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          style={styles.video}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          style={{...styles.video, ...styles.remoteVideo}}
        />
      </div>

      <div style={styles.recipientInfo}>
        <h2>{recipientName}</h2>
        <p style={styles.callStatus}>Connected</p>
      </div>

      <div style={styles.controls}>
        <button
          style={{...styles.button, ...styles.muteButton}}
          onClick={toggleMute}
        >
          {isMuted ? <FiMicOff size={24} /> : <FiMic size={24} />}
        </button>
        <button
          style={{...styles.button, ...styles.videoButton}}
          onClick={toggleVideo}
        >
          {isVideoOff ? <FiVideoOff size={24} /> : <FiVideo size={24} />}
        </button>
        <button
          style={{...styles.button, ...styles.endButton}}
          onClick={handleEndCall}
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
    background: '#000',
    color: 'white'
  },
  videosContainer: {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  remoteVideo: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '200px',
    height: '150px',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-lg)'
  },
  recipientInfo: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'rgba(0, 0, 0, 0.6)',
    padding: '16px',
    borderRadius: '8px'
  },
  callStatus: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    color: 'var(--success)'
  },
  controls: {
    position: 'absolute',
    bottom: '30px',
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
    background: 'rgba(102, 126, 234, 0.8)',
    color: 'white'
  },
  videoButton: {
    background: 'rgba(102, 126, 234, 0.8)',
    color: 'white'
  },
  endButton: {
    background: 'var(--error)',
    color: 'white'
  }
};