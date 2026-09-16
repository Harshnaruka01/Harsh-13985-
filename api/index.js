const path = require('path');
const serverless = require('serverless-http');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const connectDB = require('../server/config/db');
const seedData = require('../server/utils/seedData');
const app = require('../server/app');

let handler;

module.exports = async (req, res) => {
  if (!handler) {
    await connectDB();
    await seedData(false);
    handler = serverless(app);
  }
  return handler(req, res);
};
