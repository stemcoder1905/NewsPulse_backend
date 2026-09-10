import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import UserReadHistory from '../models/UserReadHistory';
import UserInterestProfile from '../models/UserInterestProfile';
import UserNewsInteraction from '../models/UserNewsInteraction';
import NewsArticle from '../models/NewsArticle';
import { scoringService } from '../services/recommendation/scoring.service';
import { AuthRequest } from '../middlewares/authMiddleware';
import logger from '../utils/logger';

const AD_TRIGGER_INTERVAL = 5;

export interface CategoryInterestStat {
  category: string;
  count: number;
  percentage: number;
}

export interface UserInterestProfileResponse {
  totalRead: number;
  clickCount: number;
  clicksUntilNextAd: number;
  topCategory: string | null;
  secondaryCategory: string | null;
  categoryStats: CategoryInterestStat[];
}

function getUserQuery(req: AuthRequest): { userId?: mongoose.Types.ObjectId; anonymousUserId?: string } {
  if (req.user && req.user._id) {
    return { userId: req.user._id };
  }
  const anonId = req.anonymousUserId || (req.headers['x-anonymous-id'] as string) || (req.body && req.body.anonymousUserId) || 'guest_default';
  return { anonymousUserId: anonId };
}

async function computeUserAnalytics(
  query: { userId?: mongoose.Types.ObjectId; anonymousUserId?: string },
  clickCount = 0
): Promise<UserInterestProfileResponse> {
  const stats = await UserReadHistory.aggregate([
    { $match: query },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const total = stats.reduce((sum, s) => sum + s.count, 0);
  const categoryStats: CategoryInterestStat[] = stats.map((s) => ({
    category: s._id,
    count: s.count,
    percentage: total > 0 ? Math.round((s.count / total) * 100) : 0
  }));

  const effectiveClicks = clickCount > 0 ? clickCount : total;
  let clicksUntil = AD_TRIGGER_INTERVAL - (effectiveClicks % AD_TRIGGER_INTERVAL);
  if (clicksUntil === 0) clicksUntil = AD_TRIGGER_INTERVAL;

  return {
    totalRead: total,
    clickCount: effectiveClicks,
    clicksUntilNextAd: clicksUntil,
    topCategory: categoryStats[0]?.category || null,
    secondaryCategory: categoryStats[1]?.category || null,
    categoryStats
  };
}

/**
 * Track an article read click event on the backend.
 * Upserts UserReadHistory, updates UserInterestProfile, and computes current stats.
 */
export const trackRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userQuery = getUserQuery(req);
    const {
      articleId,
      articleUrl,
      title,
      category,
      sourceName = 'NewsPulse',
      imageUrl,
      publishedAt
    } = req.body;

    if (!articleUrl || !title || !category) {
      res.status(400).json({
        success: false,
        message: 'articleUrl, title, and category are required'
      });
      return;
    }

    const cat = category.toLowerCase().trim();

    // 1. Upsert into UserReadHistory (updates readAt timestamp)
    await UserReadHistory.findOneAndUpdate(
      { ...userQuery, articleUrl },
      {
        ...userQuery,
        articleId: mongoose.isValidObjectId(articleId) ? articleId : undefined,
        articleUrl,
        title,
        category: cat,
        sourceName,
        imageUrl,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        readAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 2. Record interaction in UserNewsInteraction & update article viewsCount if valid ObjectId
    if (mongoose.isValidObjectId(articleId)) {
      UserNewsInteraction.create({
        ...userQuery,
        articleId,
        category: cat,
        eventType: 'open'
      }).catch((err) => logger.warn('Interaction record error:', err.message));

      NewsArticle.findByIdAndUpdate(articleId, { $inc: { viewsCount: 1 } })
        .catch((err) => logger.warn('Article viewsCount update error:', err.message));
    }

    // 3. Update UserInterestProfile
    let profile = await UserInterestProfile.findOne(userQuery);
    if (!profile) {
      profile = new UserInterestProfile({
        ...userQuery,
        categoryScores: new Map<string, number>(),
        topicScores: new Map<string, number>(),
        categoryCounts: new Map<string, number>(),
        clickCount: 0,
        totalRead: 0
      });
    }

    profile.clickCount = (profile.clickCount || 0) + 1;
    profile.lastReadAt = new Date();

    const currentCatCounts = profile.categoryCounts || new Map<string, number>();
    const count = (currentCatCounts.get(cat) || 0) + 1;
    currentCatCounts.set(cat, count);
    profile.categoryCounts = currentCatCounts;

    // Trigger Recommendation Scoring update
    scoringService
      .processInteraction({
        userId: userQuery.userId?.toString(),
        anonymousUserId: userQuery.anonymousUserId,
        category: cat,
        eventType: 'open'
      })
      .catch((err) => logger.warn('Scoring service error:', err.message));

    await profile.save();

    // 4. Compute user profile analytics
    const userAnalytics = await computeUserAnalytics(userQuery, profile.clickCount);
    const shouldTriggerAd = profile.clickCount > 0 && profile.clickCount % AD_TRIGGER_INTERVAL === 0;

    res.status(201).json({
      success: true,
      message: 'Read event tracked successfully in backend',
      data: {
        profile: userAnalytics,
        shouldTriggerAd,
        clickCount: profile.clickCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's interest analytics and profile
 */
export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userQuery = getUserQuery(req);
    const profile = await UserInterestProfile.findOne(userQuery);
    const clickCount = profile ? (profile.clickCount || 0) : 0;
    const userAnalytics = await computeUserAnalytics(userQuery, clickCount);

    res.json({
      success: true,
      data: userAnalytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's Old Feed (reading history list) from MongoDB
 */
export const getOldFeed = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userQuery = getUserQuery(req);
    const limit = Math.min(100, parseInt(req.query.limit as string, 10) || 50);

    const oldFeed = await UserReadHistory.find(userQuery)
      .sort({ readAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: {
        oldFeed,
        total: oldFeed.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear user's reading history (Old Feed) and reset profile
 */
export const clearOldFeed = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userQuery = getUserQuery(req);

    await UserReadHistory.deleteMany(userQuery);
    await UserInterestProfile.findOneAndUpdate(
      userQuery,
      {
        clickCount: 0,
        totalRead: 0,
        categoryCounts: new Map<string, number>(),
        categoryScores: new Map<string, number>()
      }
    );

    res.json({
      success: true,
      message: 'Reading history and interest analytics cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};
