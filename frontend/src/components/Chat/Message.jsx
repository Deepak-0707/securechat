import React from 'react';
import { formatTime } from '../../utils/helpers.js';
import { FiTrash2 } from 'react-icons/fi';
import { useChat } from '../../hooks/useChat.js';

export function Message({ message, isOwn }) {
  const { deleteMessage } = useChat();

  const handleDelete = async () => {
    if (window.confirm('Delete this message?')) {
      await deleteMessage(message._id);
    }
  };

  return (
    <div style={{
      ...styles.container,
      justifyContent: isOwn ? 'flex-end' : 'flex-start'
    }}>
      <div style={{
        ...styles.message,
        background: isOwn ? 'var(--primary-color)' : 'var(--surface-dark)',
        color: isOwn ? 'white' : 'var(--text-primary)',
        position: 'relative'
      }}>
        <p style={styles.text}>{message.text}</p>
        <span style={{
          ...styles.time,
          color: isOwn ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-secondary)'
        }}>
          {formatTime(message.createdAt)}
        </span>

        {isOwn && (
          <button
            onClick={handleDelete}
            style={styles.deleteButton}
            title="Delete message"
          >
            <FiTrash2 size={14} />
          </button>
        )}

        {message.isRead && isOwn && (
          <span style={styles.readStatus}>✓✓</span>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    marginBottom: '8px'
  },
  message: {
    padding: '12px 16px',
    borderRadius: '12px',
    maxWidth: '70%',
    wordWrap: 'break-word',
    position: 'relative'
  },
  text: {
    margin: '0 0 4px 0',
    fontSize: '14px'
  },
  time: {
    fontSize: '12px',
    opacity: 0.7,
    display: 'block'
  },
  deleteButton: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    padding: '4px',
    opacity: 0,
    transition: 'opacity 0.2s'
  },
  readStatus: {
    fontSize: '12px',
    marginLeft: '4px'
  }
};