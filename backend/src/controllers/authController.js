const User = require('../models/User');
const PublicKey = require('../models/PublicKey');
const jwtService = require('../services/jwtService');
const emailService = require('../services/emailService');
const encryptionService = require('../services/encryptionService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

exports.register = async (req, res) => {
  try {
    const { username, email, password, publicKey } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Store public key
    if (publicKey) {
      const keyFingerprint = encryptionService.getKeyFingerprint(publicKey);
      const pubKeyDoc = new PublicKey({
        userId: user._id,
        publicKey,
        keyFingerprint,
      });
      await pubKeyDoc.save();
    }

    const accessToken = jwtService.generateAccessToken(user._id);
    const refreshToken = jwtService.generateRefreshToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });

    logger.info(`User registered: ${user.email}`);
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwtService.generateAccessToken(user._id);
    const refreshToken = jwtService.generateRefreshToken(user._id);

    // Update user status
    user.status = 'online';
    await user.save();

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        status: user.status,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });

    logger.info(`User logged in: ${user.email}`);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found' });
    }

    const resetToken = jwtService.generatePasswordResetToken(user._id);
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    await emailService.sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'Password reset email sent' });
    logger.info(`Password reset email sent to: ${email}`);
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error sending reset email', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwtService.verifyToken(token);

    if (!decoded || decoded.type !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.userId);

    if (
      !user ||
      user.resetPasswordToken !== token ||
      user.resetPasswordExpires < new Date()
    ) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
    logger.info(`Password reset for user: ${user.email}`);
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwtService.verifyToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = jwtService.generateAccessToken(decoded.userId);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({ message: 'Token refresh failed' });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user) {
      user.status = 'offline';
      await user.save();
    }

    res.json({ message: 'Logged out successfully' });
    logger.info(`User logged out: ${user.email}`);
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};