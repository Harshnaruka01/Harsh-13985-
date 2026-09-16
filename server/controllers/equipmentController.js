const Equipment = require('../models/Equipment');
const Borrowing = require('../models/Borrowing');

// Helper function to calculate availability for an equipment item over a date range
const calculateAvailability = async (equipmentId, startDateStr, endDateStr) => {
  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) return null;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  // Set time components for full day inclusion
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  // Overlap condition: existing.borrowDate <= requested.endDate AND existing.dueDate >= requested.startDate
  const overlappingBorrowings = await Borrowing.find({
    equipmentId,
    status: { $in: ['BORROWED', 'OVERDUE'] },
    borrowDate: { $lte: end },
    dueDate: { $gte: start }
  });

  const bookedQuantity = overlappingBorrowings.reduce((sum, b) => sum + b.quantity, 0);
  const availableQuantity = Math.max(0, equipment.totalQuantity - bookedQuantity);

  return {
    equipment,
    totalQuantity: equipment.totalQuantity,
    bookedQuantity,
    availableQuantity,
    isAvailable: availableQuantity > 0,
    overlappingBorrowingsCount: overlappingBorrowings.length
  };
};

// @desc    Get all equipment (with optional filters)
// @route   GET /api/equipment
// @access  Public
const getEquipment = async (req, res) => {
  try {
    const { category, search, activeOnly, startDate, endDate } = req.query;

    let query = {};

    if (activeOnly !== 'false') {
      query.active = true;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Equipment.find(query).sort({ createdAt: -1 });

    // If dates are provided, attach live availability info to each item
    if (startDate && endDate) {
      const itemsWithAvailability = await Promise.all(
        items.map(async (item) => {
          const avail = await calculateAvailability(item._id, startDate, endDate);
          return {
            ...item.toObject(),
            availableQuantity: avail ? avail.availableQuantity : item.totalQuantity,
            bookedQuantity: avail ? avail.bookedQuantity : 0
          };
        })
      );
      return res.json(itemsWithAvailability);
    }

    // Default: calculate current active borrowings (for today)
    const todayStr = new Date().toISOString().split('T')[0];
    const itemsWithCurrentAvailability = await Promise.all(
      items.map(async (item) => {
        const avail = await calculateAvailability(item._id, todayStr, todayStr);
        return {
          ...item.toObject(),
          availableQuantity: avail ? avail.availableQuantity : item.totalQuantity,
          bookedQuantity: avail ? avail.bookedQuantity : 0
        };
      })
    );

    res.json(itemsWithCurrentAvailability);
  } catch (error) {
    console.error('getEquipment error:', error);
    res.status(500).json({ message: 'Error fetching equipment', error: error.message });
  }
};

// @desc    Get single equipment item
// @route   GET /api/equipment/:id
// @access  Public
const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const avail = await calculateAvailability(equipment._id, todayStr, todayStr);

    res.json({
      ...equipment.toObject(),
      availableQuantity: avail ? avail.availableQuantity : equipment.totalQuantity,
      bookedQuantity: avail ? avail.bookedQuantity : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching equipment details', error: error.message });
  }
};

// @desc    Check availability for date range & quantity
// @route   GET /api/equipment/:id/availability
// @access  Public
const getEquipmentAvailability = async (req, res) => {
  try {
    const { startDate, endDate, quantity } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide both startDate and endDate' });
    }

    const reqStart = new Date(startDate);
    const reqEnd = new Date(endDate);

    if (isNaN(reqStart.getTime()) || isNaN(reqEnd.getTime())) {
      return res.status(400).json({ message: 'Invalid start date or end date format' });
    }

    if (reqStart > reqEnd) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    const avail = await calculateAvailability(req.params.id, startDate, endDate);
    if (!avail) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const requestedQty = parseInt(quantity, 10) || 1;
    const isAvailableForRequest = avail.availableQuantity >= requestedQty;

    res.json({
      equipmentId: req.params.id,
      startDate,
      endDate,
      requestedQuantity: requestedQty,
      totalQuantity: avail.totalQuantity,
      bookedQuantity: avail.bookedQuantity,
      availableQuantity: avail.availableQuantity,
      isAvailable: isAvailableForRequest,
      message: isAvailableForRequest
        ? `${requestedQty} unit(s) available for requested dates`
        : `Only ${avail.availableQuantity} unit(s) available. Cannot fulfill request of ${requestedQty}.`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking availability', error: error.message });
  }
};

// @desc    Create new equipment (Admin)
// @route   POST /api/equipment
// @access  Private/Admin
const createEquipment = async (req, res) => {
  try {
    const { name, category, description, totalQuantity, lateFeePerDay, depositAmount, condition, imageUrl } = req.body;

    if (!name || !category || totalQuantity === undefined || lateFeePerDay === undefined || depositAmount === undefined) {
      return res.status(400).json({ message: 'Missing required equipment fields' });
    }

    const equipment = await Equipment.create({
      name,
      category,
      description: description || '',
      totalQuantity: Number(totalQuantity),
      lateFeePerDay: Number(lateFeePerDay),
      depositAmount: Number(depositAmount),
      condition: condition || 'Good',
      imageUrl: imageUrl || ''
    });

    res.status(201).json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating equipment', error: error.message });
  }
};

// @desc    Update equipment (Admin)
// @route   PUT /api/equipment/:id
// @access  Private/Admin
const updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const updated = await Equipment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating equipment', error: error.message });
  }
};

// @desc    Deactivate/Delete equipment (Admin)
// @route   DELETE /api/equipment/:id
// @access  Private/Admin
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Check for active borrowings
    const activeBorrowings = await Borrowing.countDocuments({
      equipmentId: req.params.id,
      status: { $in: ['BORROWED', 'OVERDUE'] }
    });

    if (activeBorrowings > 0) {
      return res.status(400).json({
        message: `Cannot delete equipment. There are currently ${activeBorrowings} active borrowing(s) for this item.`
      });
    }

    // Soft delete / deactivate
    equipment.active = false;
    await equipment.save();

    res.json({ message: 'Equipment deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating equipment', error: error.message });
  }
};

module.exports = {
  getEquipment,
  getEquipmentById,
  getEquipmentAvailability,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  calculateAvailability
};
