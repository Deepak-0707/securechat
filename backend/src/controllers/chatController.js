/**
 * CHAT CONTROLLER - Complete E2E Encryption Version
 * 
 * Location: backend/src/controllers/chatController.js
 * 
 * REPLACE YOUR ENTIRE chatController.js FILE WITH THIS
 */

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const crypto = require('crypto');

/**
 * GENERATE ENCRYPTION KEY
 */
const generateEncryptionKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * CREATE CONVERSATION
 */
const createConversation = async (req, res) => {
  try {
    const { participantIds, isGroup, groupName } = req.body;
    const currentUserId = req.user.id;
    
    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Participant IDs are required'
      });
    }
    
    const allParticipants = [...new Set([currentUserId, ...participantIds])];
    
    if (!isGroup && allParticipants.length === 2) {
      const existing = await Conversation.findOne({
        isGroup: false,
        participants: { $all: allParticipants, $size: 2 }
      }).populate('participants', 'username email profilePicture');
      
      if (existing) {
        return res.json({
          success: true,
          conversation: existing,
          encryptionKey: existing.encryptionKey,
          message: 'Conversation already exists'
        });
      }
    }
    
    const encryptionKey = generateEncryptionKey();
    console.log('✅ Generated key for new conversation');
    
    const conversation = new Conversation({
      participants: allParticipants,
      isGroup: isGroup || false,
      groupName: groupName || null,
      encryptionKey: encryptionKey,
      createdBy: currentUserId
    });
    
    await conversation.save();
    await conversation.populate('participants', 'username email profilePicture');
    
    console.log('✅ Conversation created:', conversation._id);
    
    res.json({
      success: true,
      conversation: conversation,
      encryptionKey: encryptionKey
    });
    
  } catch (error) {
    console.error('❌ Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
};

/**
 * GET CONVERSATIONS
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'username email profilePicture status')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
    
    console.log(`✅ Retrieved ${conversations.length} conversations for user ${userId}`);
    
    res.json({
      success: true,
      conversations: conversations
    });
    
  } catch (error) {
    console.error('❌ Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
};

/**
 * GET ENCRYPTION KEY
 */
const getEncryptionKey = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );
    
    if (!isParticipant) {
      console.warn(`⚠️ Unauthorized key access attempt by ${userId}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    console.log(`🔑 Providing key for conversation ${conversationId}`);
    
    res.json({
      success: true,
      encryptionKey: conversation.encryptionKey
    });
    
  } catch (error) {
    console.error('❌ Get encryption key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch encryption key'
    });
  }
};

/**
 * GET MESSAGES
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { limit = 50, before } = req.query;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const query = { conversationId: conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    const messages = await Message.find(query)
      .populate('senderId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    console.log(`✅ Retrieved ${messages.length} messages for conversation ${conversationId}`);
    
    res.json({
      success: true,
      messages: messages.reverse()
    });
    
  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

/**
 * SEND MESSAGE - UPDATED FOR E2E ENCRYPTION
 * 
 * Now accepts: ciphertext, nonce, algorithm, version
 */
const sendMessage = async (req, res) => {
  try {
    const { 
      conversationId, 
      ciphertext,
      nonce,
      algorithm,
      version,
      messageType = 'text' 
    } = req.body;
    
    const senderId = req.user.id;
    
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required'
      });
    }
    
    if (!ciphertext || !nonce) {
      return res.status(400).json({
        success: false,
        message: 'Encrypted content (ciphertext and nonce) are required'
      });
    }
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    const isParticipant = conversation.participants.some(
      p => p.toString() === senderId.toString()
    );
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const message = new Message({
      conversationId: conversationId,
      senderId: senderId,
      ciphertext: ciphertext,
      nonce: nonce,
      encryptionMetadata: {
        algorithm: algorithm || 'XSalsa20-Poly1305',
        keyExchange: 'ECDH-X25519',
        version: version || '2.0'
      },
      messageType: messageType
    });
    
    await message.save();
    await message.populate('senderId', 'username profilePicture');
    
    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();
    await conversation.save();
    
    console.log('✅ Encrypted message sent:', message._id);
    
    res.json({
      success: true,
      data: message,
      message: message
    });
    
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

/**
 * MARK AS READ
 */
const markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;
    
    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: 'Message IDs array is required'
      });
    }
    
    await Message.updateMany(
      {
        _id: { $in: messageIds },
        senderId: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId }
      }
    );
    
    console.log(`✅ Marked ${messageIds.length} messages as read`);
    
    res.json({
      success: true,
      message: 'Messages marked as read'
    });
    
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
};

/**
 * DELETE MESSAGE
 */
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await message.deleteOne();
    
    console.log('✅ Message deleted:', messageId);
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

module.exports = {
  createConversation,
  getConversations,
  getEncryptionKey,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage
};