import { Response, NextFunction } from 'express';
import { adService } from '../services/ads/ad.service';
import { AuthRequest } from '../middlewares/authMiddleware';

export const requestAd = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user ? req.user._id.toString() : undefined;
    const anonymousUserId = req.body.anonymousUserId || req.anonymousUserId;
    const { topInterestCategories, topTopics, platform, language } = req.body;

    const ad = await adService.getAdForUser({
      userId,
      anonymousUserId,
      topInterestCategories,
      topTopics,
      platform,
      language
    });

    res.json({
      success: true,
      message: ad ? 'Ad served' : 'No ad available',
      data: { ad }
    });
  } catch (error) {
    next(error);
  }
};

export const trackAdImpression = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { campaignId } = req.body;
    const userId = req.user ? req.user._id.toString() : undefined;
    const anonymousUserId = req.body.anonymousUserId || req.anonymousUserId;

    await adService.recordImpression(id, campaignId, userId, anonymousUserId);

    res.json({
      success: true,
      message: 'Ad impression tracked',
      data: { adId: id }
    });
  } catch (error) {
    next(error);
  }
};

export const trackAdClick = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { campaignId } = req.body;
    const userId = req.user ? req.user._id.toString() : undefined;
    const anonymousUserId = req.body.anonymousUserId || req.anonymousUserId;

    await adService.recordClick(id, campaignId, userId, anonymousUserId);

    res.json({
      success: true,
      message: 'Ad click tracked',
      data: { adId: id }
    });
  } catch (error) {
    next(error);
  }
};

export const trackAdConversion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { campaignId } = req.body;
    const userId = req.user ? req.user._id.toString() : undefined;
    const anonymousUserId = req.body.anonymousUserId || req.anonymousUserId;

    await adService.recordConversion(id, campaignId, userId, anonymousUserId);

    res.json({
      success: true,
      message: 'Ad conversion tracked',
      data: { adId: id }
    });
  } catch (error) {
    next(error);
  }
};
