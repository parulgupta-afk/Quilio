require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB (will fail gracefully if MONGODB_URI is not set yet)
  if (process.env.MONGODB_URI) {
    await connectDB();
  } else {
    console.log('⚠️  MONGODB_URI not set — skipping database connection for now');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Quilio server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
