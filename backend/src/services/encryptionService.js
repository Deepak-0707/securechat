/**
 * KEY GENERATION - BACKEND
 * 
 * Location: Backend server
 * Timing: When new conversation is created
 * Algorithm: CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)
 * 
 * Process:
 * 1. Use Node.js crypto.randomBytes(32)
 * 2. Generate 32 bytes (256 bits) of random data
 * 3. Convert to hexadecimal string (64 characters)
 * 4. Store in MongoDB Conversation document
 * 5. Send to all conversation participants
 * 
 * Security Properties:
 * - 2^256 possible key combinations
 * - Uses OS entropy sources (/dev/urandom on Linux)
 * - Cryptographically secure (unpredictable)
 * - Suitable for AES-256 encryption
 */

const crypto = require('crypto');

const generateEncryptionKey = () => {
  // Generate 32 random bytes using OS CSPRNG
  const randomBytes = crypto.randomBytes(32);
  
  // Convert to hexadecimal string (64 chars)
  const hexString = randomBytes.toString('hex');
  
  console.log('🔑 Generated encryption key:', hexString.substring(0, 10) + '...');
  return hexString;
};

module.exports = { generateEncryptionKey };