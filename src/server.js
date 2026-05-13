const { createApp } = require('./src/app');
const { connectDB } = require('./src/config/db');
const { redis } = require('./src/config/redis');
const { env } = require('./src/config/env');
const { scheduleShowtimeUpdates } = require('./src/workers/showtimeScheduler');

const startServer = async () => {
  try {
    console.log('Starting server...');
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB connected');

    // Connect to Redis
    await redis.ping();
    console.log('Redis connected');

    const app = createApp();
    const PORT = env.port;

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });

    // Start background workers
    scheduleShowtimeUpdates();
    console.log('Background workers started');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
