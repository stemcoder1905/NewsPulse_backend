import { Response, NextFunction } from 'express';
import { recommendationService } from '../services/recommendation/recommendation.service';
import { adService } from '../services/ads/ad.service';
import AppConfiguration from '../models/AppConfiguration';
import { AuthRequest } from '../middlewares/authMiddleware';
import { config } from '../config';

export const getFeed = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user ? req.user._id.toString() : undefined;
    const anonymousUserId = req.anonymousUserId;
    const limit = parseInt(req.query.limit as string || '20', 10);
    const cursor = req.query.cursor as string | undefined;

    // Get ad frequency configuration
    let adFrequency = config.adFrequency;
    try {
      const appConf = await AppConfiguration.findOne({ key: 'global_config' });
      if (appConf?.adFrequency) {
        adFrequency = appConf.adFrequency;
      }
    } catch (e) {
      // fallback
    }

    const feedResult = await recommendationService.generatePersonalizedFeed(
      userId,
      anonymousUserId,
      limit,
      cursor
    );

    // Contextual Ad Request
    const adContext = {
      userId,
      anonymousUserId,
      topInterestCategories: feedResult.recommendedCategories,
      platform: (req.headers['x-platform'] as string) || 'mobile',
      language: 'en'
    };

    const sponsoredAd = await adService.getAdForUser(adContext);

    // Insert Ad card after every AD_FREQUENCY eligible news items
    const feedWithAds: any[] = [];
    let newsCounter = 0;

    for (const item of feedResult.items) {
      feedWithAds.push(item);
      newsCounter++;

      if (newsCounter % adFrequency === 0 && sponsoredAd) {
        feedWithAds.push({
          type: 'ad',
          data: sponsoredAd
        });
      }
    }

    res.json({
      success: true,
      message: 'Personalized feed retrieved',
      data: {
        articles: feedWithAds,
        recommendedCategories: feedResult.recommendedCategories,
        nextCursor: feedResult.nextCursor,
        adFrequency
      }
    });
  } catch (error) {
    next(error);
  }
};
