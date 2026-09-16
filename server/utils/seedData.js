const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Borrowing = require('../models/Borrowing');
const connectDB = require('../config/db');

dotenv.config({ path: '../.env' });

const sampleEquipment = [
  {
    name: 'Canon EOS 80D DSLR Camera',
    category: 'Camera',
    description: '24.2 MP Digital SLR Camera with EF-S 18-135mm f/3.5-5.6 IS USM Lens. Ideal for photography & campus event coverage.',
    totalQuantity: 5,
    lateFeePerDay: 150,
    depositAmount: 3000,
    condition: 'Excellent',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    name: 'Sony Alpha A7 III Mirrorless',
    category: 'Camera',
    description: 'Full-frame mirrorless camera with 4K HDR video capabilities. Includes 28-70mm lens kit.',
    totalQuantity: 3,
    lateFeePerDay: 250,
    depositAmount: 5000,
    condition: 'Excellent',
    imageUrl: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    name: 'Epson Pro EX9220 Wireless Projector',
    category: 'Projector',
    description: '1080p wireless projector, 3600 Lumens color brightness, HDMI & Miracast support. Great for auditoriums & club presentations.',
    totalQuantity: 4,
    lateFeePerDay: 200,
    depositAmount: 2500,
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    name: 'Shure BLX288/PG58 Dual Wireless Mic System',
    category: 'Microphone',
    description: 'Dual channel wireless microphone system with handheld transmitters. Perfect for speeches, debates, and cultural shows.',
    totalQuantity: 6,
    lateFeePerDay: 100,
    depositAmount: 1500,
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    name: 'Manfrotto Professional Heavy Duty Tripod',
    category: 'Tripod',
    description: '3-section aluminum tripod with fluid video head. Holds up to 8kg of video camera gear.',
    totalQuantity: 8,
    lateFeePerDay: 50,
    depositAmount: 800,
    condition: 'Excellent',
    imageUrl: 'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=800&q=80',
    active: true
  },
  {
    name: 'JBL PartyBox 310 Portable PA Speaker',
    category: 'Audio/Speaker',
    description: '240W high power portable Bluetooth speaker with built-in mic inputs & dynamic light show.',
    totalQuantity: 3,
    lateFeePerDay: 300,
    depositAmount: 4000,
    condition: 'Good',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    active: true
  }
];

const seedData = async (force = false) => {
  try {
    const userCount = await User.countDocuments();
    const equipCount = await Equipment.countDocuments();

    if (!force && userCount > 0 && equipCount > 0) {
      console.log(`[Seed] Database contains ${userCount} users and ${equipCount} equipment items. Ensuring demo accounts exist...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const adminExists = await User.findOne({ email: 'admin@college.edu' });
      if (!adminExists) {
        await User.create({
          name: 'AV Room Incharge (Admin)',
          email: 'admin@college.edu',
          password: hashedPassword,
          role: 'ADMIN',
          maxBorrowLimit: 10
        });
      }

      const studentExists = await User.findOne({ email: 'aarav@college.edu' });
      if (!studentExists) {
        await User.create({
          name: 'Aarav Sharma (Student)',
          email: 'aarav@college.edu',
          password: hashedPassword,
          role: 'STUDENT',
          maxBorrowLimit: 3
        });
      }
      return;
    }

    console.log('[Seed] Setting up demo database collections & accounts...');
    if (force) {
      await User.deleteMany();
      await Equipment.deleteMany();
      await Borrowing.deleteMany();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    let adminUser = await User.findOne({ email: 'admin@college.edu' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'AV Room Incharge (Admin)',
        email: 'admin@college.edu',
        password: hashedPassword,
        role: 'ADMIN',
        maxBorrowLimit: 10
      });
    }

    let studentUser = await User.findOne({ email: 'aarav@college.edu' });
    if (!studentUser) {
      studentUser = await User.create({
        name: 'Aarav Sharma (Student)',
        email: 'aarav@college.edu',
        password: hashedPassword,
        role: 'STUDENT',
        maxBorrowLimit: 3
      });
    }

    let studentUser2 = await User.findOne({ email: 'priya@college.edu' });
    if (!studentUser2) {
      studentUser2 = await User.create({
        name: 'Priya Verma (Photography Club)',
        email: 'priya@college.edu',
        password: hashedPassword,
        role: 'STUDENT',
        maxBorrowLimit: 3
      });
    }

    let createdEquipment = [];
    if ((await Equipment.countDocuments()) === 0) {
      console.log('[Seed] Inserting equipment items...');
      createdEquipment = await Equipment.insertMany(sampleEquipment);
    } else {
      createdEquipment = await Equipment.find();
    }

    if ((await Borrowing.countDocuments()) === 0 && createdEquipment.length >= 4) {
      console.log('[Seed] Creating sample active & past borrowings...');
      const today = new Date();
      
      // Past returned borrowing
      const pastBorrowDate = new Date();
      pastBorrowDate.setDate(today.getDate() - 10);
      const pastDueDate = new Date();
      pastDueDate.setDate(today.getDate() - 5);
      const pastReturnDate = new Date();
      pastReturnDate.setDate(today.getDate() - 5);

      await Borrowing.create({
        userId: studentUser._id,
        equipmentId: createdEquipment[0]._id, // Canon DSLR
        quantity: 1,
        borrowDate: pastBorrowDate,
        dueDate: pastDueDate,
        returnedDate: pastReturnDate,
        depositAmount: 3000,
        lateDays: 0,
        lateFee: 0,
        refundAmount: 3000,
        status: 'RETURNED',
        notes: 'Returned on time in pristine condition'
      });

      // Currently active borrowing
      const currentBorrowDate = new Date();
      currentBorrowDate.setDate(today.getDate() - 1);
      const currentDueDate = new Date();
      currentDueDate.setDate(today.getDate() + 3);

      await Borrowing.create({
        userId: studentUser._id,
        equipmentId: createdEquipment[2]._id, // Epson Projector
        quantity: 1,
        borrowDate: currentBorrowDate,
        dueDate: currentDueDate,
        depositAmount: 2500,
        status: 'BORROWED',
        notes: 'Tech Fest prep presentation'
      });

      // Overdue borrowing sample
      const overdueBorrowDate = new Date();
      overdueBorrowDate.setDate(today.getDate() - 7);
      const overdueDueDate = new Date();
      overdueDueDate.setDate(today.getDate() - 2);

      await Borrowing.create({
        userId: studentUser2._id,
        equipmentId: createdEquipment[3]._id, // Shure Wireless Mic
        quantity: 2,
        borrowDate: overdueBorrowDate,
        dueDate: overdueDueDate,
        depositAmount: 3000,
        status: 'OVERDUE',
        notes: 'Drama Club Annual Play rehearsal'
      });
    }

    console.log('✅ [Seed] Database successfully seeded and ready!');
    console.log('----------------------------------------------------');
    console.log('DEMO ACCOUNTS READY:');
    console.log('ADMIN:   email: admin@college.edu | password: password123');
    console.log('STUDENT: email: aarav@college.edu | password: password123');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ [Seed] Error seeding database:', error);
  }
};

if (require.main === module) {
  connectDB().then(async () => {
    await seedData(true);
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seedData;
