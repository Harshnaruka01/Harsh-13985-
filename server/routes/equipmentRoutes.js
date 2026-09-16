const express = require('express');
const router = express.Router();
const {
  getEquipment,
  getEquipmentById,
  getEquipmentAvailability,
  createEquipment,
  updateEquipment,
  deleteEquipment
} = require('../controllers/equipmentController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getEquipment);
router.get('/:id', getEquipmentById);
router.get('/:id/availability', getEquipmentAvailability);

// Admin-only routes
router.post('/', protect, adminOnly, createEquipment);
router.put('/:id', protect, adminOnly, updateEquipment);
router.delete('/:id', protect, adminOnly, deleteEquipment);

module.exports = router;
