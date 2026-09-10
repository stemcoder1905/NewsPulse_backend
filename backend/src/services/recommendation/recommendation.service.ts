import NewsArticle, { INewsArticle } from '../../models/NewsArticle';
import User from '../../models/User';
import AppConfiguration from '../../models/AppConfiguration';
import { scoringService } from './scoring.service';
import { config } from '../../config';
import logger from '../../utils/logger';

export interface FeedResponseItem {
  type: 'article' | 'ad';
  data: any;
  recommendationReason?: string[];
}

export class RecommendationService {
  /**
   * Generates a personalized news feed with multi-factor scoring & explainability
   */
  async generatePersonalizedFeed(
    userId?: string,
    anonymousUserId?: string,
    limit: number = 20,
    cursor?: string
  ): Promise<{ items: any[]; nextCursor?: string; recommendedCategories: string[] }> {
    // Fetch weights from app config or fallback to config file
    let weights = config.recommendationWeights;
    try {
      const appConf = await AppConfiguration.findOne({ key: 'global_config' });
      if (appConf?.recommendationWeights) {
        weights = appConf.recommendationWeights;
      }
    } catch (e) {
      logger.warn('Failed to load DB app config, using defaults.');
    }

    // Get user preferences and interest scores
    let preferredCategories: string[] = [];
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        preferredCategories = user.preferredCategories || [];
      }
    }

    const categoryInterestScores = await scoringService.getDecayedCategoryScores(userId, anonymousUserId);

    // Fetch candidate articles published recently
    const query: any = { isDeleted: false };
    if (cursor) {
      query.publishedAt = { $lt: new Date(cursor) };
    }

    const candidateArticles = await NewsArticle.find(query)
      .sort({ publishedAt: -1 })
      .limit(100)
      .exec();

    if (candidateArticles.length === 0) {
      return { items: [], recommendedCategories: preferredCategories };
    }

    // Rank candidate articles using multi-factor scoring
    const now = Date.now();

    const scoredArticles = candidateArticles.map((art) => {
      const cat = art.category.toLowerCase();

      // 1. User Interest Score (0 - 100)
      const interestVal = categoryInterestScores[cat] !== undefined ? categoryInterestScores[cat] : 50;
      const normInterest = interestVal / 100;

      // 2. Freshness Score (exponential decay based on age in hours)
      const ageInHours = Math.max(0, (now - art.publishedAt.getTime()) / (1000 * 60 * 60));
      const normFreshness = Math.exp(-0.05 * ageInHours); // Half-life ~14 hours

      // 3. Engagement Score (likes, bookmarks, views)
      const rawEngagement = art.likesCount * 5 + art.bookmarksCount * 8 + art.sharesCount * 10 + art.viewsCount * 0.5;
      const normEngagement = Math.min(1.0, rawEngagement / 100);

      // 4. Category Preference Score (from onboarding selection)
      const normPreference = preferredCategories.includes(cat) ? 1.0 : 0.2;

      // 5. Diversity Score (bonus to avoid showing only top category)
      const normDiversity = 0.5; // Baseline diversity

      const finalScore =
        normInterest * weights.interest +
        normFreshness * weights.freshness +
        normEngagement * weights.engagement +
        normPreference * weights.preference +
        normDiversity * weights.diversity;

      return {
        article: art,
        finalScore,
        category: cat,
        interestVal,
        isPreferred: preferredCategories.includes(cat)
      };
    });

    // Sort by finalScore descending
    scoredArticles.sort((a, b) => b.finalScore - a.finalScore);

    // Diversity Enforcement: Ensure max 3 consecutive articles from the same category
    const diversified: any[] = [];
    const categoryCount: Record<string, number> = {};

    for (const item of scoredArticles) {
      const cat = item.category;
      const currentCount = categoryCount[cat] || 0;
      if (currentCount < 4) {
        diversified.push(item);
        categoryCount[cat] = currentCount + 1;
      }
      if (diversified.length >= limit) break;
    }

    const finalArticles = (diversified.length >= limit ? diversified : scoredArticles).slice(0, limit);

    const items = finalArticles.map((item) => {
      const artObj = item.article.toObject();
      const reasons: string[] = [];

      if (item.interestVal > 60) {
        reasons.push(`You frequently interact with ${artObj.category.toUpperCase()} news`);
      }
      if (item.isPreferred) {
        reasons.push(`Matched your onboarding interest in ${artObj.category.toUpperCase()}`);
      }
      if (item.article.likesCount > 5 || item.article.sharesCount > 3) {
        reasons.push(`Trending among NewsPulse readers`);
      }
      if (reasons.length === 0) {
        reasons.push(`Fresh headline from ${artObj.sourceName}`);
      }

      return {
        type: 'article',
        data: artObj,
        recommendationReasons: reasons
      };
    });

    // Get top recommended categories for user
    const sortedCategories = Object.keys(categoryInterestScores).sort(
      (a, b) => categoryInterestScores[b] - categoryInterestScores[a]
    );

    const nextCursor = finalArticles.length > 0 ? finalArticles[finalArticles.length - 1].article.publishedAt.toISOString() : undefined;

    return {
      items,
      nextCursor,
      recommendedCategories: sortedCategories.slice(0, 5)
    };
  }

  /**
   * Explains why an article was recommended to a specific user
   */
  async explainRecommendation(articleId: string, userId?: string, anonymousUserId?: string): Promise<string[]> {
    const article = await NewsArticle.findById(articleId);
    if (!article) return ['Article not found'];

    const catScores = await scoringService.getDecayedCategoryScores(userId, anonymousUserId);
    const cat = article.category.toLowerCase();
    const score = catScores[cat] || 50;

    const reasons: string[] = [];
    if (score > 60) {
      reasons.push(`You have a high interest score of ${score}/100 in ${article.category.toUpperCase()} news.`);
    }

    if (userId) {
      const user = await User.findById(userId);
      if (user?.preferredCategories?.includes(cat)) {
        reasons.push(`You selected ${article.category.toUpperCase()} during your account onboarding.`);
      }
    }

    if (article.likesCount > 10 || article.viewsCount > 50) {
      reasons.push(`This story is currently trending on NewsPulse with high reader engagement.`);
    }

    if (reasons.length === 0) {
      reasons.push(`Recent breaking story from ${article.sourceName}.`);
    }

    return reasons;
  }
}

export const recommendationService = new RecommendationService();
