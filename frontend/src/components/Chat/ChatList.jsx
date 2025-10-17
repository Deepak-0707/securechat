import React, { useEffect } from 'react';
import { useChat } from '../../hooks/useChat.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatTime } from '../../utils/helpers.js';
import { FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

export function ChatList({ onSelectConversation }) {
  const { conversations, fetchConversations, loading } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, []);

  // Get conversation display name
  const getConversationName = (conv) => {
    if (conv.isGroup || conv.groupName) {
      return conv.groupName || 'Group Chat';
    }
    
    // For direct messages, find the other participant
    if (conv.participants && Array.isArray(conv.participants)) {
      const currentUserId = user?.id || user?._id;
      const otherParticipant = conv.participants.find(
        participant => {
          const participantId = participant._id || participant.id || participant;
          return participantId.toString() !== currentUserId.toString();
        }
      );
      
      if (otherParticipant && otherParticipant.username) {
        return otherParticipant.username;
      }
    }
    
    return 'Unknown User';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Messages</h2>
        <button style={styles.addButton}>
          <FiPlus size={20} />
        </button>
      </div>

      <div style={styles.listContainer}>
        {loading ? (
          <p style={styles.loadingText}>Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <p style={styles.emptyText}>No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv._id}
              style={styles.conversationItem}
              onClick={() => onSelectConversation(conv)}
            >
              <div style={styles.avatar}>
                {conv.isGroup ? '👥' : getConversationName(conv).charAt(0).toUpperCase()}
              </div>
              <div style={styles.content}>
                <h3 style={styles.name}>
                  {getConversationName(conv)}
                </h3>
                <p style={styles.preview}>
                  {conv.lastMessage?.encryptedContent?.substring(0, 40) + '...' || 'No messages'}
                </p>
              </div>
              <span style={styles.time}>
                {formatTime(conv.updatedAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border-color)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--text-primary)'
  },
  addButton: {
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '0'
  },
  conversationItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'background 0.2s',
    '&:hover': {
      background: 'var(--surface-dark)'
    }
  },
  avatar: {
    fontSize: '20px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
    color: 'white',
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    minWidth: 0
  },
  name: {
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 4px 0',
    color: 'var(--text-primary)'
  },
  preview: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  time: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    minWidth: '50px',
    textAlign: 'right'
  },
  loadingText: {
    textAlign: 'center',
    padding: '20px',
    color: 'var(--text-secondary)'
  },
  emptyText: {
    textAlign: 'center',
    padding: '40px 20px',
    color: 'var(--text-secondary)'
  }
};