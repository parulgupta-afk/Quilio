require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
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
    console.error('FATAL: JWT_SECRET is not set in server/.env');
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

  // Authenticate every socket connection via JWT (never trust client userId)
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization || '').replace(/^Bearer\s+/i, '');
      if (!token) {
        return next(new Error('Unauthorized'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) {
        return next(new Error('Unauthorized'));
      }
      socket.userId = decoded.id.toString();
      return next();
    } catch (err) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    // Join only the authenticated user's private room
    const room = `user:${socket.userId}`;
    socket.join(room);

    socket.on('disconnect', () => {
      // room membership cleared automatically
    });
  });

  // Expose io for notification emits
  app.set('io', io);
  global.io = io;

  server.listen(PORT, () => {
    console.log(`Quilio API listening on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
