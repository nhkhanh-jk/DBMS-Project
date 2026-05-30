const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ServiceRequest = sequelize.define('ServiceRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  requestType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  requestDetail: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'PENDING', // PENDING, IN_PROGRESS, RESOLVED, REJECTED
  }
}, {
  tableName: 'service_requests',
});

module.exports = ServiceRequest;
