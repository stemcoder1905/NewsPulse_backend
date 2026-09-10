import crypto from 'crypto';
import NewsArticle, { INewsArticle } from '../../models/NewsArticle';
import Category from '../../models/Category';
import { NewsProvider, NormalizedArticle } from './providers/newsProvider.interface';
import { NewsAPIProvider } from './providers/NewsAPIProvider';
import { GoogleNewsRSSProvider } from './providers/GoogleNewsRSSProvider';
import { MediastackProvider } from './providers/MediastackProvider';
import { MockNewsProvider } from './providers/MockNewsProvider';
import { cacheService } from '../../config/redis';
import logger from '../../utils/logger';

export class NewsService {
  private providers: NewsProvider[];
  private mockProvider: MockNewsProvider;
  private mediastackProvider: MediastackProvider;

  constructor() {
    this.mockProvider = new MockNewsProvider();
    this.mediastackProvider = new MediastackProvider();
    this.providers = [
      this.mediastackProvider,
      new NewsAPIProvider(),
      new GoogleNewsRSSProvider(),
      this.mockProvider
    ];
  }

  getMediastackProvider(): MediastackProvider {
    return this.mediastackProvider;
  }

  private generateShortSummary(title: string, rawSummary?: string, content?: string): string {
    const candidateText = rawSummary && rawSummary.length > 50 ? rawSummary : (content && content.length > 50 ? content : title);
    const cleaned = candidateText.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    if (cleaned.length <= 280) {
      return cleaned;
    }
    const truncated = cleaned.slice(0, 277);
    const lastPeriod = truncated.lastIndexOf('.');
    if (lastPeriod > 150) {
      return truncated.slice(0, lastPeriod + 1);
    }
    return `${truncated}...`;
  }

  async ingestNews(): Promise<{ fetched: number; inserted: number; duplicates: number }> {
    logger.info('Starting News Ingestion Pipeline...');
    let totalFetched = 0;
    let totalInserted = 0;
    let totalDuplicates = 0;

    const categories = ['general', 'technology', 'ai', 'sports', 'cricket', 'business', 'health', 'science', 'education', 'environment', 'entertainment', 'india', 'world', 'politics'];

    for (const provider of this.providers) {
      try {
        for (const cat of categories) {
          const rawArticles = await provider.fetchNewsByCategory(cat);
          totalFetched += rawArticles.length;

          for (const raw of rawArticles) {
            try {
              const existingByUrl = await NewsArticle.findOne({ articleUrl: raw.articleUrl });
              if (existingByUrl) {
                totalDuplicates++;
                continue;
              }

              const shortSummary = this.generateShortSummary(raw.title, raw.shortSummary, raw.content);

              await NewsArticle.create({
                externalId: raw.externalId,
                title: raw.title,
                shortSummary,
                description: raw.description || shortSummary,
                content: raw.content || shortSummary,
                sourceName: raw.sourceName,
                sourceUrl: raw.sourceUrl,
                articleUrl: raw.articleUrl,
                imageUrl: raw.imageUrl,
                author: raw.author || 'NewsPulse Desk',
                publishedAt: raw.publishedAt,
                category: raw.category.toLowerCase(),
                tags: raw.tags || [raw.category.toLowerCase()],
                language: raw.language || 'en',
                country: raw.country || 'in',
                provider: provider.name
              });
              totalInserted++;
            } catch (err) {
              totalDuplicates++;
            }
          }
        }
      } catch (err: any) {
        logger.error(`Error in ingestion for provider ${provider.name}: ${err.message}`);
      }
    }

    logger.info(`Ingestion Complete: Fetched=${totalFetched}, Inserted=${totalInserted}, Duplicates=${totalDuplicates}`);
    await cacheService.delPattern('news:*');
    await cacheService.delPattern('feed:*');

    return { fetched: totalFetched, inserted: totalInserted, duplicates: totalDuplicates };
  }

  async getLatestNews(page: number = 1, limit: number = 20): Promise<{ articles: any[]; total: number }> {
    const cacheKey = `news:latest:${page}:${limit}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const skip = (page - 1) * limit;
      const [articles, total] = await Promise.all([
        NewsArticle.find({ isDeleted: false })
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        NewsArticle.countDocuments({ isDeleted: false })
      ]);

      if (articles && articles.length > 0) {
        const result = { articles, total };
        await cacheService.set(cacheKey, JSON.stringify(result), 180);
        return result;
      }
    } catch (e) {
      logger.warn('DB query failed in getLatestNews, using fallback mock articles.');
    }

    const mockArticles = await this.mockProvider.fetchTopHeadlines('general');
    return { articles: mockArticles, total: mockArticles.length };
  }

  async getNewsByCategory(category: string, page: number = 1, limit: number = 20): Promise<{ articles: any[]; total: number }> {
    const cat = category.toLowerCase();
    const cacheKey = `news:category:${cat}:${page}:${limit}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const skip = (page - 1) * limit;
      const query = { category: cat, isDeleted: false };
      const [articles, total] = await Promise.all([
        NewsArticle.find(query)
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        NewsArticle.countDocuments(query)
      ]);

      if (articles && articles.length > 0) {
        const result = { articles, total };
        await cacheService.set(cacheKey, JSON.stringify(result), 180);
        return result;
      }
    } catch (e) {
      logger.warn(`DB query failed for category ${category}, using fallback mock articles.`);
    }

    const mockArticles = await this.mockProvider.fetchNewsByCategory(cat);
    return { articles: mockArticles, total: mockArticles.length };
  }

  async searchNews(q: string, page: number = 1, limit: number = 20): Promise<{ articles: any[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const query = {
        isDeleted: false,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { shortSummary: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ]
      };

      const [articles, total] = await Promise.all([
        NewsArticle.find(query)
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        NewsArticle.countDocuments(query)
      ]);

      if (articles && articles.length > 0) {
        return { articles, total };
      }
    } catch (e) {
      logger.warn(`DB query failed for search '${q}', using fallback mock search.`);
    }

    const mockArticles = await this.mockProvider.searchNews(q);
    return { articles: mockArticles, total: mockArticles.length };
  }

  async getTrendingNews(limit: number = 10): Promise<any[]> {
    try {
      const articles = await NewsArticle.aggregate([
        { $match: { isDeleted: false } },
        {
          $addFields: {
            trendingScore: {
              $add: [
                { $multiply: ['$likesCount', 5] },
                { $multiply: ['$sharesCount', 8] },
                { $multiply: ['$bookmarksCount', 10] },
                '$viewsCount'
              ]
            }
          }
        },
        { $sort: { trendingScore: -1, publishedAt: -1 } },
        { $limit: limit }
      ]);

      if (articles && articles.length > 0) return articles;
    } catch (e) {
      logger.warn('DB query failed for getTrendingNews, using fallback mock articles.');
    }

    return this.mockProvider.fetchTopHeadlines('general');
  }

  async getArticleById(id: string): Promise<any | null> {
    try {
      const article = await NewsArticle.findById(id);
      if (article) return article;
    } catch (e) {}

    const mockArticles = await this.mockProvider.fetchTopHeadlines('general');
    return mockArticles[0] || null;
  }
}

export const newsService = new NewsService();
