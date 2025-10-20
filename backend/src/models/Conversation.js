const mongoose = require('mongoose');
const crypto = require('crypto');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: String,
    groupImage: String,
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    // ADD THIS: Encryption key for the conversation
    encryptionKey: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ADD THIS: Auto-generate encryption key before saving
conversationSchema.pre('save', function (next) {
  if (!this.encryptionKey) {
    this.encryptionKey = crypto.randomBytes(32).toString('hex');
    console.log('Generated encryption key for conversation');
  }
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);