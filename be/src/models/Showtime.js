const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Showtime = sequelize.define('Showtime', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  movieId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  cinemaId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  basePrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'SCHEDULED', // SCHEDULED, ACTIVE, COMPLETED, CANCELLED
  },
  bookedSeats: {
    type: DataTypes.JSONB, // Stores array of booked seats [{seatNumber, status}]
    defaultValue: [],
  }
}, {
  tableName: 'showtimes',
});

module.exports = Showtime;
