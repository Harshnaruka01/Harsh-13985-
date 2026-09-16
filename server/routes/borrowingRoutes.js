const express = require('express');
const router = express.Router();
const {
  createBorrowing,
  getBorrowings,
  getBorrowingById,
  returnBorrowing
  , transferBorrowing
} = require('../controllers/borrowingController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

router.use(protect); // All borrowing endpoints require authentication

router.post('/', createBorrowing);
router.get('/', getBorrowings);
router.get('/:id', getBorrowingById);
router.post('/:id/return', returnBorrowing);
router.post('/:id/transfer', adminOnly, transferBorrowing);

module.exports = router;
