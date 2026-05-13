const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['ADMIN', 'NHANVIEN', 'KHACHHANG'], default: 'KHACHHANG' },
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String },
  email: { type: String },
  phoneNumber: { type: String },
  rewardPoints: { type: Number, default: 0 },
  membershipLevel: { type: String, default: 'bronze' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
