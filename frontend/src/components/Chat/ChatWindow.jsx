/**
 * CHAT WINDOW COMPONENT - WITH SIMPLE DEMO BUTTON
 * 
 * This version doesn't need EncryptionDemoPanel.jsx
 * It shows encryption details in an alert/console for now
 * 
 * COPY THIS IF YOU HAVEN'T CREATED EncryptionDemoPanel.jsx YET
 */

import React, { useEffect, useState } from 'react';
import { EncryptionDemoPanel } from './EncryptionDemoPanel.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useChat } from '../../hooks/useChat.js';
import { useSocket } from '../../hooks/useSocket.js';
import { formatTime } from '../../utils/helpers.js';
import { FiSend } from 'react-icons/fi';
import { userAPI } from '../../services/api.js';
import { 
  getMyKeys,
  computeSharedSecret,
  deriveConversationKey,
  storeConversationKey, 
  getConversationKey, 
  encryptMessage,
  decryptMessage 
} from '../../services/e2eEncryption.js';
import toast from 'react-hot-toast';

export function ChatWindow({ conversationId, recipientName, recipientId }) {
  const { user } = useAuth();
  const { messages, setMessages, sendMessage, fetchMessages } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [keyLoaded, setKeyLoaded] = useState(false);
  const [keyExchangeStatus, setKeyExchangeStatus] = useState('idle');

  /**
   * PERFORM ECDH KEY EXCHANGE
   */
  useEffect(() => {
    if (conversationId && recipientId) {
      const performKeyExchange = async () => {
        try {
          setKeyExchangeStatus('exchanging');
          console.log('🤝 Starting ECDH key exchange...');
          
          const myKeys = getMyKeys();
          if (!myKeys) {
            toast.error('Your encryption keys not found');
            console.error('❌ No local keys found');
            return;
          }
          
          console.log('✅ My keys loaded');
          
          console.log('📥 Fetching recipient public key...');
          const response = await userAPI.getPublicKey(recipientId);
          
          if (!response.data || !response.data.publicKey) {
            toast.error('Recipient public key not found');
            console.error('❌ Recipient has no public key');
            return;
          }
          
          const recipientPublicKey = response.data.publicKey;
          console.log('✅ Recipient public key received');
          
          console.log('🔒 Computing shared secret...');
          const sharedSecret = computeSharedSecret(
            myKeys.privateKey,
            recipientPublicKey
          );
          
          console.log('✅ Shared secret computed');
          
          console.log('🔑 Deriving conversation key...');
          const conversationKey = deriveConversationKey(
            sharedSecret,
            conversationId
          );
          
          console.log('✅ Conversation key derived');
          
          storeConversationKey(conversationId, conversationKey);
          
          setKeyLoaded(true);
          setKeyExchangeStatus('complete');
          console.log('✅ E2E encryption ready');
          toast.success('🔒 Encrypted connection established');
          
        } catch (error) {
          setKeyExchangeStatus('failed');
          console.error('❌ Key exchange failed:', error);
          toast.error('Failed to establish encryption');
        }
      };
      
      performKeyExchange();
    }
  }, [conversationId, recipientId]);

  /**
   * LOAD MESSAGES
   */
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  /**
   * LISTEN FOR INCOMING MESSAGES
   */
  useSocket('message:receive', (data) => {
    console.log('📨 Received encrypted message');
    setMessages(prev => [...prev, data]);
  });

  /**
   * TYPING INDICATORS
   */
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

  /**
   * SEND MESSAGE (WITH XSalsa20-Poly1305 ENCRYPTION)
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    if (!keyLoaded) {
      toast.error('Encryption not ready');
      return;
    }

    try {
      const key = getConversationKey(conversationId);
      if (!key) {
        toast.error('Encryption key not found');
        return;
      }

      const encrypted = encryptMessage(messageInput, key);

      if (!encrypted) {
        toast.error('Encryption failed');
        return;
      }

      console.log('📤 Sending encrypted message...');
      
      const messagePayload = {
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.nonce,
        algorithm: 'XSalsa20-Poly1305',
        version: '2.0',
        messageType: 'text'
      };
      
      console.log('📦 Payload:', {
        conversationId,
        ciphertext: encrypted.ciphertext.substring(0, 30) + '...',
        nonce: encrypted.nonce.substring(0, 30) + '...',
        algorithm: 'XSalsa20-Poly1305'
      });

      const result = await sendMessage(conversationId, messagePayload);

      console.log('✅ Message sent successfully:', result);
      setMessageInput('');

    } catch (error) {
      console.error('❌ Send failed:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 400) {
        toast.error('Invalid message format - check console');
      } else if (error.response?.status === 404) {
        toast.error('Conversation not found');
      } else {
        toast.error('Failed to send message');
      }
    }
  };

  /**
   * SHOW ENCRYPTION DEMO (Simple Version)
   */
  const showEncryptionDemo = async () => {
    try {
      const myKeys = getMyKeys();
      const recipientResponse = await userAPI.getPublicKey(recipientId);
      const myPublicResponse = await userAPI.getPublicKey(user.id || user._id);
      const sharedSecret = computeSharedSecret(myKeys.privateKey, recipientResponse.data.publicKey);
      const conversationKey = getConversationKey(conversationId);
      
      // Test encryption
      const testMessage = "Hello, this is a test!";
      const encrypted = encryptMessage(testMessage, conversationKey);
      const decrypted = decryptMessage(encrypted.ciphertext, encrypted.nonce, conversationKey);
      
      console.log('=== ENCRYPTION DEMONSTRATION ===');
      console.log('1️⃣ MY PUBLIC KEY (in MongoDB):', myPublicResponse.data.publicKey);
      console.log('2️⃣ MY PRIVATE KEY (in browser):', myKeys.privateKey);
      console.log('3️⃣ RECIPIENT PUBLIC KEY:', recipientResponse.data.publicKey);
      console.log('4️⃣ SHARED SECRET:', sharedSecret);
      console.log('5️⃣ CONVERSATION KEY:', conversationKey);
      console.log('6️⃣ TEST ENCRYPTION:');
      console.log('   Original:', testMessage);
      console.log('   Ciphertext:', encrypted.ciphertext);
      console.log('   Nonce:', encrypted.nonce);
      console.log('   Decrypted:', decrypted);
      console.log('   Match:', testMessage === decrypted ? '✅ YES' : '❌ NO');
      console.log('================================');
      
      alert('✅ Encryption details logged to console!\n\nPress F12 to open DevTools and see:\n- Your keys\n- Shared secret\n- Encryption/decryption demo\n\nCheck the Console tab!');
      
    } catch (error) {
      console.error('Demo failed:', error);
      alert('Failed to show demo. Check console for details.');
    }
  };

  /**
   * TYPING INDICATOR
   */
  const handleTyping = () => {
    // Emit typing event (implement socket emission here if needed)
  };

  /**
   * DECRYPT MESSAGES FOR DISPLAY
   */
  const displayMessages = messages.map(msg => {
    let decryptedText = 'Could not decrypt';
    
    try {
      if (msg.ciphertext && msg.nonce) {
        const key = getConversationKey(conversationId);
        
        if (key) {
          decryptedText = decryptMessage(
            msg.ciphertext,
            msg.nonce,
            key
          );
          
          if (!decryptedText) {
            decryptedText = 'Decryption failed';
          }
        } else {
          console.warn('⚠️ No decryption key');
          decryptedText = 'No decryption key';
        }
      } else if (msg.encryptedContent) {
        decryptedText = '[Old format - cannot decrypt]';
        console.warn('⚠️ Message has old encryptedContent format');
      }
    } catch (error) {
      console.error('❌ Decryption error:', error);
      decryptedText = 'Decryption error';
    }

    const currentUserId = user?.id || user?._id;
    const senderId = msg.senderId?._id || msg.senderId?.id || msg.senderId || msg.sender?._id || msg.sender?.id || msg.sender;
    const isOwn = senderId === currentUserId;

    return {
      ...msg,
      text: decryptedText,
      isOwn
    };
  });

  /**
   * RENDER
   */
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.name}>{recipientName}</h2>
          {keyExchangeStatus === 'exchanging' && (
            <p style={styles.loadingText}>🔒 Establishing encryption...</p>
          )}
          {keyExchangeStatus === 'complete' && (
            <p style={styles.encryptedBadge}>🔒 End-to-end encrypted</p>
          )}
          {keyExchangeStatus === 'failed' && (
            <p style={styles.errorText}>❌ Encryption failed</p>
          )}
        </div>
        
        {/* Demo Button */}
        <div style={styles.headerRight}>
          {keyLoaded && (
            <button 
              onClick={showEncryptionDemo} 
              style={styles.demoButton}
              title="Show encryption details in console"
            >
              🔐 Show Demo
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
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
            <span>Typing</span>
            <span style={styles.dots}>•••</span>
          </div>
        )}
      </div>

      {/* Input */}
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

/**
 * STYLES
 */
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
  headerLeft: {
    flex: 1
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
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
  encryptedBadge: {
    fontSize: '12px',
    color: 'var(--success)',
    margin: '4px 0 0 0',
    fontWeight: '500'
  },
  errorText: {
    fontSize: '12px',
    color: 'var(--error)',
    margin: '4px 0 0 0',
    fontWeight: '500'
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
  },
  demoButton: {
    background: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background 0.2s',
    whiteSpace: 'nowrap'
  }
};