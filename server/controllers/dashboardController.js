const Equipment = require('../models/Equipment');
const Borrowing = require('../models/Borrowing');
const User = require('../models/User');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const activeEquipment = await Equipment.find({ active: true });
    
    // Total physical units owned
    const totalEquipmentUnits = activeEquipment.reduce((sum, item) => sum + item.totalQuantity, 0);

    // Active borrowings (BORROWED or OVERDUE)
    const activeBorrowings = await Borrowing.find({
      status: { $in: ['BORROWED', 'OVERDUE'] }
    });

    const currentlyBorrowedUnits = activeBorrowings.reduce((sum, b) => sum + b.quantity, 0);
    const availableUnits = Math.max(0, totalEquipmentUnits - currentlyBorrowedUnits);

    // Overdue count
    const now = new Date();
    const overdueBorrowings = activeBorrowings.filter(b => {
      const due = new Date(b.dueDate);
      due.setHours(23, 59, 59, 999);
      return now > due;
    });

    const overdueCount = overdueBorrowings.length;

    // Filter recent borrowings based on role
    let recentQuery = {};
    if (req.user.role !== 'ADMIN') {
      recentQuery.userId = req.user._id;
    }

    const recentBorrowings = await Borrowing.find(recentQuery)
      .populate('userId', 'name email')
      .populate('equipmentId', 'name category imageUrl depositAmount')
      .sort({ createdAt: -1 })
      .limit(5);

    const totalStudentsCount = await User.countDocuments({ role: 'STUDENT' });

    res.json({
      totalEquipmentItems: activeEquipment.length,
      totalEquipmentUnits,
      availableUnits,
      currentlyBorrowedUnits,
      overdueCount,
      totalStudentsCount,
      recentBorrowings
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

module.exports = { getDashboardStats };
