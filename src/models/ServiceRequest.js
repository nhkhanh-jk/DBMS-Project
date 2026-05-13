const mongoose = require('mongoose');
const { Schema } = mongoose;

const serviceRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  requestType: { type: String, required: true },
  requestDetail: { type: String, required: true },
  status: { type: String, required: true, enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
