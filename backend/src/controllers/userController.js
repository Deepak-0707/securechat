/**
 * USER CONTROLLER - Complete with Public Key Endpoints
 * 
 * Location: backend/src/controllers/userController.js
 */

const User = require('../models/User');

/**
 * GET USER PROFILE
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

/**
 * UPDATE USER PROFILE
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, profilePicture, bio } = req.body;

    const updateData = {};
    if (username) updateData.username = username;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (bio !== undefined) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Profile updated:', user.username);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * SEARCH USERS
 */
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.id;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('username email publicKey status profilePicture')
    .limit(20);

    res.json({
      success: true,
      users: users
    });

  } catch (error) {
    console.error('❌ Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
};

/**
 * UPDATE USER STATUS
 */
const updateStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.body;

    if (!['online', 'offline', 'away'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status, lastSeen: Date.now() },
      { new: true }
    ).select('username status lastSeen');

    res.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('❌ Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};

/**
 * GET PUBLIC KEY
 * 
 * Allows users to fetch each other's public keys for ECDH key exchange
 */
const getPublicKey = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('🔑 Public key request for user:', userId);

    const user = await User.findById(userId)
      .select('_id username publicKey keyVersion');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.publicKey) {
      return res.status(400).json({
        success: false,
        message: 'User has not generated encryption keys'
      });
    }

    console.log('✅ Public key retrieved:', user.username);

    res.json({
      success: true,
      userId: user._id,
      username: user.username,
      publicKey: user.publicKey,
      keyVersion: user.keyVersion
    });

  } catch (error) {
    console.error('❌ Get public key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public key'
    });
  }
};

/**
 * UPLOAD PUBLIC KEY
 * 
 * Allows user to update their public key (for key rotation)
 */
const uploadPublicKey = async (req, res) => {
  try {
    const userId = req.user.id;
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({
        success: false,
        message: 'Public key is required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update public key and increment version
    user.publicKey = publicKey;
    user.keyVersion = (user.keyVersion || 0) + 1;
    await user.save();

    console.log('🔄 Public key updated for:', user.username);

    res.json({
      success: true,
      message: 'Public key updated successfully',
      keyVersion: user.keyVersion
    });

  } catch (error) {
    console.error('❌ Upload public key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload public key'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  searchUsers,
  updateStatus,
  getPublicKey,
  uploadPublicKey
};