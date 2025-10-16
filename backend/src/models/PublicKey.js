const mongoose = require('mongoose');

const publicKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    keyFingerprint: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

module.exports = mongoose.model('PublicKey', publicKeySchema);