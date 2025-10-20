import { useCallback } from 'react';
import {
  encryptMessage,
  decryptMessage,
  getConversationKey
} from '../services/encryption.js';

export function useEncryption(conversationId) {
  const encrypt = useCallback((message) => {
    if (!conversationId) {
      console.error('No conversation ID provided');
      return null;
    }

    const key = getConversationKey(conversationId);
    if (!key) {
      console.error('No encryption key for conversation:', conversationId);
      return null;
    }

    return encryptMessage(message, key);
  }, [conversationId]);

  const decrypt = useCallback((encryptedMessage) => {
    if (!conversationId) {
      console.error('No conversation ID provided');
      return null;
    }

    const key = getConversationKey(conversationId);
    if (!key) {
      console.error('No decryption key for conversation:', conversationId);
      return null;
    }

    return decryptMessage(encryptedMessage, key);
  }, [conversationId]);

  return { encrypt, decrypt };
}