import axios from 'axios';
import crypto from 'crypto';
import { NewsProvider, NormalizedArticle } from './newsProvider.interface';
import { config } from '../../../config';
import logger from '../../../utils/logger';

export interface MediastackOptions {
  countries?: string;
  categories?: string;
  languages?: string;
  keywords?: string;
  sources?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  date?: string;
}

export class MediastackProvider implements NewsProvider {
  name = 'mediastack';
  private apiKey: string;
  private primaryUrl = 'http://api.mediastack.com/v1/news';
  private fallbackUrl = 'https://api.mediastack.com/v1/news';

  constructor() {
    this.apiKey = config.newsApi.mediastackApiKey;
  }

  isConfigured(): boolean {
    return Boolean(
      this.apiKey &&
        this.apiKey !== 'MY_MEDIASTACK_KEY' &&
        this.apiKey !== 'your_mediastack_api_key_here'
    );
  }

  /**
   * Direct fetch from Mediastack API with full parameter support
   */
  async fetchNews(options: MediastackOptions = {}): Promise<NormalizedArticle[]> {
    if (!this.isConfigured()) {
      logger.info('Mediastack API key not provided or invalid. Skipping MediastackProvider request.');
      return [];
    }

    const params: any = {
      access_key: this.apiKey,
      countries: options.countries || 'in',
      languages: options.languages || 'en',
      limit: Math.min(options.limit || 25, 100),
      offset: options.offset || 0,
      sort: options.sort || 'published_desc'
    };

    if (options.categories) params.categories = options.categories;
    if (options.keywords) params.keywords = options.keywords;
    if (options.sources) params.sources = options.sources;
    if (options.date) params.date = options.date;

    try {
      let response;
      try {
        response = await axios.get(this.primaryUrl, { params, timeout: 8000 });
      } catch (httpErr: any) {
        // Retry with HTTPS if HTTP fails
        response = await axios.get(this.fallbackUrl, { params, timeout: 8000 });
      }

      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data.map((article: any) =>
          this.normalize(article, options.categories || 'general')
        );
      }

      if (response.data?.error) {
        logger.warn(`Mediastack API Error: ${response.data.error.code} - ${response.data.error.message}`);
      }

      return [];
    } catch (error: any) {
      // Security: Sanitized log to avoid exposing API key in logs
      const safeMessage = error.message ? error.message.replace(this.apiKey, '[REDACTED_API_KEY]') : 'Unknown error';
      logger.error(`MediastackProvider fetch error: ${safeMessage}`);
      return [];
    }
  }

  async fetchTopHeadlines(category: string = 'general'): Promise<NormalizedArticle[]> {
    const mapped = this.mapCategoryToMediastackOptions(category);
    return this.fetchNews(mapped);
  }

  async fetchNewsByCategory(category: string): Promise<NormalizedArticle[]> {
    return this.fetchTopHeadlines(category);
  }

  async searchNews(query: string): Promise<NormalizedArticle[]> {
    return this.fetchNews({
      keywords: query,
      countries: 'in',
      limit: 25
    });
  }

  async fetchLatestNews(): Promise<NormalizedArticle[]> {
    return this.fetchNews({
      countries: 'in',
      sort: 'published_desc',
      limit: 25
    });
  }

  /**
   * Maps NewsPulse categories to Mediastack supported categories / keywords
   */
  private mapCategoryToMediastackOptions(category: string): MediastackOptions {
    const catLower = category.toLowerCase().trim();

    // Native Mediastack categories: general, business, entertainment, health, science, sports, technology
    const nativeCategories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];

    if (nativeCategories.includes(catLower)) {
      return { categories: catLower, countries: 'in' };
    }

    // Keyword & query mapping for non-native categories
    const map: Record<string, MediastackOptions> = {
      cricket: { categories: 'sports', keywords: 'cricket', countries: 'in' },
      ai: { categories: 'technology', keywords: 'artificial intelligence OR AI', countries: 'in' },
      politics: { keywords: 'politics', countries: 'in' },
      crime: { keywords: 'crime', countries: 'in' },
      education: { keywords: 'education', countries: 'in' },
      environment: { keywords: 'climate OR environment', countries: 'in' },
      lifestyle: { keywords: 'lifestyle', countries: 'in' },
      india: { countries: 'in' },
      world: { keywords: 'world OR global' },
      'breaking news': { sort: 'published_desc', countries: 'in' }
    };

    return map[catLower] || { categories: 'general', keywords: catLower, countries: 'in' };
  }

  /**
   * Converts Mediastack raw article into NewsPulse NormalizedArticle
   */
  private normalize(article: any, defaultCategory: string): NormalizedArticle {
    const articleUrl = article.url || `https://mediastack.com/article/${Date.now()}`;
    const title = article.title || 'Untitled Story';
    const publishedAt = article.published_at ? new Date(article.published_at) : new Date();

    // Deterministic externalId generation: SHA-256 hash of URL + title + published_at
    const hashContent = `${articleUrl}_${title.toLowerCase()}_${publishedAt.toISOString()}`;
    const externalId = `ms_${crypto.createHash('sha256').update(hashContent).digest('hex').substring(0, 16)}`;

    const rawSummary = article.description || article.title || '';
    const cleanSummary = rawSummary.replace(/<[^>]*>?/gm, '').trim();

    return {
      externalId,
      title,
      shortSummary: cleanSummary.slice(0, 300),
      description: cleanSummary,
      content: cleanSummary,
      sourceName: article.source || 'Mediastack News',
      sourceUrl: article.url,
      articleUrl,
      imageUrl: article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
      author: article.author || article.source || 'NewsPulse Desk',
      publishedAt,
      category: article.category ? article.category.toLowerCase() : defaultCategory.toLowerCase(),
      tags: [article.category || defaultCategory, 'mediastack'],
      language: article.language || 'en',
      country: article.country || 'in',
      provider: this.name
    };
  }
}
