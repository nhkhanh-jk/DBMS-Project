const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
  bookingCode: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  showtimeId: { type: Schema.Types.ObjectId, ref: 'Showtime', required: true },
  staffId: { type: Schema.Types.ObjectId, ref: 'User' }, // Nullable - only for staff/admin bookings
  paymentMethod: { type: String, required: true },
  promotionCode: { type: String },
  totalPrice: { type: Number, required: true, min: 0 },
  bookingTime: { type: Date, default: Date.now },
  tickets: [{
    seatNumber: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ['CONFIRMED', 'CANCELLED', 'REFUNDED'], default: 'CONFIRMED' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
