const { createApp } = require('./app');
const { connectDB } = require('./config/db');
const env = require('./config/env');
const { scheduleShowtimeUpdates } = require('./workers/showtimeScheduler');

console.log('Environment variables:', {
  port: env.port,
  nodeEnv: env.nodeEnv,
  databaseUrl: env.databaseUrl,
});

const startServer = async () => {
  try {
    console.log('Starting server...');
    
    // Connect to PostgreSQL database via Sequelize
    await connectDB();

    const app = createApp();
    const PORT = env.port;

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });

    // Start background scheduler
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
