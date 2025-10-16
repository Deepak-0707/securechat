const http = require('http');
const socketIO = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const config = require('./src/config/environment');
const logger = require('./src/utils/logger');

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: config.frontendUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Store active users
const activeUsers = new Map();

// Socket.io middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  socket.userId = token; // In production, verify JWT here
  next();
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  activeUsers.set(userId, socket.id);

  logger.info(`User connected: ${userId} (Socket: ${socket.id})`);

  // User comes online
  socket.on('user:online', (data) => {
    socket.join(`user:${userId}`);
    io.emit('user:status-changed', { userId, status: 'online', timestamp: new Date() });
    logger.info(`User ${userId} is now online`);
  });

  // User goes offline
  socket.on('user:offline', (data) => {
    io.emit('user:status-changed', { userId, status: 'offline', timestamp: new Date() });
    logger.info(`User ${userId} is now offline`);
  });

  // Join conversation room
  socket.on('conversation:join', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    io.to(`conversation:${conversationId}`).emit('user:joined', { userId, conversationId });
    logger.info(`User ${userId} joined conversation: ${conversationId}`);
  });

  // Leave conversation room
  socket.on('conversation:leave', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    io.to(`conversation:${conversationId}`).emit('user:left', { userId, conversationId });
    logger.info(`User ${userId} left conversation: ${conversationId}`);
  });

  // Send message
  socket.on('message:send', (data) => {
    const { conversationId, message } = data;
    io.to(`conversation:${conversationId}`).emit('message:receive', {
      ...message,
      timestamp: new Date(),
    });
    logger.info(`Message sent in conversation: ${conversationId}`);
  });

  // Typing indicators
  socket.on('typing:start', (data) => {
    const { conversationId, userId: typingUserId } = data;
    io.to(`conversation:${conversationId}`).emit('typing:active', { userId: typingUserId });
  });

  socket.on('typing:stop', (data) => {
    const { conversationId, userId: typingUserId } = data;
    io.to(`conversation:${conversationId}`).emit('typing:inactive', { userId: typingUserId });
  });

  // WebRTC Call events
  socket.on('call:initiate', (data) => {
    const { to, from, offer, callId } = data;
    const recipientSocketId = activeUsers.get(to);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('call:incoming', {
        from,
        offer,
        callId,
        timestamp: new Date(),
      });
      logger.info(`Call initiated from ${from} to ${to}`);
    } else {
      socket.emit('call:rejected', { reason: 'User offline', callId });
      logger.info(`Call failed: User ${to} is offline`);
    }
  });

  socket.on('call:answer', (data) => {
    const { to, from, answer, callId } = data;
    const callerSocketId = activeUsers.get(to);
    
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:answered', {
        from,
        answer,
        callId,
        timestamp: new Date(),
      });
      logger.info(`Call answered by ${from}`);
    }
  });

  socket.on('call:reject', (data) => {
    const { to, reason, callId } = data;
    const callerSocketId = activeUsers.get(to);
    
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:rejected', {
        reason: reason || 'Call declined',
        callId,
      });
      logger.info(`Call rejected by ${userId}`);
    }
  });

  socket.on('ice:candidate', (data) => {
    const { to, candidate, callId } = data;
    const recipientSocketId = activeUsers.get(to);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('ice:candidate', { candidate, callId });
    }
  });

  socket.on('call:end', (data) => {
    const { to, callId } = data;
    const recipientSocketId = activeUsers.get(to);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('call:ended', { callId });
    }
    logger.info(`Call ended by ${userId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    activeUsers.delete(userId);
    io.emit('user:disconnected', { userId });
    logger.info(`User disconnected: ${userId}`);
  });

  // Error handling
  socket.on('error', (error) => {
    logger.error(`Socket error for user ${userId}:`, error);
  });
});

// Connect to database
connectDB();

// Start server
server.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
  logger.info(`WebSocket server ready for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});