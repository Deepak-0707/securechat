const express = require('express');
const chatController = require('../controllers/chatController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

router.post('/conversations', chatController.createConversation);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/messages', chatController.sendMessage);
router.post('/messages/mark-read', chatController.markAsRead);
router.delete('/messages/:messageId', chatController.deleteMessage);

module.exports = router;