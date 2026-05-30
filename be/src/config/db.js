const sequelize = require('./sequelize');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected via Sequelize');
    
    // Sync database models (creates tables if they do not exist)
    // using alter: true to update schema on change without deleting existing data
    await sequelize.sync({ alter: true });
    console.log('PostgreSQL models synchronized');
  } catch (error) {
    console.error('PostgreSQL connection/synchronization error:', error);
    throw error;
  }
};

module.exports = { connectDB };
