const User = require('../models/User');
const PublicKey = require('../models/PublicKey');
const encryptionService = require('../services/encryptionService');
const logger = require('../utils/logger');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const publicKeyDoc = await PublicKey.findOne({ userId: user._id });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        status: user.status,
        profilePicture: user.profilePicture,
        publicKey: publicKeyDoc?.publicKey,
      },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, profilePicture } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { username, profilePicture },
      { new: true }
    );

    res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });

    logger.info(`Profile updated for user: ${user.email}`);
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const users = await User.find({
      $or: [
        { username: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') },
      ],
      _id: { $ne: req.user.userId },
    }).limit(10);

    const usersWithKeys = await Promise.all(
      users.map(async (user) => {
        const publicKeyDoc = await PublicKey.findOne({ userId: user._id });
        return {
          id: user._id,
          username: user.username,
          email: user.email,
          status: user.status,
          profilePicture: user.profilePicture,
          publicKey: publicKeyDoc?.publicKey,
        };
      })
    );

    res.json({ users: usersWithKeys });
  } catch (error) {
    logger.error('Search users error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['online', 'offline', 'away'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await User.findByIdAndUpdate(req.user.userId, { status }, { new: true });

    res.json({ message: 'Status updated', status });
  } catch (error) {
    logger.error('Update status error:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
};

exports.uploadPublicKey = async (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({ message: 'Public key required' });
    }

    const keyFingerprint = encryptionService.getKeyFingerprint(publicKey);

    let pubKeyDoc = await PublicKey.findOne({ userId: req.user.userId });

    if (pubKeyDoc) {
      pubKeyDoc.publicKey = publicKey;
      pubKeyDoc.keyFingerprint = keyFingerprint;
    } else {
      pubKeyDoc = new PublicKey({
        userId: req.user.userId,
        publicKey,
        keyFingerprint,
      });
    }

    await pubKeyDoc.save();

    res.json({
      message: 'Public key uploaded',
      keyFingerprint,
    });

    logger.info(`Public key uploaded for user: ${req.user.userId}`);
  } catch (error) {
    logger.error('Upload public key error:', error);
    res.status(500).json({ message: 'Error uploading public key' });
  }
};