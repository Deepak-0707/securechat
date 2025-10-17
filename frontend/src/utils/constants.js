export const API_URL = import.meta.env.VITE_API_URL;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
export const APP_NAME = import.meta.env.VITE_APP_NAME;

console.log('🔧 API_URL:', API_URL); // Add this line temporarily

export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away'
};

export const MESSAGE_TYPE = {
  TEXT: 'text',
  FILE: 'file',
  MEDIA: 'media'
};

export const CALL_STATUS = {
  INITIATING: 'initiating',
  INCOMING: 'incoming',
  ACTIVE: 'active',
  ENDED: 'ended',
  REJECTED: 'rejected'
};

export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Invalid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  SERVER_ERROR: 'Server error. Please try again later.'
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully',
  REGISTER_SUCCESS: 'Account created successfully',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  MESSAGE_SENT: 'Message sent'
};