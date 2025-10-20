import React, { useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat.js';
import { useAuth } from '../hooks/useAuth.js';
import { useCall } from '../hooks/useCall.js';
import { ChatList } from '../components/Chat/ChatList.jsx';
import { ChatWindow } from '../components/Chat/ChatWindow.jsx';
import { UserSearch } from '../components/Chat/UserSearch.jsx';
import { socketOn, socketOff } from '../services/socket.js';
import { IncomingCall } from '../components/Call/IncomingCall.jsx';
import toast from 'react-hot-toast';

export function HomePage() {
  const { currentConversation, setCurrentConversation, fetchConversations } = useChat();
  const { user } = useAuth();
  const [selectedConvId, setSelectedConvId] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelectConversation = (conv) => {
    setCurrentConversation(conv);
    setSelectedConvId(conv._id);
  };

  const handleConversationCreated = (conv) => {
    setCurrentConversation(conv);
    setSelectedConvId(conv._id);
    fetchConversations();
  };

  // Get recipient name for direct messages
  const getRecipientName = (conversation) => {
    if (!conversation) return '';
    
    // If it's a group chat, return group name
    if (conversation.isGroup || conversation.groupName) {
      return conversation.groupName || 'Group Chat';
    }
    
    // For direct messages, find the other participant
    if (conversation.participants && Array.isArray(conversation.participants)) {
      const currentUserId = user?.id || user?._id;
      
      const otherParticipant = conversation.participants.find(
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
      <div style={styles.sidebar}>
        <UserSearch onConversationCreated={handleConversationCreated} />
        <ChatList onSelectConversation={handleSelectConversation} />
      </div>

      <div style={styles.main}>
        {currentConversation ? (
          <ChatWindow
            conversationId={selectedConvId}
            recipientName={getRecipientName(currentConversation)}
          />
        ) : (
          <div style={styles.emptyState}>
            <h2>Welcome to E2E Chat</h2>
            <p>Select a conversation or search for a user to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 60px)',
    background: 'var(--background)'
  },
  sidebar: {
    width: '320px',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--text-secondary)',
    textAlign: 'center'
  }
};