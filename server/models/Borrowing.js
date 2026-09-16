const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: [true, 'Equipment ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  borrowDate: {
    type: Date,
    required: [true, 'Borrow date is required']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  returnedDate: {
    type: Date,
    default: null
  },
  depositAmount: {
    type: Number,
    required: true,
    min: 0
  },
  lateDays: {
    type: Number,
    default: 0,
    min: 0
  },
  lateFee: {
    type: Number,
    default: 0,
    min: 0
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['BORROWED', 'RETURNED', 'OVERDUE', 'CANCELLED'],
    default: 'BORROWED'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Middleware to calculate status dynamically on retrieval if past due date
borrowingSchema.methods.checkOverdue = function() {
  if (this.status === 'BORROWED') {
    const now = new Date();
    // Reset time components for accurate day comparison
    const due = new Date(this.dueDate);
    due.setHours(23, 59, 59, 999);
    if (now > due) {
      this.status = 'OVERDUE';
    }
  }
  return this.status;
};

module.exports = mongoose.model('Borrowing', borrowingSchema);
