const mongoose = require('mongoose');
const { Schema } = mongoose;

const showtimeSchema = new Schema({
  movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
  cinemaId: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true },
  roomId: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  basePrice: { type: Number, required: true, min: 0 },
  status: { type: String, required: true, enum: ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' },
  bookedSeats: [{
    seatNumber: { type: String, required: true },
    status: { type: String, default: 'BOOKED', enum: ['BOOKED', 'AVAILABLE', 'CANCELLED'] }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Showtime', showtimeSchema);
