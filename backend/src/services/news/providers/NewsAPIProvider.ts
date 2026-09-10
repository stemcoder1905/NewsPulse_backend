import axios from 'axios';
import { NewsProvider, NormalizedArticle } from './newsProvider.interface';
import { config } from '../../../config';
import logger from '../../../utils/logger';

export class NewsAPIProvider implements NewsProvider {
  name = 'newsapi';
  private apiKey: string;
  private baseUrl = 'https://newsapi.org/v2';

  constructor() {
    this.apiKey = config.newsApi.newsApiKey;
  }

  private isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'your_news_api_key_here');
  }

  async fetchTopHeadlines(category: string = 'general'): Promise<NormalizedArticle[]> {
    if (!this.isConfigured()) {
      logger.info('NewsAPI key not provided. Skipping NewsAPIProvider fetchTopHeadlines.');
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/top-headlines`, {
        params: {
          apiKey: this.apiKey,
          country: 'in',
          category: category.toLowerCase() === 'general' ? undefined : category.toLowerCase()
        }
      });

      return (response.data.articles || []).map((art: any) => this.normalize(art, category));
    } catch (error: any) {
      logger.error(`NewsAPI fetchTopHeadlines error: ${error.message}`);
      return [];
    }
  }

  async fetchNewsByCategory(category: string): Promise<NormalizedArticle[]> {
    return this.fetchTopHeadlines(category);
  }

  async searchNews(query: string): Promise<NormalizedArticle[]> {
    if (!this.isConfigured()) return [];

    try {
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          apiKey: this.apiKey,
          q: query,
          sortBy: 'publishedAt',
          pageSize: 20
        }
      });

      return (response.data.articles || []).map((art: any) => this.normalize(art, 'general'));
    } catch (error: any) {
      logger.error(`NewsAPI searchNews error: ${error.message}`);
      return [];
    }
  }

  async fetchLatestNews(): Promise<NormalizedArticle[]> {
    return this.fetchTopHeadlines('general');
  }

  private normalize(article: any, defaultCategory: string): NormalizedArticle {
    const rawContent = article.content || article.description || article.title;
    const cleanSummary = rawContent.replace(/\[\+\d+ chars\]/g, '').trim();

    return {
      externalId: article.url || `newsapi_${Date.now()}_${Math.random()}`,
      title: article.title || 'Untitled Article',
      shortSummary: cleanSummary.slice(0, 300),
      description: article.description || '',
      content: article.content || article.description || '',
      sourceName: article.source?.name || 'NewsAPI Source',
      sourceUrl: article.url,
      articleUrl: article.url,
      imageUrl: article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
      author: article.author || 'NewsAPI Contributor',
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      category: defaultCategory.toLowerCase(),
      tags: [defaultCategory.toLowerCase(), 'news'],
      language: 'en',
      country: 'in',
      provider: this.name
    };
  }
}
