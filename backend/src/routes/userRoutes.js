const express = require('express');
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/search', userController.searchUsers);
router.put('/status', userController.updateStatus);
router.post('/upload-public-key', userController.uploadPublicKey);

module.exports = router;