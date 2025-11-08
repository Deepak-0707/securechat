/**
 * ECC SERVICE - BACKEND
 * 
 * CREATE THIS NEW FILE AT: backend/src/services/eccService.js
 * 
 * Purpose: Server-side ECC support (mostly for validation and testing)
 * Note: Server does NOT decrypt messages in this implementation
 */

const crypto = require('crypto');

/**
 * GENERATE ECC KEY PAIR (FOR TESTING/REFERENCE)
 */
const generateECCKeyPair = () => {
  try {
    const ecdh = crypto.createECDH('X25519');
    ecdh.generateKeys();
    
    const privateKey = ecdh.getPrivateKey('hex');
    const publicKey = ecdh.getPublicKey('hex');
    
    console.log('🔑 Generated ECC key pair');
    
    return {
      privateKey,
      publicKey,
      curve: 'X25519',
      keySize: 256
    };
    
  } catch (error) {
    console.error('❌ Key generation failed:', error);
    throw new Error('Failed to generate ECC key pair');
  }
};

/**
 * COMPUTE SHARED SECRET (ECDH)
 */
const computeSharedSecret = (privateKeyHex, publicKeyHex) => {
  try {
    const privateKey = Buffer.from(privateKeyHex, 'hex');
    const publicKey = Buffer.from(publicKeyHex, 'hex');
    
    if (privateKey.length !== 32) {
      throw new Error('Invalid private key length (expected 32 bytes)');
    }
    if (publicKey.length !== 32) {
      throw new Error('Invalid public key length (expected 32 bytes)');
    }
    
    const ecdh = crypto.createECDH('X25519');
    ecdh.setPrivateKey(privateKey);
    
    const sharedSecret = ecdh.computeSecret(publicKey);
    
    console.log('🤝 Computed shared secret');
    
    return sharedSecret;
    
  } catch (error) {
    console.error('❌ Shared secret computation failed:', error);
    throw new Error('Failed to compute shared secret');
  }
};

/**
 * DERIVE AES KEY FROM SHARED SECRET
 */
const deriveAESKey = (sharedSecret, salt = null, info = 'e2e-chat-key') => {
  try {
    const saltBuffer = salt 
      ? Buffer.from(salt, 'hex')
      : crypto.randomBytes(32);
    
    const infoBuffer = Buffer.from(info, 'utf8');
    
    // HKDF-Extract
    const prk = crypto.createHmac('sha256', saltBuffer)
      .update(sharedSecret)
      .digest();
    
    // HKDF-Expand
    const okm = crypto.createHmac('sha256', prk)
      .update(Buffer.concat([infoBuffer, Buffer.from([0x01])]))
      .digest();
    
    console.log('🔐 Derived AES key from shared secret');
    
    return {
      key: okm,
      salt: saltBuffer.toString('hex')
    };
    
  } catch (error) {
    console.error('❌ Key derivation failed:', error);
    throw new Error('Failed to derive AES key');
  }
};

/**
 * GENERATE SAFETY NUMBER
 */
const generateSafetyNumber = (publicKey1, publicKey2, conversationId) => {
  try {
    const keys = [publicKey1, publicKey2].sort();
    const concatenated = keys[0] + keys[1] + conversationId;
    
    const hash = crypto.createHash('sha256')
      .update(concatenated)
      .digest();
    
    const hashBigInt = BigInt('0x' + hash.slice(0, 25).toString('hex'));
    const safetyNumber = hashBigInt.toString().padStart(60, '0');
    
    const formatted = safetyNumber.match(/.{1,5}/g).join(' ');
    
    console.log('🔒 Generated safety number');
    
    return {
      safetyNumber: safetyNumber,
      formatted: formatted,
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error('❌ Safety number generation failed:', error);
    throw new Error('Failed to generate safety number');
  }
};

/**
 * VERIFY PUBLIC KEY
 */
const verifyPublicKey = (publicKeyBase64) => {
  try {
    if (typeof publicKeyBase64 !== 'string') {
      return false;
    }
    
    // TweetNaCl public keys are 44 Base64 characters (32 bytes)
    if (publicKeyBase64.length !== 44) {
      console.warn('⚠️ Invalid public key length:', publicKeyBase64.length);
      return false;
    }
    
    // Check Base64 format
    if (!/^[A-Za-z0-9+/]{43}=$/.test(publicKeyBase64)) {
      console.warn('⚠️ Public key not in Base64 format');
      return false;
    }
    
    // Decode to verify it's valid Base64
    try {
      const buffer = Buffer.from(publicKeyBase64, 'base64');
      if (buffer.length !== 32) {
        console.warn('⚠️ Decoded key is not 32 bytes');
        return false;
      }
    } catch (e) {
      console.warn('⚠️ Invalid Base64 encoding');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Public key verification failed:', error);
    return false;
  }
};

module.exports = {
  generateECCKeyPair,
  computeSharedSecret,
  deriveAESKey,
  generateSafetyNumber,
  verifyPublicKey
};