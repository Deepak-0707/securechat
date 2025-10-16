const express = require('express');
const webrtcController = require('../controllers/webrtcController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

router.post('/call/initiate', webrtcController.initiateCall);
router.post('/call/answer', webrtcController.answerCall);
router.post('/ice-candidate', webrtcController.addICECandidate);
router.post('/call/end', webrtcController.endCall);

module.exports = router;    