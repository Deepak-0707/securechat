const User = require('../models/User');
const PublicKey = require('../models/PublicKey');
const logger = require('../utils/logger');

exports.initiateCall = async (req, res) => {
  try {
    const { recipientId, offer } = req.body;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const caller = await User.findById(req.user.userId);
    const recipientPublicKey = await PublicKey.findOne({ userId: recipientId });

    res.json({
      message: 'Call initiated',
      callData: {
        callerId: caller._id,
        callerName: caller.username,
        offer,
        recipientPublicKey: recipientPublicKey?.publicKey,
      },
    });

    logger.info(`Call initiated from ${caller.username} to ${recipient.username}`);
  } catch (error) {
    logger.error('Call initiation error:', error);
    res.status(500).json({ message: 'Error initiating call' });
  }
};

exports.answerCall = async (req, res) => {
  try {
    const { callerId, answer } = req.body;

    const caller = await User.findById(callerId);
    if (!caller) {
      return res.status(404).json({ message: 'Caller not found' });
    }

    const answerer = await User.findById(req.user.userId);

    res.json({
      message: 'Call answered',
      callData: {
        answererId: answerer._id,
        answererName: answerer.username,
        answer,
      },
    });

    logger.info(`Call answered by ${answerer.username}`);
  } catch (error) {
    logger.error('Call answer error:', error);
    res.status(500).json({ message: 'Error answering call' });
  }
};

exports.addICECandidate = async (req, res) => {
  try {
    const { candidate, recipientId } = req.body;

    res.json({ message: 'ICE candidate processed' });
  } catch (error) {
    logger.error('ICE candidate error:', error);
    res.status(500).json({ message: 'Error processing ICE candidate' });
  }
};

exports.endCall = async (req, res) => {
  try {
    res.json({ message: 'Call ended' });
    logger.info(`Call ended by user: ${req.user.userId}`);
  } catch (error) {
    logger.error('End call error:', error);
    res.status(500).json({ message: 'Error ending call' });
  }
};