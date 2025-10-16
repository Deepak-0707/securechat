const jwt = require('jsonwebtoken');
const config = require('../config/environment');

class JWTService {
  generateAccessToken(userId) {
    return jwt.sign({ userId }, config.jwtSecret, {
      expiresIn: config.jwtExpiry,
    });
  }

  generateRefreshToken(userId) {
    return jwt.sign({ userId }, config.jwtSecret, {
      expiresIn: config.refreshTokenExpiry,
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  generatePasswordResetToken(userId) {
    return jwt.sign({ userId, type: 'password-reset' }, config.jwtSecret, {
      expiresIn: '1h',
    });
  }
}

module.exports = new JWTService();