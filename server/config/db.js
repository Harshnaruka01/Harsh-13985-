const mongoose = require('mongoose');

let mongoMemoryServer = null;

/** Reuse one connection across warm serverless invocations (Vercel). */
const getCached = () => {
  if (!global.__collegeAvMongoose) {
    global.__collegeAvMongoose = { conn: null, promise: null };
  }
  return global.__collegeAvMongoose;
};

const connectWithMemoryServer = async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  mongoMemoryServer = await MongoMemoryServer.create();
  const memoryUri = mongoMemoryServer.getUri();
  await mongoose.connect(memoryUri);
  console.log(`[Database] Connected to MongoMemoryServer at ${memoryUri}`);
};

const connectDB = async () => {
  const cached = getCached();
  if (cached.conn) {
    return cached.conn;
  }

  const isVercel = Boolean(process.env.VERCEL);
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college-av-db';

  if (isVercel && !process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Add a MongoDB Atlas connection string in Vercel → Settings → Environment Variables, then redeploy.'
    );
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: isVercel ? 10000 : 3000
        });
        console.log(`[Database] Connected to MongoDB`);
        return mongoose.connection;
      } catch (err) {
        if (isVercel) {
          throw new Error(`MongoDB connection failed: ${err.message}`);
        }
        console.warn(
          `[Database] Could not connect to ${uri} (${err.message}). Starting MongoMemoryServer...`
        );
        await connectWithMemoryServer();
        return mongoose.connection;
      }
    })();
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
