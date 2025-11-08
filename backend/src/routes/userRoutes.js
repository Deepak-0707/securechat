/**
 * USER ROUTES
 * 
 * Location: backend/src/routes/userRoutes.js
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const userController = require('../controllers/userController');

// Debug: Check what's imported
console.log('🔍 User Controller exports:', Object.keys(userController));

// ===== PROTECTED ROUTES (Require Authentication) =====

// Get current user profile
router.get('/profile', authenticate, userController.getProfile);

// Update current user profile
router.put('/profile', authenticate, userController.updateProfile);

// Search users
router.get('/search', authenticate, userController.searchUsers);

// Update user status
router.put('/status', authenticate, userController.updateStatus);

// ===== PUBLIC KEY ENDPOINTS =====

// Get user's public key (for ECDH key exchange)
router.get('/:userId/public-key', authenticate, userController.getPublicKey);

// Upload/update own public key (for key rotation)
router.post('/upload-public-key', authenticate, userController.uploadPublicKey);

module.exports = router;