require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('FATAL: MONGODB_URI is not set in server/.env — login cannot work without MongoDB');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set in server/.env — tokens cannot be signed');
    process.exit(1);
  }
  await connectDB();

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
    const gId = process.env.GOOGLE_CLIENT_ID;
    console.log(gId ? 'Google Sign-In: configured (GOOGLE_CLIENT_ID set)' : 'Google Sign-In: GOOGLE_CLIENT_ID not set');
    console.log(`🚀 Quilio server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
