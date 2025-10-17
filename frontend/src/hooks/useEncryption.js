import { useCallback } from 'react';
import {
  encryptMessage,
  decryptMessage,
  getEncryptionKey
} from '../services/encryption.js';

export function useEncryption() {
  const key = getEncryptionKey();

  const encrypt = useCallback((message) => {
    if (!key) return null;
    return encryptMessage(message, key);
  }, [key]);

  const decrypt = useCallback((encryptedMessage) => {
    if (!key) return null;
    return decryptMessage(encryptedMessage, key);
  }, [key]);

  return { encrypt, decrypt };
}