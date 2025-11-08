/**
 * MESSAGE MODEL - UPDATED FOR E2E ENCRYPTION
 * 
 * COPY THIS ENTIRE FILE TO: backend/src/models/Message.js
 * 
 * CHANGES:
 * - Added ciphertext field (replaces encryptedContent)
 * - Added nonce field (for XSalsa20-Poly1305)
 * - Updated encryptionMetadata
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // ===== ENCRYPTED MESSAGE DATA =====
  ciphertext: {
    type: String,
    required: true
  },
  
  nonce: {
    type: String,
    required: true
  },
  
  // ===== ENCRYPTION METADATA =====
  encryptionMetadata: {
    algorithm: {
      type: String,
      default: 'XSalsa20-Poly1305'
    },
    keyExchange: {
      type: String,
      default: 'ECDH-X25519'
    },
    version: {
      type: String,
      default: '2.0'
    }
  },
  
  // ===== MESSAGE METADATA =====
  messageType: {
    type: String,
    enum: ['text', 'file', 'image', 'video'],
    default: 'text'
  },
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: {
    type: Date,
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'messages'
});

// ===== INDEXES =====
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });

// ===== INSTANCE METHODS =====
messageSchema.methods.markAsRead = function(userId) {
  if (!this.readBy.some(r => r.userId.toString() === userId.toString())) {
    this.readBy.push({
      userId: userId,
      readAt: Date.now()
    });
    this.isRead = true;
  }
  return this.save();
};

messageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  return this.save();
};

// ===== STATIC METHODS =====
messageSchema.statics.getConversationMessages = function(conversationId, limit = 50, skip = 0) {
  return this.find({
    conversationId: conversationId,
    isDeleted: false
  })
  .populate('senderId', 'username profilePicture')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

messageSchema.statics.markConversationAsRead = async function(conversationId, userId) {
  return this.updateMany(
    {
      conversationId: conversationId,
      senderId: { $ne: userId },
      isRead: false
    },
    {
      $set: { isRead: true },
      $push: {
        readBy: {
          userId: userId,
          readAt: Date.now()
        }
      }
    }
  );
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;