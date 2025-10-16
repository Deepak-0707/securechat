const nodemailer = require('nodemailer');
const config = require('../config/environment');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: config.emailService,
      auth: {
        user: config.emailUser,
        pass: config.emailPass,
      },
    });
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"E2E Chat" <${config.emailUser}>`,
      to: email,
      subject: '🔐 Password Reset Request - E2E Chat',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 10px 10px; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .warning { color: #d32f2f; font-weight: bold; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You requested a password reset for your E2E Chat account. Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy this link: <br><small>${resetUrl}</small></p>
              <p><span class="warning">⚠️ This link will expire in 1 hour.</span></p>
              <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
              <p>For security reasons, never share this link with anyone.</p>
              <p>Best regards,<br>E2E Chat Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 E2E Chat. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Email send error:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(email, verificationToken) {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"E2E Chat" <${config.emailUser}>`,
      to: email,
      subject: '✅ Email Verification - E2E Chat',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 10px 10px; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Welcome to E2E Chat!</p>
              <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
              <p>Or copy this link: <br><small>${verificationUrl}</small></p>
              <p>This link will expire in 24 hours.</p>
              <p>If you did not create this account, please ignore this email.</p>
              <p>Best regards,<br>E2E Chat Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 E2E Chat. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Email send error:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(email, username) {
    const mailOptions = {
      from: `"E2E Chat" <${config.emailUser}>`,
      to: email,
      subject: '🎉 Welcome to E2E Chat',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 10px 10px; }
            .feature { margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #667eea; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to E2E Chat!</h1>
            </div>
            <div class="content">
              <p>Hi ${username},</p>
              <p>Welcome to E2E Chat - the most secure messaging platform. Your account is now ready to use!</p>
              
              <h3>✨ Features You Can Enjoy:</h3>
              <div class="feature">🔐 End-to-End Encryption - Your messages are encrypted on both ends</div>
              <div class="feature">📞 Secure Video & Audio Calls - Crystal clear encrypted calls</div>
              <div class="feature">👥 Group Chats - Communicate securely with multiple people</div>
              <div class="feature">📁 File Sharing - Share files with encryption</div>
              
              <p><strong>Getting Started:</strong></p>
              <p>1. Complete your profile<br>2. Find and add friends<br>3. Start secure conversations</p>
              
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Best regards,<br>E2E Chat Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 E2E Chat. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Email send error:', error);
      throw new Error('Failed to send email');
    }
  }
}

module.exports = new EmailService();