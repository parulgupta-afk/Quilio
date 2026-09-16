require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (process.env.MONGODB_URI) {
    await connectDB();
  } else {
    console.log('⚠️  MONGODB_URI not set — skipping database connection');
  }

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Make io available to routes via app
  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Join a room based on userId
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  server.listen(PORT, () => {
    console.log(`🚀 Quilio server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
