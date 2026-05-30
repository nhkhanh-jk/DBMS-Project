const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Cinema = sequelize.define('Cinema', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rooms: {
    type: DataTypes.JSONB, // Stores array of room objects [{roomNumber, capacity, type}]
    defaultValue: [],
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'cinemas',
});

module.exports = Cinema;
