import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useChat } from '../../hooks/useChat.js';
import { useCall } from '../../hooks/useCall.js';
import { useSocket } from '../../hooks/useSocket.js';
import { formatTime } from '../../utils/helpers.js';
import { FiSend, FiPhone, FiVideo } from 'react-icons/fi';
import { chatAPI } from '../../services/api.js';
import { storeConversationKey, getConversationKey, decryptMessage, encryptMessage } from '../../services/encryption.js';
import { callHandler } from "./CallHandler.js";
import { CallModal } from './CallModels.jsx';
import CryptoJS from 'crypto-js';
import toast from 'react-hot-toast';

export function ChatWindow({ conversationId, recipientName }) {
  const { user } = useAuth();
  const { messages, setMessages, sendMessage, fetchMessages } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [keyLoaded, setKeyLoaded] = useState(false);

  // ADDED: Fetch and store encryption key when conversation loads
  useEffect(() => {
    if (conversationId) {
      const loadEncryptionKey = async () => {
        try {
          console.log('🔐 Fetching encryption key for conversation:', conversationId);
          const response = await chatAPI.getEncryptionKey(conversationId);
          
          console.log('📦 Response:', response);
          
          if (response.data && response.data.encryptionKey) {
            storeConversationKey(conversationId, response.data.encryptionKey);
            setKeyLoaded(true);
            console.log('✅ Encryption key loaded and stored:', response.data.encryptionKey.substring(0, 10) + '...');
            toast.success('Encryption key loaded');
          } else {
            console.error('❌ No encryption key in response');
            toast.error('No encryption key received');
          }
        } catch (error) {
          console.error('❌ Failed to load encryption key:', error);
          console.error('Error details:', error.response?.data || error.message);
          toast.error('Failed to load encryption key: ' + (error.response?.data?.message || error.message));
        }
      };

      loadEncryptionKey();
    }
  }, [conversationId]);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  // Listen for incoming messages via socket
  useSocket('message:receive', (data) => {
    console.log('📨 Received message:', data);
    setMessages(prev => [...prev, data]);
  });

  useSocket('typing:active', ({ userId }) => {
    setTypingUsers(prev => new Set(prev).add(userId));
  });

  useSocket('typing:inactive', ({ userId }) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    // ADDED: Check if encryption key is loaded
    if (!keyLoaded) {
      toast.error('Encryption key not ready. Please wait...');
      return;
    }

    try {
      // MODIFIED: Get conversation-specific key
      const key = getConversationKey(conversationId);
      if (!key) {
        toast.error('Encryption key not found');
        return;
      }

      // Encrypt with conversation key
      const message = { text: messageInput };
      const encryptedContent = CryptoJS.AES.encrypt(
        JSON.stringify(message),
        key
      ).toString();

      if (!encryptedContent) {
        toast.error('Encryption failed');
        return;
      }

      await sendMessage(conversationId, {
        encryptedContent: encryptedContent,
        encryptionMetadata: {
          algorithm: 'AES',
          version: '1'
        },
        messageType: 'text'
      });

      setMessageInput('');
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    // Emit typing event to socket
  };

  // MODIFIED: Decrypt messages using conversation-specific key
  const displayMessages = messages.map(msg => {
    let decryptedText = 'Could not decrypt message';
    
    try {
      if (msg.encryptedContent) {
        const key = getConversationKey(conversationId);
        if (key) {
          const decrypted = decryptMessage(msg.encryptedContent, key);
          if (decrypted && decrypted.text) {
            decryptedText = decrypted.text;
          } else {
            console.warn('⚠️ Decryption returned empty result for message:', msg._id);
          }
        } else {
          console.warn('⚠️ No encryption key available for decryption');
        }
      }
    } catch (error) {
      console.error('Decryption error:', error);
    }

    const currentUserId = user?.id || user?._id;
    const senderId = msg.senderId?._id || msg.senderId?.id || msg.senderId;
    const isOwn = senderId === currentUserId;

    return {
      ...msg,
      text: decryptedText,
      isOwn
    };
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.name}>{recipientName}</h2>
          {!keyLoaded && <p style={styles.loadingText}>Loading encryption...</p>}
        </div>
        <div style={styles.actions}>
          <button style={styles.iconButton}><FiPhone size={20} /></button>
          <button style={styles.iconButton}><FiVideo size={20} /></button>
        </div>
      </div>

      <div style={styles.messagesContainer}>
        {displayMessages.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          displayMessages.map((msg) => (
            <div key={msg._id} style={{
              ...styles.messageGroup,
              justifyContent: msg.isOwn ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                ...styles.message,
                background: msg.isOwn ? 'var(--primary-color)' : 'var(--surface-dark)',
                color: msg.isOwn ? 'white' : 'var(--text-primary)'
              }}>
                <p style={styles.messageText}>{msg.text}</p>
                <span style={styles.time}>{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          ))
        )}
        {typingUsers.size > 0 && (
          <div style={styles.typingIndicator}>
            <span>Someone is typing</span>
            <span style={styles.dots}>•••</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} style={styles.inputArea}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => {
            setMessageInput(e.target.value);
            handleTyping();
          }}
          placeholder={keyLoaded ? "Type a message..." : "Loading encryption..."}
          style={styles.input}
          disabled={!keyLoaded}
        />
        <button 
          type="submit" 
          style={styles.sendButton}
          disabled={!keyLoaded}
        >
          <FiSend size={20} />
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--surface)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow)'
  },
  name: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0
  },
  loadingText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: '4px 0 0 0'
  },
  actions: {
    display: 'flex',
    gap: '12px'
  },
  iconButton: {
    background: 'var(--surface-dark)',
    border: 'none',
    padding: '8px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--primary-color)',
    transition: 'all 0.3s'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  emptyState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: 'var(--text-secondary)',
    fontSize: '14px'
  },
  messageGroup: {
    display: 'flex',
    marginBottom: '8px'
  },
  message: {
    padding: '12px 16px',
    borderRadius: '12px',
    maxWidth: '60%',
    wordWrap: 'break-word'
  },
  messageText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.4'
  },
  time: {
    fontSize: '11px',
    opacity: 0.7,
    marginTop: '4px',
    display: 'block'
  },
  typingIndicator: {
    display: 'flex',
    gap: '4px',
    padding: '12px',
    color: 'var(--text-secondary)',
    fontSize: '14px'
  },
  dots: {
    animation: 'pulse 1.4s infinite'
  },
  inputArea: {
    display: 'flex',
    gap: '12px',
    padding: '16px 20px',
    borderTop: '1px solid var(--border-color)',
    background: 'var(--surface)'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none'
  },
  sendButton: {
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48px',
    minHeight: '48px'
  }
};