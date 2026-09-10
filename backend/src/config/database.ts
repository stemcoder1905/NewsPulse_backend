import mongoose from 'mongoose';
import { config } from './index';
import logger from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      tls: config.mongoUri.includes('mongodb+srv') || config.mongoUri.includes('mongodb.net'),
      retryWrites: true,
      w: 'majority' as const,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.warn(`MongoDB Connection Warning: ${error.message}. Running server with memory cache fallback.`);
  }
};
