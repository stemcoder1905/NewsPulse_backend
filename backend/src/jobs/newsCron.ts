import cron from 'node-cron';
import { newsService } from '../services/news/news.service';
import logger from '../utils/logger';

export const initNewsCron = (): void => {
  logger.info('Initializing News Ingestion Cron Scheduler (Every 15 mins)...');

  // Schedule task every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    logger.info('[CRON] Executing scheduled news ingestion...');
    try {
      const stats = await newsService.ingestNews();
      logger.info(`[CRON] Scheduled news ingestion complete: ${JSON.stringify(stats)}`);
    } catch (err: any) {
      logger.error(`[CRON] Scheduled news ingestion failed: ${err.message}`);
    }
  });
};
