import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/newspulse',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_jwt_key_newspulse_2026_dev',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_newspulse_2026_dev',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  newsApi: {
    newsApiKey: process.env.NEWS_API_KEY || '',
    googleNewsApiKey: process.env.GOOGLE_NEWS_API_KEY || '',
    mediastackApiKey: process.env.MEDIASTACK_API_KEY || ''
  },
  aimlads: {
    baseUrl: process.env.AIMLADS_BASE_URL || 'https://api.aimlads.com/v1',
    apiKey: process.env.AIMLADS_API_KEY || '',
    publisherId: process.env.AIMLADS_PUBLISHER_ID || 'pub_newspulse_demo_123'
  },
  adFrequency: parseInt(process.env.AD_FREQUENCY || '5', 10),
  recommendationWeights: {
    interest: parseFloat(process.env.REC_WEIGHT_INTEREST || '0.40'),
    freshness: parseFloat(process.env.REC_WEIGHT_FRESHNESS || '0.25'),
    engagement: parseFloat(process.env.REC_WEIGHT_ENGAGEMENT || '0.15'),
    preference: parseFloat(process.env.REC_WEIGHT_PREFERENCE || '0.10'),
    diversity: parseFloat(process.env.REC_WEIGHT_DIVERSITY || '0.10')
  }
};
