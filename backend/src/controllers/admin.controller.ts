import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import NewsArticle from '../models/NewsArticle';
import UserNewsInteraction from '../models/UserNewsInteraction';
import UserInterestProfile from '../models/UserInterestProfile';
import UserReadHistory from '../models/UserReadHistory';
import AdInteraction from '../models/AdInteraction';
import AppConfiguration from '../models/AppConfiguration';
import { newsService } from '../services/news/news.service';
import { AppError } from '../middlewares/errorMiddleware';

export const refreshNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await newsService.ingestNews();
    res.json({
      success: true,
      message: 'Manual news refresh triggered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalUsers,
      totalNews,
      totalViews,
      adImpressions,
      adClicks,
      popularCategories,
      mostReadArticles,
      totalUserReads,
      userCategoryInterests
    ] = await Promise.all([
      User.countDocuments(),
      NewsArticle.countDocuments({ isDeleted: false }),
      UserNewsInteraction.countDocuments({ eventType: { $in: ['view', 'open', 'read_complete'] } }),
      AdInteraction.countDocuments({ eventType: 'impression' }),
      AdInteraction.countDocuments({ eventType: 'click' }),
      NewsArticle.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalViews: { $sum: '$viewsCount' } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      NewsArticle.find({ isDeleted: false })
        .sort({ viewsCount: -1, likesCount: -1 })
        .limit(5)
        .select('title category viewsCount likesCount publishedAt sourceName'),
      UserReadHistory.countDocuments(),
      UserReadHistory.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ])
    ]);

    const adCTR = adImpressions > 0 ? parseFloat(((adClicks / adImpressions) * 100).toFixed(2)) : 0;

    res.json({
      success: true,
      message: 'Admin analytics metrics',
      data: {
        totalUsers,
        totalNews,
        totalViews: totalViews + totalUserReads,
        totalUserReads,
        adImpressions,
        adClicks,
        adCTR,
        popularCategories,
        userCategoryInterests,
        mostReadArticles,
        providerHealth: [
          { name: 'NewsAPIProvider', status: 'Healthy', lastSync: new Date().toISOString() },
          { name: 'GoogleNewsRSSProvider', status: 'Healthy', lastSync: new Date().toISOString() },
          { name: 'MockNewsProvider', status: 'Healthy', lastSync: new Date().toISOString() }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserInterestsDistribution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profiles = await UserInterestProfile.find().limit(500);
    const categoryTotals: Record<string, { totalScore: number; count: number }> = {};

    profiles.forEach((p) => {
      if (p.categoryScores) {
        p.categoryScores.forEach((score, cat) => {
          if (!categoryTotals[cat]) categoryTotals[cat] = { totalScore: 0, count: 0 };
          categoryTotals[cat].totalScore += score;
          categoryTotals[cat].count += 1;
        });
      }
    });

    const averages = Object.keys(categoryTotals).map((cat) => ({
      category: cat,
      averageScore: Math.round(categoryTotals[cat].totalScore / categoryTotals[cat].count),
      activeUsersCount: categoryTotals[cat].count
    }));

    res.json({
      success: true,
      message: 'User interests distribution',
      data: { distribution: averages }
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const result = await newsService.getLatestNews(page, limit);
    res.json({
      success: true,
      message: 'Admin news list retrieved',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const updateNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await NewsArticle.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) throw new AppError('Article not found', 404);
    res.json({
      success: true,
      message: 'Article updated',
      data: { article: updated }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await NewsArticle.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!deleted) throw new AppError('Article not found', 404);
    res.json({
      success: true,
      message: 'Article soft-deleted',
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let configDoc = await AppConfiguration.findOne({ key: 'global_config' });
    if (!configDoc) {
      configDoc = new AppConfiguration({ key: 'global_config' });
    }

    if (req.body.adFrequency !== undefined) {
      configDoc.adFrequency = req.body.adFrequency;
    }
    if (req.body.recommendationWeights) {
      configDoc.recommendationWeights = {
        ...configDoc.recommendationWeights,
        ...req.body.recommendationWeights
      };
    }

    await configDoc.save();
    res.json({
      success: true,
      message: 'Global application configuration updated',
      data: { config: configDoc }
    });
  } catch (error) {
    next(error);
  }
};
