import { useEffect, useCallback } from 'react';
import { getSocket, socketOn, socketOff } from '../services/socket.js';

export function useSocket(event, callback) {
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socketOn(event, callback);
      return () => socketOff(event, callback);
    }
  }, [event, callback]);
}