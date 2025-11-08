const express = require('express');
const authController = require('../controllers/authController');
const { validateRegister, validateLogin, validateResetPassword, handleValidationErrors } = require('../middleware/validation');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.post('/register', validateRegister, handleValidationErrors, authController.register);
router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', validateResetPassword, handleValidationErrors, authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

module.exports = router;