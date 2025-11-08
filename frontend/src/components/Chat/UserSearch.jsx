import React, { useState } from 'react';
import { userAPI } from '../../services/api.js';
import { chatAPI } from '../../services/api.js';
import { FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

export function UserSearch({ onConversationCreated }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await userAPI.searchUsers(query);
      setSearchResults(response.data.users);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = async (user) => {
    try {
      // Use _id (MongoDB) or id as fallback
      const userId = user._id || user.id;
      
      console.log('Creating conversation with user:', userId);
      
      const response = await chatAPI.createConversation({
        participantIds: [userId],
        isGroup: false
      });
      
      onConversationCreated(response.data.conversation);
      setSearchQuery('');
      setSearchResults([]);
      toast.success('Conversation started');
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.searchBox}>
        <FiSearch style={styles.icon} />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={styles.input}
        />
      </div>

      {searchResults.length > 0 && (
        <div style={styles.results}>
          {searchResults.map((user) => (
            <div
              key={user._id || user.id}
              style={styles.resultItem}
              onClick={() => handleSelectUser(user)}
            >
              <div style={styles.userInfo}>
                <h4 style={styles.username}>{user.username}</h4>
                <p style={styles.email}>{user.email}</p>
              </div>
              <span style={{
                ...styles.status,
                background: user.status === 'online' ? 'var(--success)' : 'var(--text-secondary)'
              }}>
                {user.status || 'offline'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '16px',
    borderBottom: '1px solid var(--border-color)'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--surface-dark)',
    borderRadius: '24px',
    padding: '8px 12px',
    gap: '8px'
  },
  icon: {
    color: 'var(--text-secondary)',
    fontSize: '18px'
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: 'var(--text-primary)'
  },
  results: {
    marginTop: '12px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: 'var(--shadow)',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  resultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderBottom: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  userInfo: {
    flex: 1
  },
  username: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  email: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  status: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    color: 'white',
    fontWeight: '600'
  }
};