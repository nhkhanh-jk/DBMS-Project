const { Sequelize } = require('sequelize');
const { nodeEnv } = require('./env');

require('dotenv').config()

const sequelize = new Sequelize( process.env.DB_URL, {
  dialect: 'postgres',
  logging: nodeEnv === 'development' ? console.log : false,
  define: {
    timestamps: true, // Auto add createdAt and updatedAt
  },
});

module.exports = sequelize;
