const express = require('express');
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

router.post('/conversations', chatController.createConversation);
router.get('/conversations', chatController.getConversations);

// NEW: Get encryption key for a conversation
router.get('/conversations/:conversationId/encryption-key', chatController.getEncryptionKey);

router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/messages', chatController.sendMessage);
router.post('/messages/mark-read', chatController.markAsRead);
router.delete('/messages/:messageId', chatController.deleteMessage);

module.exports = router;