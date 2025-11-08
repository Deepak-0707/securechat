/**
 * USER MODEL - WITH PUBLIC KEY CRYPTOGRAPHY
 * 
 * COPY THIS ENTIRE FILE TO: backend/src/models/User.js
 * 
 * Purpose: Store user account information and public keys
 * Database: MongoDB
 * Collection: users
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // ===== BASIC ACCOUNT INFO =====
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // ===== ELLIPTIC CURVE PUBLIC KEY (NEW!) =====
  publicKey: {
    type: String,
    required: [true, 'Public key is required for E2E encryption'],
    unique: true,
    index: true
  },
  
  keyVersion: {
    type: Number,
    default: 1,
    min: 1
  },
  
  keyCreatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  previousKeys: [{
    publicKey: {
      type: String,
      required: true
    },
    version: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      required: true
    },
    expiredAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ===== USER STATUS =====
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  
  lastSeen: {
    type: Date,
    default: Date.now
  },
  
  // ===== PROFILE INFO =====
  profilePicture: {
    type: String,
    default: null
  },
  
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  
  // ===== PASSWORD RESET =====
  resetPasswordToken: {
    type: String,
    select: false
  },
  
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  
  // ===== ACCOUNT METADATA =====
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationToken: {
    type: String,
    select: false
  },
  
  accountCreatedAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
  
}, {
  timestamps: true,
  collection: 'users'
});

// ===== INDEXES =====
userSchema.index({ email: 1, publicKey: 1 });
userSchema.index({ keyCreatedAt: 1 });

// ===== PRE-SAVE MIDDLEWARE =====
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed for user:', this.username);
    next();
  } catch (error) {
    console.error('❌ Password hashing failed:', error);
    next(error);
  }
});

// ===== INSTANCE METHODS =====
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (error) {
    console.error('❌ Password comparison failed:', error);
    return false;
  }
};

userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    publicKey: this.publicKey,
    keyVersion: this.keyVersion,
    status: this.status,
    profilePicture: this.profilePicture,
    bio: this.bio,
    lastSeen: this.lastSeen
  };
};

userSchema.methods.rotatePublicKey = async function(newPublicKey) {
  try {
    this.previousKeys.push({
      publicKey: this.publicKey,
      version: this.keyVersion,
      createdAt: this.keyCreatedAt,
      expiredAt: Date.now()
    });
    
    this.publicKey = newPublicKey;
    this.keyVersion += 1;
    this.keyCreatedAt = Date.now();
    
    await this.save();
    
    console.log('🔄 Public key rotated for user:', this.username);
    
  } catch (error) {
    console.error('❌ Key rotation failed:', error);
    throw new Error('Failed to rotate public key');
  }
};

userSchema.methods.shouldRotateKey = function() {
  const KEY_ROTATION_DAYS = 180;
  const keyAge = Date.now() - this.keyCreatedAt;
  const maxAge = KEY_ROTATION_DAYS * 24 * 60 * 60 * 1000;
  
  return keyAge > maxAge;
};

userSchema.methods.getKeyByVersion = function(version) {
  if (version === this.keyVersion) {
    return this.publicKey;
  }
  
  const oldKey = this.previousKeys.find(k => k.version === version);
  return oldKey ? oldKey.publicKey : null;
};

// ===== STATIC METHODS =====
userSchema.statics.findByPublicKey = function(publicKey) {
  return this.findOne({ publicKey });
};

userSchema.statics.getUsersWithPublicKeys = function(userIds) {
  return this.find({ _id: { $in: userIds } })
    .select('_id username publicKey keyVersion status profilePicture')
    .lean();
};

const User = mongoose.model('User', userSchema);

module.exports = User;