/**
 * ENCRYPTION SERVICE - Frontend
 * 
 * Purpose: Handle client-side message encryption and decryption
 * Algorithm: AES-256-CBC (Advanced Encryption Standard, 256-bit key, Cipher Block Chaining mode)
 * Library: CryptoJS (industry-standard JavaScript crypto library)
 * 
 * Security Model: Symmetric encryption
 * - Same key used for encryption and decryption
 * - Key is shared between conversation participants
 * - Each conversation has a unique key
 */

import CryptoJS from 'crypto-js';

/**
 * ENCRYPT MESSAGE
 * 
 * Converts plaintext message to encrypted ciphertext
 * 
 * Algorithm Details:
 * - AES (Advanced Encryption Standard)
 * - 256-bit key length (32 bytes)
 * - CBC mode (Cipher Block Chaining)
 * - PKCS7 padding (automatic)
 * 
 * @param {Object} message - Message object containing text and metadata
 * @param {string} password - 256-bit hex string used as encryption key
 * @returns {string|null} - Base64 encoded encrypted string or null on failure
 * 
 * Process Flow:
 * 1. Convert message object to JSON string
 * 2. Use AES algorithm to encrypt with provided key
 * 3. Return encrypted data as Base64 string
 * 4. This encrypted string is sent to server and stored in database
 */
export const encryptMessage = (message, password) => {
  try {
    // Validate inputs
    if (!password) {
      console.error('❌ No encryption key provided');
      return null;
    }

    // Step 1: Convert message object to JSON string
    // Example: {text: "Hello"} → '{"text":"Hello"}'
    const messageString = JSON.stringify(message);

    // Step 2: Encrypt using AES-256-CBC
    // CryptoJS.AES.encrypt performs:
    // - Key expansion (derives round keys from main key)
    // - 14 rounds of substitution, permutation, mixing
    // - Produces ciphertext that looks random
    const encrypted = CryptoJS.AES.encrypt(
      messageString,  // Plaintext to encrypt
      password        // 256-bit encryption key
    ).toString();     // Convert to Base64 string for transmission

    console.log('✅ Message encrypted successfully');
    return encrypted;

  } catch (error) {
    console.error('❌ Encryption failed:', error.message);
    return null;
  }
};

/**
 * DECRYPT MESSAGE
 * 
 * Converts encrypted ciphertext back to plaintext
 * 
 * Algorithm Details:
 * - Reverses the AES encryption process
 * - Uses same key that was used for encryption
 * - Decryption will fail if wrong key is used
 * 
 * @param {string} encryptedData - Base64 encoded encrypted string
 * @param {string} password - 256-bit hex string (must match encryption key)
 * @returns {Object|null} - Decrypted message object or null on failure
 * 
 * Process Flow:
 * 1. Receive Base64 encrypted string
 * 2. Use AES algorithm to decrypt with key
 * 3. Convert decrypted bytes to UTF-8 string
 * 4. Parse JSON string back to object
 * 
 * Security Notes:
 * - If key is wrong, decryption produces garbage data
 * - JSON.parse will fail, indicating wrong key or corrupted data
 */
export const decryptMessage = (encryptedData, password) => {
  try {
    // Validate inputs
    if (!encryptedData || !password) {
      console.error('❌ Missing encrypted data or decryption key');
      return null;
    }

    // Step 1: Decrypt using AES-256-CBC (reverse of encryption)
    // CryptoJS.AES.decrypt performs:
    // - Inverse key expansion
    // - 14 rounds of inverse operations
    // - Produces original plaintext if key is correct
    const decryptedBytes = CryptoJS.AES.decrypt(
      encryptedData,  // Base64 ciphertext
      password        // 256-bit decryption key (must match encryption key)
    );

    // Step 2: Convert decrypted bytes to UTF-8 string
    const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);

    // Step 3: Validate decryption was successful
    if (!decryptedString) {
      console.error('❌ Decryption failed - wrong key or corrupted data');
      return null;
    }

    // Step 4: Parse JSON string back to object
    // Example: '{"text":"Hello"}' → {text: "Hello"}
    const messageObject = JSON.parse(decryptedString);

    console.log('✅ Message decrypted successfully');
    return messageObject;

  } catch (error) {
    console.error('❌ Decryption error:', error.message);
    return null;
  }
};

/**
 * HASH STRING
 * 
 * Creates one-way hash of input string using SHA-256
 * 
 * Purpose: Used for password hashing or data integrity
 * Algorithm: SHA-256 (Secure Hash Algorithm, 256-bit output)
 * 
 * @param {string} str - Input string to hash
 * @returns {string} - 64-character hexadecimal hash
 * 
 * Properties:
 * - One-way: Cannot reverse hash to get original
 * - Deterministic: Same input always produces same hash
 * - Collision-resistant: Hard to find two inputs with same hash
 */
export const hashString = (str) => {
  return CryptoJS.SHA256(str).toString();
};

