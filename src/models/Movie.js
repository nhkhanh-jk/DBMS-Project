const mongoose = require('mongoose');
const { Schema } = mongoose;

const movieSchema = new Schema({
  title: { type: String, required: true },
  genres: { type: [String], required: true },
  description: { type: String, default: '' },
  durationMin: { type: Number, required: true },
  releaseDate: { type: Date, required: true },
  status: { type: String, default: 'SCHEDULED' }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
