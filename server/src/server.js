require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('FATAL: MONGODB_URI is not set');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set');
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

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization || '').replace(/^Bearer\s+/i, '');
      if (!token) return next(new Error('Unauthorized'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) return next(new Error('Unauthorized'));
      socket.userId = decoded.id.toString();
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    logger.info('socket_connected', { userId: socket.userId });
  });

  app.set('io', io);
  global.io = io;

  server.listen(PORT, () => {
    logger.info('server_listen', { port: PORT, env: process.env.NODE_ENV || 'development' });
  });

  const shutdown = () => {
    logger.info('server_shutdown', {});
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
