import dns from 'dns';
// Force Google DNS to fix SRV resolution issues with MongoDB Atlas
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import app from './app';
import { config } from './config';
import { connectDB } from './config/database';
import { newsService } from './services/news/news.service';
import { initNewsCron } from './jobs/newsCron';
import logger from './utils/logger';

const startServer = async () => {
  try {
    // 1. Connect Database (Non-blocking fallback)
    await connectDB();

    // 2. Start HTTP Server immediately
    app.listen(config.port, () => {
      logger.info(`==================================================`);
      logger.info(`🚀 NewsPulse AI Backend running on port ${config.port}`);
      logger.info(`📚 Swagger Documentation: http://localhost:${config.port}/api/docs`);
      logger.info(`==================================================`);
    });

    // 3. Initial News Ingestion if Database is empty
    newsService
      .getLatestNews(1, 1)
      .then(async (res) => {
        if (res.total === 0) {
          logger.info('Database empty on startup. Triggering seed news ingestion...');
          await newsService.ingestNews();
        }
      })
      .catch((err) => {
        logger.warn('Seed news ingestion deferred:', err.message);
      });

    // 4. Initialize Cron Jobs
    initNewsCron();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
