import Redis from 'ioredis';
import { config } from './index';
import logger from '../utils/logger';

class CacheService {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    try {
      this.client = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) {
            logger.warn('Redis connection failed. Degrading to in-memory fallback cache.');
            return null;
          }
          return Math.min(times * 100, 2000);
        }
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis Client Connected');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        logger.warn(`Redis Error: ${err.message}`);
      });
    } catch (err) {
      logger.warn('Failed to initialize Redis client. Using fallback.');
    }
  }

  // Fallback in-memory map if Redis is unavailable
  private memoryCache: Map<string, { value: string; expiry: number }> = new Map();

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (err) {
        logger.warn(`Redis GET error for key ${key}, falling back to memory`);
      }
    }
    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds: number = 300): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.set(key, value, 'EX', ttlSeconds);
        return;
      } catch (err) {
        logger.warn(`Redis SET error for key ${key}, falling back to memory`);
      }
    }
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000
    });
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
      } catch (err) {
        logger.warn(`Redis DEL error for key ${key}`);
      }
    }
    this.memoryCache.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } catch (err) {
        logger.warn(`Redis delPattern error for ${pattern}`);
      }
    }
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
        this.memoryCache.delete(key);
      }
    }
  }
}

export const cacheService = new CacheService();
