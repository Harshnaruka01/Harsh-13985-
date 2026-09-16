const path = require('path');
const serverless = require('serverless-http');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const connectDB = require('../server/config/db');
const seedData = require('../server/utils/seedData');
const app = require('../server/app');

let handler;
let initError = null;

const ensureReady = async () => {
  if (handler) return;
  if (initError) throw initError;
  try {
    await connectDB();
    await seedData(false);
    handler = serverless(app);
  } catch (err) {
    initError = err;
    console.error('[api] Startup failed:', err);
    throw err;
  }
};

module.exports = async (req, res) => {
  try {
    await ensureReady();
    return handler(req, res);
  } catch (err) {
    console.error('[api] Request failed:', err);
    const message = err.message || 'Internal Server Error';
    const status = message.includes('MONGODB_URI') ? 503 : 500;
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  }
};
