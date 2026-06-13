const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  genres: {
    type: DataTypes.JSONB, // Stores array of strings e.g. ["Action", "Sci-Fi"]
    allowNull: false,
    defaultValue: [],
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  durationMin: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  releaseDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'SCHEDULED', // SCHEDULED, ACTIVE, SNEAK_SHOW
  },
  posterUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'movies',
});

module.exports = Movie;
