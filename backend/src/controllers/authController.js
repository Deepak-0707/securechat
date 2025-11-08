/**
 * AUTH CONTROLLER - UPDATED FOR E2E ENCRYPTION
 * 
 * COPY THIS ENTIRE FILE TO: backend/src/controllers/authController.js
 * 
 * CHANGES:
 * - Added publicKey validation and storage in register
 * - Updated to accept publicKey from client
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { verifyPublicKey } = require('../services/eccService');

/**
 * GENERATE JWT TOKEN
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    { expiresIn: '7d' }
  );
};

/**
 * REGISTER - WITH PUBLIC KEY
 */
const register = async (req, res) => {
  try {
    const { username, email, password, publicKey } = req.body;

    console.log('📝 Registration request:', { username, email });

    // Validate required fields
    if (!username || !email || !password || !publicKey) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required (username, email, password, publicKey)'
      });
    }

    // Validate public key format
    if (!verifyPublicKey(publicKey)) {
      console.error('❌ Invalid public key format');
      return res.status(400).json({
        success: false,
        message: 'Invalid public key format'
      });
    }

    console.log('✅ Public key validated');

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create new user with public key
    const user = new User({
      username,
      email,
      password,
      publicKey,          // Store public key
      keyVersion: 1,
      keyCreatedAt: Date.now()
    });

    await user.save();

    console.log('✅ User created with public key');

    // Generate JWT tokens
    const accessToken = generateToken(user._id);
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-this',
      { expiresIn: '30d' }
    );

    // Return success
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        publicKey: user.publicKey,
        keyVersion: user.keyVersion
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * LOGIN
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user has public key (migration scenario)
    if (!user.publicKey) {
      console.warn('⚠️ User missing public key:', user.username);
      return res.status(400).json({
        success: false,
        message: 'Please re-register to generate encryption keys',
        needsKeyGeneration: true
      });
    }

    console.log('✅ Login successful:', user.username);

    // Update user status
    user.status = 'online';
    user.lastSeen = Date.now();
    await user.save();

    // Generate JWT tokens
    const accessToken = generateToken(user._id);
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-this',
      { expiresIn: '30d' }
    );

    // Return success
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        publicKey: user.publicKey,
        keyVersion: user.keyVersion,
        status: user.status
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * LOGOUT
 */
const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update user status to offline
    await User.findByIdAndUpdate(userId, {
      status: 'offline',
      lastSeen: Date.now()
    });

    console.log('👋 User logged out:', userId);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

/**
 * REFRESH TOKEN
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-this'
    );

    // Generate new access token
    const accessToken = generateToken(decoded.id);

    res.json({
      success: true,
      accessToken
    });

  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

/**
 * FORGOT PASSWORD
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '1h' }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // TODO: Send email with reset link
    console.log('📧 Password reset token:', resetToken);

    res.json({
      success: true,
      message: 'Password reset email sent',
      resetToken // Remove this in production!
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request'
    });
  }
};

/**
 * RESET PASSWORD
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-this'
    );

    const user = await User.findById(decoded.id).select('+resetPasswordToken +resetPasswordExpires');

    if (!user || user.resetPasswordToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('✅ Password reset successful:', user.username);

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword
};