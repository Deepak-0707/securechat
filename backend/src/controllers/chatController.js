const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const logger = require('../utils/logger');
const crypto = require('crypto');

exports.createConversation = async (req, res) => {
  try {
    const { participantIds, isGroup, groupName } = req.body;

    const allParticipants = [req.user.userId, ...participantIds];

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: allParticipants },
      isGroup: false,
    });

    if (conversation) {
      return res.json({ conversation });
    }

    // Create new conversation with auto-generated encryption key
    conversation = new Conversation({
      participants: allParticipants,
      isGroup: isGroup || false,
      groupName: isGroup ? groupName : null,
      encryptionKey: crypto.randomBytes(32).toString('hex'), // Generate key explicitly
    });

    await conversation.save();

    console.log(`✅ Conversation created with encryption key: ${conversation._id}`);

    res.status(201).json({
      message: 'Conversation created',
      conversation,
    });

    logger.info(`Conversation created: ${conversation._id}`);
  } catch (error) {
    logger.error('Create conversation error:', error);
    res.status(500).json({ 
      message: 'Error creating conversation',
      error: error.message 
    });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.userId,
    })
      .populate('lastMessage')
      .populate('participants', '-password')
      .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
};

// Get encryption key for a conversation
exports.getEncryptionKey = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Verify user is participant in this conversation
    if (!conversation.participants.includes(req.user.userId)) {
      return res.status(403).json({ message: 'Unauthorized access to conversation' });
    }

    if (!conversation.encryptionKey) {
      console.warn(`⚠️ Conversation ${conversationId} has no encryption key!`);
      return res.status(500).json({ message: 'Encryption key not found for conversation' });
    }

    res.json({
      encryptionKey: conversation.encryptionKey,
      conversationId: conversation._id,
    });

    logger.info(`Encryption key retrieved for conversation: ${conversationId}`);
  } catch (error) {
    logger.error('Get encryption key error:', error);
    res.status(500).json({ 
      message: 'Error retrieving encryption key',
      error: error.message 
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .populate('senderId', '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMessages = await Message.countDocuments({ conversationId });

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalMessages,
        pages: Math.ceil(totalMessages / limit),
      },
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, encryptedContent, encryptionMetadata, messageType } = req.body;

    const message = new Message({
      conversationId,
      senderId: req.user.userId,
      encryptedContent,
      encryptionMetadata,
      messageType: messageType || 'text',
    });

    await message.save();
    await message.populate('senderId', '-password');

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    res.status(201).json({
      message: 'Message sent',
      data: message,
    });

    logger.info(`Message sent in conversation: ${conversationId}`);
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;

    await Message.updateMany(
      { _id: { $in: messageIds } },
      { isRead: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.senderId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ message: 'Message deleted' });
    logger.info(`Message deleted: ${messageId}`);
  } catch (error) {
    logger.error('Delete message error:', error);
    res.status(500).json({ message: 'Error deleting message' });
  }
};