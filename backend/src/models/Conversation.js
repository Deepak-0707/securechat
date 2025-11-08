/**
 * CONVERSATION MODEL - UPDATED FOR E2E ENCRYPTION
 * 
 * COPY THIS ENTIRE FILE TO: backend/src/models/Conversation.js
 * 
 * IMPORTANT CHANGES:
 * - REMOVED encryptionKey field (server no longer stores keys!)
 * - Keys are derived from ECDH on client side
 */

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  isGroup: {
    type: Boolean,
    default: false
  },
  
  groupName: {
    type: String,
    default: null
  },
  
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  
  // NOTE: encryptionKey REMOVED!
  // Keys are now derived from ECDH on client side
  // Server never has access to encryption keys
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'conversations'
});

// ===== INDEXES =====
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

// ===== INSTANCE METHODS =====
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => 
    p.toString() === userId.toString()
  );
};

conversationSchema.methods.getOtherParticipant = function(userId) {
  if (this.isGroup) return null;
  
  return this.participants.find(p => 
    p.toString() !== userId.toString()
  );
};

// ===== STATIC METHODS =====
conversationSchema.statics.findByParticipants = function(participantIds) {
  return this.findOne({
    isGroup: false,
    participants: { 
      $all: participantIds,
      $size: participantIds.length
    }
  });
};

conversationSchema.statics.findUserConversations = function(userId) {
  return this.find({
    participants: userId
  })
  .populate('participants', 'username publicKey status profilePicture')
  .populate('lastMessage')
  .sort({ updatedAt: -1 });
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;