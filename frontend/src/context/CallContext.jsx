import React, { createContext, useState, useCallback } from 'react';
import { CALL_STATUS } from '../utils/constants.js';

export const CallContext = createContext();

export function CallProvider({ children }) {
  const [callStatus, setCallStatus] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(null);

  const startCall = useCallback((recipientId, isVideo = true) => {
    setCallStatus(CALL_STATUS.INITIATING);
    setCurrentCallId('call_' + Date.now());
  }, []);

  const answerCall = useCallback(() => {
    setCallStatus(CALL_STATUS.ACTIVE);
  }, []);

  const rejectCall = useCallback(() => {
    setIncomingCall(null);
    setCallStatus(CALL_STATUS.REJECTED);
  }, []);

  const endCall = useCallback(() => {
    setCallStatus(CALL_STATUS.ENDED);
    setLocalStream(null);
    setRemoteStream(null);
    setCurrentCallId(null);
    setTimeout(() => setCallStatus(null), 1000);
  }, []);

  return (
    <CallContext.Provider
      value={{
        callStatus,
        setCallStatus,
        incomingCall,
        setIncomingCall,
        localStream,
        setLocalStream,
        remoteStream,
        setRemoteStream,
        currentCallId,
        startCall,
        answerCall,
        rejectCall,
        endCall
      }}
    >
      {children}
    </CallContext.Provider>
  );
}