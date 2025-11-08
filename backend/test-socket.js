const io = require('socket.io-client');

// Connect as Alice
const socketAlice = io('http://localhost:5000', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGYwOWZkMjgzYTUyNTU2NmU2OGJjZmUiLCJpYXQiOjE3NjA2MTg5ODksImV4cCI6MTc2MDcwNTM4OX0.FVxRiv0KsCJrXmloZSNG0El2JwsFJOQ4dulMq7ZHcfQ'
  }
});

// Connect as Bob
const socketBob = io('http://localhost:5000', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGYwOWZlMjgzYTUyNTU2NmU2OGJkMDEiLCJpYXQiOjE3NjA2MTkyODcsImV4cCI6MTc2MDcwNTY4N30.KS8TM-GEOEKllmeCoLU8J4Qml0IhKnX-v-Er3KajAk4BOB_TOKEN_HERE'
  }
});

console.log('🚀 Connecting to Socket.io...\n');

// Alice connects
socketAlice.on('connect', () => {
  console.log('✅ Alice connected');
  socketAlice.emit('user:online', { userId: '68f09fd283a525566e68bcfe' });
});

// Bob connects
socketBob.on('connect', () => {
  console.log('✅ Bob connected');
  socketBob.emit('user:online', { userId: '68f09fe283a525566e68bd01' });
});

// Listen for status changes
socketAlice.on('user:status-changed', (data) => {
  console.log('📍 Alice heard: User status changed -', data);
});

socketBob.on('user:status-changed', (data) => {
  console.log('📍 Bob heard: User status changed -', data);
});

// Test 1: User comes online
setTimeout(() => {
  console.log('\n--- TEST 1: User Online ---');
  console.log('Alice emitting: user:online');
}, 1000);

// Test 2: Join conversation
setTimeout(() => {
  console.log('\n--- TEST 2: Join Conversation ---');
  socketAlice.emit('conversation:join', '68f0edfa2d67b259c60ef86c');
  socketBob.emit('conversation:join', '68f0edfa2d67b259c60ef86c');
  console.log('Alice and Bob joined conversation');
}, 2000);

// Test 3: Typing indicator
setTimeout(() => {
  console.log('\n--- TEST 3: Typing Indicators ---');
  socketAlice.emit('typing:start', {
    conversationId: '68f0edfa2d67b259c60ef86c',
    userId: '68f09fd283a525566e68bcfe'
  });
  console.log('Alice started typing...');
}, 3000);

socketBob.on('typing:active', (data) => {
  console.log('💬 Bob sees: Someone is typing -', data);
});

// Test 4: Send message
setTimeout(() => {
  console.log('\n--- TEST 4: Send Message ---');
  socketAlice.emit('message:send', {
    conversationId: '68f0edfa2d67b259c60ef86c',
    message: {
      _id: '65abc123...',
      senderId: '68f09fd283a525566e68bcfe',
      encryptedContent: 'Hello Bob!',
      createdAt: new Date()
    }
  });
  console.log('Alice sent message');
}, 4000);

socketBob.on('message:receive', (data) => {
  console.log('📨 Bob received message:', data);
});

// Test 5: Stop typing
setTimeout(() => {
  console.log('\n--- TEST 5: Stop Typing ---');
  socketAlice.emit('typing:stop', {
    conversationId: '68f0edfa2d67b259c60ef86c',
    userId: '68f09fd283a525566e68bcfe'
  });
  console.log('Alice stopped typing');
}, 5000);

socketBob.on('typing:inactive', (data) => {
  console.log('✋ Bob sees: Typing stopped -', data);
});


// Test 8: User disconnects
setTimeout(() => {
  console.log('\n--- TEST 8: User Disconnect ---');
  socketAlice.disconnect();
  console.log('Alice disconnected');
}, 8000);

socketBob.on('user:disconnected', (data) => {
  console.log('👋 Bob sees: User disconnected -', data);
});

// Close after tests
setTimeout(() => {
  socketBob.disconnect();
  console.log('\n✅ All tests completed!');
  process.exit(0);
}, 9000);

// Error handling
socketAlice.on('error', (error) => {
  console.error('❌ Alice socket error:', error);
});

socketBob.on('error', (error) => {
  console.error('❌ Bob socket error:', error);
});