const http = require('http');
const app = require('./app');
const { initSocket } = require('./sockets');

// Create HTTP server (needed for Socket.IO)
const server = http.createServer(app);

// Initialize WebSocket server
initSocket(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
