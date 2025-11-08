/**
 * E2E ENCRYPTION SERVICE - FRONTEND
 * 
 * CREATE THIS NEW FILE AT: frontend/src/services/e2eEncryption.js
 * 
 * IMPORTANT: Install dependencies first!
 * npm install tweetnacl tweetnacl-util
 */

import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

/**
 * INITIALIZE E2E ENCRYPTION
 */
export const initializeE2E = () => {
  console.log('🔐 Initializing E2E encryption');
  console.log('   Library: TweetNaCl');
  console.log('   Curve: Curve25519');
  
  const existingKeys = getMyKeys();
  if (existingKeys) {
    console.log('✅ Existing key pair found');
    return existingKeys;
  } else {
    console.log('⚠️ No key pair found');
    return null;
  }
};

/**
 * GENERATE KEY PAIR
 */
export const generateKeyPair = () => {
  try {
    console.log('🔑 Generating new ECC key pair...');
    
    const keyPair = nacl.box.keyPair();
    
    const privateKeyBase64 = naclUtil.encodeBase64(keyPair.secretKey);
    const publicKeyBase64 = naclUtil.encodeBase64(keyPair.publicKey);
    
    console.log('✅ Key pair generated');
    console.log('   Private key length:', keyPair.secretKey.length, 'bytes');
    console.log('   Public key length:', keyPair.publicKey.length, 'bytes');
    
    return {
      privateKey: privateKeyBase64,
      publicKey: publicKeyBase64,
      algorithm: 'Curve25519',
      createdAt: Date.now()
    };
    
  } catch (error) {
    console.error('❌ Key generation failed:', error);
    throw new Error('Failed to generate key pair');
  }
};

/**
 * STORE MY KEYS
 */
export const storeMyKeys = (privateKey, publicKey) => {
  try {
    const keyData = {
      privateKey,
      publicKey,
      algorithm: 'Curve25519',
      createdAt: Date.now(),
      version: '2.0'
    };
    
    localStorage.setItem('e2e_my_keys', JSON.stringify(keyData));
    
    console.log('✅ Keys stored in localStorage');
    
  } catch (error) {
    console.error('❌ Failed to store keys:', error);
    throw new Error('Failed to store keys');
  }
};

/**
 * GET MY KEYS
 */
export const getMyKeys = () => {
  try {
    const keyDataStr = localStorage.getItem('e2e_my_keys');
    
    if (!keyDataStr) {
      return null;
    }
    
    const keyData = JSON.parse(keyDataStr);
    return keyData;
    
  } catch (error) {
    console.error('❌ Failed to retrieve keys:', error);
    return null;
  }
};

/**
 * COMPUTE SHARED SECRET (ECDH)
 */
export const computeSharedSecret = (myPrivateKey, theirPublicKey) => {
  try {
    console.log('🤝 Computing shared secret via ECDH...');
    
    const privateKey = naclUtil.decodeBase64(myPrivateKey);
    const publicKey = naclUtil.decodeBase64(theirPublicKey);
    
    if (privateKey.length !== 32) {
      throw new Error('Invalid private key length');
    }
    if (publicKey.length !== 32) {
      throw new Error('Invalid public key length');
    }
    
    const sharedSecret = nacl.scalarMult(privateKey, publicKey);
    
    console.log('✅ Shared secret computed');
    
    return sharedSecret;
    
  } catch (error) {
    console.error('❌ Shared secret computation failed:', error);
    throw new Error('Failed to compute shared secret');
  }
};

/**
 * DERIVE CONVERSATION KEY
 */
export const deriveConversationKey = (sharedSecret, conversationId) => {
  try {
    console.log('🔐 Deriving conversation key...');
    
    const info = naclUtil.decodeUTF8(conversationId);
    const combined = new Uint8Array(sharedSecret.length + info.length);
    combined.set(sharedSecret);
    combined.set(info, sharedSecret.length);
    
    const key = nacl.hash(combined).slice(0, 32);
    
    console.log('✅ Conversation key derived');
    
    return naclUtil.encodeBase64(key);
    
  } catch (error) {
    console.error('❌ Key derivation failed:', error);
    throw new Error('Failed to derive conversation key');
  }
};

/**
 * STORE CONVERSATION KEY
 */
export const storeConversationKey = (conversationId, key) => {
  const storageKey = `conv_key_${conversationId}`;
  localStorage.setItem(storageKey, key);
  console.log(`✅ Stored conversation key: ${conversationId.substring(0, 8)}...`);
};

/**
 * GET CONVERSATION KEY
 */
