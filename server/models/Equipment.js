const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Camera', 'Projector', 'Microphone', 'Tripod', 'Audio/Speaker', 'Other']
  },
  description: {
    type: String,
    default: ''
  },
  totalQuantity: {
    type: Number,
    required: [true, 'Total quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  lateFeePerDay: {
    type: Number,
    required: [true, 'Late fee per day is required'],
    min: [0, 'Late fee cannot be negative']
  },
  depositAmount: {
    type: Number,
    required: [true, 'Refundable deposit amount is required'],
    min: [0, 'Deposit cannot be negative']
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Needs Maintenance'],
    default: 'Good'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Equipment', equipmentSchema);
