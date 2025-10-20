import axios from 'axios';
import { API_URL } from '../utils/constants.js';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken
          });
          
          localStorage.setItem('accessToken', response.data.accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
          
          return api(originalRequest);
        } catch (err) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(err);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

// User endpoints
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  searchUsers: (query) => api.get(`/users/search?query=${query}`),
  updateStatus: (status) => api.put('/users/status', { status }),
  uploadPublicKey: (publicKey) => api.post('/users/upload-public-key', { publicKey })
};

// Chat endpoints
export const chatAPI = {
  createConversation: (data) => api.post('/chat/conversations', data),
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId, page = 1, limit = 50) => 
    api.get(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`),
  // NEW: Fetch encryption key for a conversation
  getEncryptionKey: (conversationId) =>
    api.get(`/chat/conversations/${conversationId}/encryption-key`),
  sendMessage: (data) => api.post('/chat/messages', data),
  markAsRead: (messageIds) => api.post('/chat/messages/mark-read', { messageIds }),
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`)
};

// WebRTC endpoints
export const webrtcAPI = {
  initiateCall: (data) => api.post('/webrtc/call/initiate', data),
  answerCall: (data) => api.post('/webrtc/call/answer', data),
  addICECandidate: (data) => api.post('/webrtc/ice-candidate', data),
  endCall: (data) => api.post('/webrtc/call/end', data)
};

export default api;