const express = require('express');
const router = express.Router();
const {
  createBorrowing,
  getBorrowings,
  getBorrowingById,
  returnBorrowing
} = require('../controllers/borrowingController');
const { protect } = require('../middleware/auth');

router.use(protect); // All borrowing endpoints require authentication

router.post('/', createBorrowing);
router.get('/', getBorrowings);
router.get('/:id', getBorrowingById);
router.post('/:id/return', returnBorrowing);

module.exports = router;
