const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  bookingCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  showtimeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  staffId: {
    type: DataTypes.UUID,
    allowNull: true, // Nullable - only for staff/admin bookings
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  promotionCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  totalPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bookingTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  tickets: {
    type: DataTypes.JSONB, // Stores array of tickets [{seatNumber, price, status}]
    defaultValue: [],
  }
}, {
  tableName: 'bookings',
});

module.exports = Booking;
