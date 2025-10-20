// services/callHandler.js
import { webrtcManager } from '../../services/webrtc.js';
import { getSocket, socketEmit } from '../../services/socket.js';

export class CallHandler {
  constructor() {
    this.currentCall = null;
    this.localStream = null;
    this.remoteStream = null;
    this.isCallActive = false;
  }

  // Initiate a call
  async initiateCall(recipientId, conversationId, isVideo = true) {
    try {
      console.log('📞 Initiating call to:', recipientId);
      
      // Initialize WebRTC
      await webrtcManager.initialize();

      // Get local stream (audio + optional video)
      this.localStream = await webrtcManager.getLocalStream(true, isVideo);
      console.log('✅ Local stream obtained');

      // Create offer
      const offer = await webrtcManager.createOffer();
      console.log('✅ Offer created');

      // Emit call initiation via socket
      const callId = 'call_' + Date.now();
      socketEmit('call:initiate', {
        callId,
        recipientId,
        conversationId,
        offer,
        isVideo,
        callerName: 'User' // You can pass actual name from context
      });

      this.currentCall = {
        callId,
        recipientId,
        conversationId,
        isVideo,
        status: 'initiating'
      };

      console.log('✅ Call initiation emitted');
      return callId;
    } catch (error) {
      console.error('❌ Failed to initiate call:', error);
      throw error;
    }
  }

  // Answer incoming call
  async answerCall(callData) {
    try {
      console.log('📞 Answering call from:', callData.callerId);

      // Initialize WebRTC if not already done
      await webrtcManager.initialize();

      // Handle the offer
      await webrtcManager.handleOffer(callData.offer);

      // Get local stream
      this.localStream = await webrtcManager.getLocalStream(true, callData.isVideo);
      console.log('✅ Local stream obtained');

      // Create answer
      const answer = await webrtcManager.createAnswer();
      console.log('✅ Answer created');

      // Emit answer via socket
      socketEmit('call:answer', {
        callId: callData.callId,
        callerId: callData.callerId,
        conversationId: callData.conversationId,
        answer,
        isVideo: callData.isVideo
      });

      this.currentCall = {
        callId: callData.callId,
        callerId: callData.callerId,
        conversationId: callData.conversationId,
        isVideo: callData.isVideo,
        status: 'active'
      };

      this.isCallActive = true;
      console.log('✅ Call answered');
    } catch (error) {
      console.error('❌ Failed to answer call:', error);
      throw error;
    }
  }

  // Reject call
  rejectCall(callId, recipientId) {
    try {
      console.log('❌ Rejecting call:', callId);
      socketEmit('call:reject', {
        callId,
        recipientId
      });
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  }

  // End current call
  endCall() {
    try {
      console.log('📞 Ending call');

      // Stop local stream
      webrtcManager.stopLocalStream();

      // Close WebRTC connection
      webrtcManager.close();

      // Emit end call event
      if (this.currentCall) {
        socketEmit('call:end', {
          callId: this.currentCall.callId,
          recipientId: this.currentCall.recipientId
        });
      }

      this.currentCall = null;
      this.isCallActive = false;
      this.localStream = null;
      this.remoteStream = null;

      console.log('✅ Call ended');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }

  // Handle ICE candidate
  async handleICECandidate(candidate) {
    try {
      await webrtcManager.addICECandidate(candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  // Get local stream (for UI)
  getLocalStream() {
    return this.localStream;
  }

  // Get remote stream (for UI)
  getRemoteStream() {
    return this.remoteStream;
  }

  // Set remote stream callback
  onRemoteStream(callback) {
    webrtcManager.onRemoteStream = (stream) => {
      this.remoteStream = stream;
      callback(stream);
    };
  }
}

export const callHandler = new CallHandler();