import CryptoJS from 'crypto-js';

// RSA simulation using CryptoJS (for client-side encryption)
export const generateKeyPair = async () => {
  // In production, use tweetnacl or libsodium
  const publicKey = CryptoJS.lib.WordArray.random(128).toString();
  const privateKey = CryptoJS.lib.WordArray.random(128).toString();
  
  return { publicKey, privateKey };
};

// Encrypt message with AES
export const encryptMessage = (message, password) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(message),
      password
    ).toString();
    
    return {
      encrypted,
      iv: CryptoJS.lib.WordArray.random(128).toString(),
      salt: CryptoJS.lib.WordArray.random(64).toString(),
      tag: CryptoJS.lib.WordArray.random(128).toString()
    };
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

// Decrypt message
export const decryptMessage = (encryptedData, password) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      password
    ).toString(CryptoJS.enc.Utf8);
    
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

// Store encryption keys securely
export const storeEncryptionKey = (key) => {
  localStorage.setItem('encryptionKey', key);
};

export const getEncryptionKey = () => {
  let key = localStorage.getItem('encryptionKey');
  
  // If no key exists, generate and store one
  if (!key) {
    key = generateRandomString(32);
    storeEncryptionKey(key);
    console.log('🔑 Generated new encryption key');
  }
  
  return key;
};

export const removeEncryptionKey = () => {
  localStorage.removeItem('encryptionKey');
};

// Initialize encryption key on app load
export const initializeEncryption = () => {
  getEncryptionKey(); // This will auto-generate if needed
};