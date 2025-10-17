import io from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants.js';

let socket = null;

export const initSocket = (token) => {
  if (socket) return socket;
  
  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });
  
  socket.on('connect', () => {
    console.log('✅ Connected to Socket.io');
    
    // Automatically emit user:online when connected
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      console.log('📤 Emitting user:online on connect');
      socket.emit('user:online', { userId: user.id });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Disconnected from Socket.io');
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    // Emit user:offline before disconnecting
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      console.log('📤 Emitting user:offline before disconnect');
      socket.emit('user:offline', { userId: user.id });
    }
    
    socket.disconnect();
    socket = null;
  }
};

// Emit events
export const socketEmit = (event, data) => {
  if (socket) {
    socket.emit(event, data);
  }
};

// Listen events
export const socketOn = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  }
};

// Remove listener
export const socketOff = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};

// Join room
export const joinConversation = (conversationId) => {
  socketEmit('conversation:join', conversationId);
};

// Leave room
export const leaveConversation = (conversationId) => {
  socketEmit('conversation:leave', conversationId);
};

// User status
export const setUserOnline = (userId) => {
  socketEmit('user:online', { userId });
};

export const setUserOffline = (userId) => {
  socketEmit('user:offline', { userId });
};

// Messaging
export const sendMessage = (conversationId, message) => {
  socketEmit('message:send', { conversationId, message });
};

export const typingStart = (conversationId, userId) => {
  socketEmit('typing:start', { conversationId, userId });
};

export const typingStop = (conversationId, userId) => {
  socketEmit('typing:stop', { conversationId, userId });
};

// WebRTC
export const initiateCall = (data) => {
  socketEmit('call:initiate', data);
};

export const answerCall = (data) => {
  socketEmit('call:answer', data);
};

export const rejectCall = (data) => {
  socketEmit('call:reject', data);
};

export const sendICECandidate = (data) => {
  socketEmit('ice:candidate', data);
};

export const endCall = (data) => {
  socketEmit('call:end', data);
};