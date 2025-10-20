import CryptoJS from 'crypto-js';

// Encrypt message with AES
export const encryptMessage = (message, password) => {
  try {
    if (!password) {
      console.error('No password provided for encryption');
      return null;
    }

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(message),
      password
    ).toString();

    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

// Decrypt message - FIXED VERSION
export const decryptMessage = (encryptedData, password) => {
  try {
    if (!encryptedData || !password) {
      console.error('Missing encrypted data or password');
      return null;
    }

    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      password
    ).toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      console.error('Decryption failed - empty result. Wrong key?');
      return null;
    }

    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Hash function
export const hashString = (str) => {
  return CryptoJS.SHA256(str).toString();
};

// Generate random string
export const generateRandomString = (length = 32) => {
  return CryptoJS.lib.WordArray.random(length).toString();
};

// Store conversation-specific encryption key
export const storeConversationKey = (conversationId, key) => {
  localStorage.setItem(`conv_key_${conversationId}`, key);
  console.log(`✅ Stored encryption key for conversation: ${conversationId}`);
};

// Get conversation-specific encryption key
export const getConversationKey = (conversationId) => {
  const key = localStorage.getItem(`conv_key_${conversationId}`);
  if (!key) {
    console.warn(`⚠️ No encryption key found for conversation: ${conversationId}`);
  }
  return key;
};

// Keep this for backwards compatibility (maps to conversation key)
export const getEncryptionKey = () => {
  console.warn('⚠️ getEncryptionKey() is deprecated. Use getConversationKey(conversationId) instead');
  return null;
};

// Clear conversation key (optional - when leaving conversation)
export const removeConversationKey = (conversationId) => {
  localStorage.removeItem(`conv_key_${conversationId}`);
  console.log(`🗑️ Removed encryption key for conversation: ${conversationId}`);
};

// Clear all conversation keys (optional - on logout)
export const removeAllConversationKeys = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('conv_key_')) {
      localStorage.removeItem(key);
    }
  });
  console.log('🗑️ Removed all conversation keys');
};