const Borrowing = require('../models/Borrowing');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const { calculateAvailability } = require('./equipmentController');

// @desc    Create new borrowing request
// @route   POST /api/borrowings
// @access  Private
const createBorrowing = async (req, res) => {
  try {
    const { equipmentId, quantity, borrowDate, dueDate, notes } = req.body;
    const userId = req.user._id;

    // 1. Validate quantity
    const reqQty = parseInt(quantity, 10);
    if (!reqQty || reqQty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // 2. Validate dates
    if (!borrowDate || !dueDate) {
      return res.status(400).json({ message: 'Both borrow date and due date are required' });
    }

    const start = new Date(borrowDate);
    const end = new Date(dueDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid borrow date or due date format' });
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      return res.status(400).json({ message: 'Due date cannot be before borrow date' });
    }

    // Prevents booking far in the past (allow today or future)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    if (start < yesterday) {
      return res.status(400).json({ message: 'Borrow date cannot be in the past' });
    }

    // 3. Find equipment
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment || !equipment.active) {
      return res.status(404).json({ message: 'Equipment not found or is currently inactive' });
    }

    // 4. Validate user active borrowing limit
    const user = await User.findById(userId);
    const maxLimit = user.maxBorrowLimit || 3;

    // Get user's current active borrowed quantity across all items
    const activeUserBorrowings = await Borrowing.find({
      userId,
      status: { $in: ['BORROWED', 'OVERDUE'] }
    });

    const currentActiveUnits = activeUserBorrowings.reduce((sum, b) => sum + b.quantity, 0);

    if (currentActiveUnits + reqQty > maxLimit) {
      return res.status(400).json({
        message: `Borrowing limit exceeded! You currently have ${currentActiveUnits} active equipment unit(s). Your limit is ${maxLimit}. Requesting ${reqQty} more unit(s) exceeds your allowed limit.`
      });
    }

    // 5. Check equipment availability for requested date range
    const avail = await calculateAvailability(equipmentId, borrowDate, dueDate);
    if (avail.availableQuantity < reqQty) {
      return res.status(400).json({
        message: `Insufficient equipment available for the selected dates. Available: ${avail.availableQuantity}, Requested: ${reqQty}`
      });
    }

    // 6. Calculate snapshot deposit amount (quantity * equipment.depositAmount)
    const totalDeposit = reqQty * equipment.depositAmount;

    // 7. Create borrowing record
    const borrowing = await Borrowing.create({
      userId,
      equipmentId,
      quantity: reqQty,
      borrowDate: start,
      dueDate: end,
      depositAmount: totalDeposit,
      status: 'BORROWED',
      notes: notes || ''
    });

    const populatedBorrowing = await Borrowing.findById(borrowing._id)
      .populate('userId', 'name email role')
      .populate('equipmentId', 'name category lateFeePerDay depositAmount condition imageUrl');

    res.status(201).json(populatedBorrowing);
  } catch (error) {
    console.error('createBorrowing error:', error);
    res.status(500).json({ message: 'Error creating borrowing record', error: error.message });
  }
};

// @desc    Get borrowings list (Filtered for student, full for admin)
// @route   GET /api/borrowings
// @access  Private
const getBorrowings = async (req, res) => {
  try {
    const { status, equipmentId } = req.query;

    let query = {};

    // Students only see their own borrowings
    if (req.user.role !== 'ADMIN') {
      query.userId = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    if (equipmentId) {
      query.equipmentId = equipmentId;
    }

    const borrowings = await Borrowing.find(query)
      .populate('userId', 'name email role')
      .populate('equipmentId', 'name category lateFeePerDay depositAmount condition imageUrl')
      .sort({ createdAt: -1 });

    // Update overdue status dynamically
    const updatedBorrowings = await Promise.all(
      borrowings.map(async (b) => {
        if (b.status === 'BORROWED') {
          const now = new Date();
          const due = new Date(b.dueDate);
          due.setHours(23, 59, 59, 999);
          if (now > due) {
            b.status = 'OVERDUE';
            await b.save();
          }
        }
        return b;
      })
    );

    res.json(updatedBorrowings);
  } catch (error) {
    console.error('getBorrowings error:', error);
    res.status(500).json({ message: 'Error fetching borrowings', error: error.message });
  }
};

// @desc    Get single borrowing record
// @route   GET /api/borrowings/:id
// @access  Private
const getBorrowingById = async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id)
      .populate('userId', 'name email role')
      .populate('equipmentId', 'name category lateFeePerDay depositAmount condition imageUrl');

    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    // Access control check
    if (req.user.role !== 'ADMIN' && borrowing.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this record' });
    }

    borrowing.checkOverdue();
    res.json(borrowing);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching borrowing details', error: error.message });
  }
};

// @desc    Process equipment return (calculate late days, fee & refund)
// @route   POST /api/borrowings/:id/return
// @access  Private
const returnBorrowing = async (req, res) => {
  try {
    const { returnDate, notes } = req.body;

    const borrowing = await Borrowing.findById(req.params.id)
      .populate('equipmentId');

    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    if (borrowing.status === 'RETURNED') {
      return res.status(400).json({ message: 'Equipment has already been returned' });
    }

    if (borrowing.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Cannot return a cancelled borrowing' });
    }

    // Students can return their own, Admins can return any
    if (req.user.role !== 'ADMIN' && borrowing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark return for this item' });
    }

    const actualReturn = returnDate ? new Date(returnDate) : new Date();
    const due = new Date(borrowing.dueDate);
    due.setHours(23, 59, 59, 999);

    let lateDays = 0;
    let lateFee = 0;

    if (actualReturn > due) {
      const diffMs = actualReturn.getTime() - due.getTime();
      lateDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (lateDays < 0) lateDays = 0;

      const dailyRate = borrowing.equipmentId ? borrowing.equipmentId.lateFeePerDay : 100;
      lateFee = lateDays * (dailyRate * borrowing.quantity);
    }

    // Calculate deposit refund: refund = max(0, deposit - lateFee)
    const refundAmount = Math.max(0, borrowing.depositAmount - lateFee);

    borrowing.returnedDate = actualReturn;
    borrowing.lateDays = lateDays;
    borrowing.lateFee = lateFee;
    borrowing.refundAmount = refundAmount;
    borrowing.status = 'RETURNED';
    if (notes) borrowing.notes = notes;

    await borrowing.save();

    const updated = await Borrowing.findById(borrowing._id)
      .populate('userId', 'name email role')
      .populate('equipmentId', 'name category lateFeePerDay depositAmount condition imageUrl');

    res.json({
      message: 'Equipment successfully returned',
      summary: {
        borrowingId: updated._id,
        equipmentName: updated.equipmentId ? updated.equipmentId.name : 'Equipment',
        borrowerName: updated.userId ? updated.userId.name : 'User',
        borrowDate: updated.borrowDate,
        dueDate: updated.dueDate,
        returnedDate: updated.returnedDate,
        lateDays: updated.lateDays,
        dailyLateFee: updated.equipmentId ? updated.equipmentId.lateFeePerDay : 0,
        totalLateFee: updated.lateFee,
        initialDeposit: updated.depositAmount,
        refundAmount: updated.refundAmount
      },
      borrowing: updated
    });
  } catch (error) {
    console.error('returnBorrowing error:', error);
    res.status(500).json({ message: 'Error processing return', error: error.message });
  }
};

module.exports = {
  createBorrowing,
  getBorrowings,
  getBorrowingById,
  returnBorrowing
};
