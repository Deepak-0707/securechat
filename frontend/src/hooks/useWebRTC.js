import { useCallback, useRef, useEffect } from 'react';
import { webrtcManager } from '../services/webrtc.js';

export function useWebRTC() {
  const initialized = useRef(false);

  const initWebRTC = useCallback(async () => {
    if (!initialized.current) {
      await webrtcManager.initialize();
      initialized.current = true;
    }
  }, []);

  const getLocalStream = useCallback(async (audio = true, video = true) => {
    await initWebRTC();
    return webrtcManager.getLocalStream(audio, video);
  }, [initWebRTC]);

  const createOffer = useCallback(async () => {
    await initWebRTC();
    return webrtcManager.createOffer();
  }, [initWebRTC]);

  const createAnswer = useCallback(async () => {
    await initWebRTC();
    return webrtcManager.createAnswer();
  }, [initWebRTC]);

  const handleOffer = useCallback(async (offer) => {
    await initWebRTC();
    return webrtcManager.handleOffer(offer);
  }, [initWebRTC]);

  const handleAnswer = useCallback(async (answer) => {
    return webrtcManager.handleAnswer(answer);
  }, []);

  const addICECandidate = useCallback((candidate) => {
    return webrtcManager.addICECandidate(candidate);
  }, []);

  const stopCall = useCallback(() => {
    webrtcManager.close();
  }, []);

  return {
    getLocalStream,
    createOffer,
    createAnswer,
    handleOffer,
    handleAnswer,
    addICECandidate,
    stopCall
  };
}