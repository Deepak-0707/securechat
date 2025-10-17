import React, { createContext, useState, useCallback } from 'react';
import { chatAPI } from '../services/api.js';
import toast from 'react-hot-toast';

export const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId) => {
    setLoading(true);
    try {
      const response = await chatAPI.getMessages(conversationId);
      setMessages(response.data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (conversationId, messageData) => {
    try {
      const response = await chatAPI.sendMessage({
        conversationId,
        ...messageData
      });
      setMessages(prev => [...prev, response.data.data]);
      return response.data;
    } catch (error) {
      toast.error('Failed to send message');
      throw error;
    }
  }, []);

  const deleteMessage = useCallback(async (messageId) => {
    try {
      await chatAPI.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m._id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        setCurrentConversation,
        messages,
        setMessages,
        loading,
        typing,
        setTyping,
        fetchConversations,
        fetchMessages,
        sendMessage,
        deleteMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}