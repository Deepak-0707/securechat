const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    encryptedContent: {
      type: String,
      required: true,
    },
    encryptionMetadata: {
      iv: String,
      salt: String,
      tag: String,
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'media'],
      default: 'text',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);