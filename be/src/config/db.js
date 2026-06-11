const sequelize = require('./sequelize');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected via Sequelize');
    
    // Sync database models
    // In development: alter: true auto-updates schema
    // In production: sync() only (no destructive changes)
    const isDev = process.env.NODE_ENV !== 'production';
    await sequelize.sync({ alter: isDev });
    console.log('PostgreSQL models synchronized');
  } catch (error) {
    console.error('PostgreSQL connection/synchronization error:', error);
    throw error;
  }
};

module.exports = { connectDB };
