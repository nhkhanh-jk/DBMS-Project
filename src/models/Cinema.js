const mongoose = require('mongoose');
const { Schema } = mongoose;

const cinemaSchema = new Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  rooms: { type: Number, required: true }
});

module.exports = mongoose.model('Cinema', cinemaSchema);