/**
 * GENERATE RANDOM STRING
 * 
 * Creates cryptographically secure random string
 * 
 * Purpose: Generate initialization vectors, salts, or session IDs
 * Method: Uses CryptoJS random number generator
 * 
 * @param {number} length - Length in bytes (default: 32)
 * @returns {string} - Hexadecimal random string
 * 
 * Security: Uses cryptographically secure pseudo-random number generator (CSPRNG)
 */
export const generateRandomString = (length = 32) => {
  return CryptoJS.lib.WordArray.random(length).toString();
};

/**
 * KEY STORAGE FUNCTIONS
 * 
 * Manage conversation-specific encryption keys in browser localStorage
 * 
 * Storage Format:
 * Key: "conv_key_{conversationId}"
 * Value: 256-bit hexadecimal string
 * 
 * Example:
 * Key: "conv_key_507f1f77bcf86cd799439011"
 * Value: "a1b2c3d4e5f6...789" (64 hex characters = 256 bits)
 */

/**
 * STORE CONVERSATION KEY
 * 
 * Saves encryption key for a specific conversation
 * 
 * @param {string} conversationId - MongoDB ObjectId of conversation
 * @param {string} key - 256-bit encryption key (hex string)
 * 
 * Storage Location: Browser localStorage
 * Persistence: Until manually cleared or browser data cleared
 * Security: Accessible only from same origin (domain)
 */
export const storeConversationKey = (conversationId, key) => {
  const storageKey = `conv_key_${conversationId}`;
  localStorage.setItem(storageKey, key);
  console.log(`✅ Stored encryption key for conversation: ${conversationId}`);
};

/**
 * GET CONVERSATION KEY
 * 
 * Retrieves encryption key for a specific conversation
 * 
 * @param {string} conversationId - MongoDB ObjectId of conversation
 * @returns {string|null} - 256-bit encryption key or null if not found
 * 
 * Used by:
 * - encryptMessage() - to encrypt outgoing messages
 * - decryptMessage() - to decrypt incoming messages
 */
export const getConversationKey = (conversationId) => {
  const storageKey = `conv_key_${conversationId}`;
  const key = localStorage.getItem(storageKey);
  
  if (!key) {
    console.warn(`⚠️ No encryption key found for conversation: ${conversationId}`);
  }
  
  return key;
};

/**
 * REMOVE CONVERSATION KEY
 * 
 * Deletes encryption key for a specific conversation
 * 
 * @param {string} conversationId - MongoDB ObjectId of conversation
 * 
 * Use Cases:
 * - User leaves conversation
 * - Conversation is deleted
 * - Security: Key rotation
 */
export const removeConversationKey = (conversationId) => {
  const storageKey = `conv_key_${conversationId}`;
  localStorage.removeItem(storageKey);
  console.log(`🗑️ Removed encryption key for conversation: ${conversationId}`);
};

/**
 * REMOVE ALL CONVERSATION KEYS
 * 
 * Clears all stored encryption keys
 * 
 * Use Cases:
 * - User logout
 * - Security: Clear all sensitive data
 * - Privacy: Ensure no keys remain after session
 * 
 * Process:
 * 1. Iterate through all localStorage keys
 * 2. Remove any key starting with "conv_key_"
 * 3. Ensures clean logout
 */
export const removeAllConversationKeys = () => {
  const keys = Object.keys(localStorage);
  let removedCount = 0;
  
  keys.forEach(key => {
    if (key.startsWith('conv_key_')) {
      localStorage.removeItem(key);
      removedCount++;
    }
  });
  
  console.log(`🗑️ Removed ${removedCount} conversation key(s)`);
};

/**
 * DEPRECATED FUNCTION
 * 
 * Kept for backward compatibility only
 * Use getConversationKey() instead
 */
export const getEncryptionKey = () => {
  console.warn('⚠️ getEncryptionKey() is deprecated. Use getConversationKey(conversationId) instead');
  return null;
};

/**
 * CRYPTOGRAPHIC SUMMARY
 * 
 * Algorithms Used:
 * - Encryption: AES-256-CBC
 * - Hashing: SHA-256
 * - Random: CSPRNG via CryptoJS
 * 
 * Key Properties:
 * - Length: 256 bits (32 bytes)
 * - Format: Hexadecimal string (64 characters)
 * - Scope: Per-conversation (isolated keys)
 * - Storage: Browser localStorage
 *  
 * Security Considerations:
 * ✅ Strong encryption algorithm (AES-256)
 * ✅ Unique key per conversation
 * ✅ Client-side encryption/decryption
 * ⚠️ Key distribution via server (not true E2E)
 * ⚠️ No forward secrecy (same key for all messages)
 * ⚠️ localStorage vulnerable to XSS attacks
 * 
 * Message Flow:
 * 1. User types message
 * 2. Frontend encrypts with conversation key
 * 3. Send encrypted message to server
 * 4. Server stores encrypted message (cannot read)
 * 5. Server forwards to recipient (still encrypted)
 * 6. Recipient decrypts with same key
 * 
 * Key Distribution Flow:
 * 1. Server generates key when conversation created
 * 2. Server sends key to all participants
 * 3. Participants store key in localStorage
 * 4. All messages use this shared key
 */