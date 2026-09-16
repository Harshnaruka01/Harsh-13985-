const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedData = require('./utils/seedData');
const app = require('./app');

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedData(false);
    app.listen(PORT, () => {
      console.log(`🚀 [Server] College AV Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
};

startServer();
