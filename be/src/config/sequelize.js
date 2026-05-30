const { Sequelize } = require('sequelize');
const { databaseUrl, nodeEnv } = require('./env');

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: nodeEnv === 'development' ? console.log : false,
  define: {
    timestamps: true, // Auto add createdAt and updatedAt
  },
});

module.exports = sequelize;