export const getConversationKey = (conversationId) => {
  const storageKey = `conv_key_${conversationId}`;
  const key = localStorage.getItem(storageKey);
  
  if (!key) {
    console.warn(`⚠️ No conversation key: ${conversationId}`);
  }
  
  return key;
};

/**
 * ENCRYPT MESSAGE
 */
export const encryptMessage = (plaintext, keyBase64) => {
  try {
    console.log('🔒 Encrypting message...');
    
    const key = naclUtil.decodeBase64(keyBase64);
    
    if (key.length !== 32) {
      throw new Error('Invalid key length');
    }
    
    const nonce = nacl.randomBytes(24);
    const messageBytes = naclUtil.decodeUTF8(plaintext);
    const ciphertext = nacl.secretbox(messageBytes, nonce, key);
    
    console.log('✅ Message encrypted');
    
    return {
      ciphertext: naclUtil.encodeBase64(ciphertext),
      nonce: naclUtil.encodeBase64(nonce),
      algorithm: 'XSalsa20-Poly1305',
      version: '2.0'
    };
    
  } catch (error) {
    console.error('❌ Encryption failed:', error);
    throw new Error('Failed to encrypt message');
  }
};

/**
 * DECRYPT MESSAGE
 */
export const decryptMessage = (ciphertextBase64, nonceBase64, keyBase64) => {
  try {
    console.log('🔓 Decrypting message...');
    
    const ciphertext = naclUtil.decodeBase64(ciphertextBase64);
    const nonce = naclUtil.decodeBase64(nonceBase64);
    const key = naclUtil.decodeBase64(keyBase64);
    
    if (nonce.length !== 24) {
      throw new Error('Invalid nonce length');
    }
    if (key.length !== 32) {
      throw new Error('Invalid key length');
    }
    
    const messageBytes = nacl.secretbox.open(ciphertext, nonce, key);
    
    if (!messageBytes) {
      console.error('❌ Decryption failed');
      return null;
    }
    
    const plaintext = naclUtil.encodeUTF8(messageBytes);
    
    console.log('✅ Message decrypted');
    
    return plaintext;
    
  } catch (error) {
    console.error('❌ Decryption error:', error);
    return null;
  }
};

/**
 * GENERATE SAFETY NUMBER
 */
export const generateSafetyNumber = (myPublicKey, theirPublicKey, conversationId) => {
  try {
    console.log('🔒 Generating safety number...');
    
    const keys = [myPublicKey, theirPublicKey].sort();
    
    const key1 = naclUtil.decodeBase64(keys[0]);
    const key2 = naclUtil.decodeBase64(keys[1]);
    const convId = naclUtil.decodeUTF8(conversationId);
    
    const combined = new Uint8Array(key1.length + key2.length + convId.length);
    combined.set(key1);
    combined.set(key2, key1.length);
    combined.set(convId, key1.length + key2.length);
    
    const hash = nacl.hash(combined);
    
    let number = BigInt(0);
    for (let i = 0; i < 25; i++) {
      number = (number * BigInt(256)) + BigInt(hash[i]);
    }
    
    const safetyNumber = number.toString().padStart(60, '0');
    const formatted = safetyNumber.match(/.{1,5}/g).join(' ');
    
    console.log('✅ Safety number generated');
    
    return {
      safetyNumber,
      formatted,
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error('❌ Safety number generation failed:', error);
    throw new Error('Failed to generate safety number');
  }
};

/**
 * REMOVE CONVERSATION KEY
 */
export const removeConversationKey = (conversationId) => {
  const storageKey = `conv_key_${conversationId}`;
  localStorage.removeItem(storageKey);
  console.log(`🗑️ Removed conversation key: ${conversationId}`);
};

/**
 * REMOVE ALL KEYS
 */
export const removeAllKeys = () => {
  localStorage.removeItem('e2e_my_keys');
  
  const keys = Object.keys(localStorage);
  let count = 0;
  
  keys.forEach(key => {
    if (key.startsWith('conv_key_')) {
      localStorage.removeItem(key);
      count++;
    }
  });
  
  console.log('🗑️ Removed all encryption keys');
  console.log(`   User keys: deleted`);
  console.log(`   Conversation keys: ${count} deleted`);
};

/**
 * GET MY PUBLIC KEY
 */
export const getMyPublicKey = () => {
  const keys = getMyKeys();
  if (!keys) {
    throw new Error('No keys found');
  }
  return keys.publicKey;
};

export default {
  initializeE2E,
  generateKeyPair,
  storeMyKeys,
  getMyKeys,
  computeSharedSecret,
  deriveConversationKey,
  storeConversationKey,
  getConversationKey,
  encryptMessage,
  decryptMessage,
  generateSafetyNumber,
  removeConversationKey,
  removeAllKeys,
  getMyPublicKey
};