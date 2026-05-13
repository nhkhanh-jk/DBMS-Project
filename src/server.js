const { createApp } = require('./app');
const { connectDB } = require('./config/db');
const { redis } = require('./config/redis');
const env = require('./config/env');
const { scheduleShowtimeUpdates } = require('./workers/showtimeScheduler');

console.log('Environment variables:', env);

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
    console.log('Port from env:', PORT, 'type:', typeof PORT);

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
