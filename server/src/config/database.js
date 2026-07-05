import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * Attempts to connect to MongoDB. If no URI is configured or the connection
 * fails (e.g. no local MongoDB instance available in the environment), the
 * app degrades gracefully into an in-memory persistence mode so the product
 * remains fully functional for demos, interviews, and local development.
 *
 * @returns {Promise<boolean>} true if connected to a real MongoDB instance
 */
export async function connectDatabase() {
  if (!env.mongoUri) {
    logger.warn('No MONGODB_URI configured — running with in-memory data store.');
    return false;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    logger.info('Connected to MongoDB successfully.');
    return true;
  } catch (error) {
    logger.warn(`MongoDB connection failed (${error.message}). Falling back to in-memory store.`);
    return false;
  }
}

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}
