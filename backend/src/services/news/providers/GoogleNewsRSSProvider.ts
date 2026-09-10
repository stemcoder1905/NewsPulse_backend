import Parser from 'rss-parser';
import { NewsProvider, NormalizedArticle } from './newsProvider.interface';
import logger from '../../../utils/logger';

export class GoogleNewsRSSProvider implements NewsProvider {
  name = 'googlenews';
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['media:content', 'contentSnippet']
      }
    });
  }

  private getRssUrlForCategory(category: string): string {
    const catUpper = category.toUpperCase();
    const map: Record<string, string> = {
      TECHNOLOGY: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-IN&gl=IN&ceid=IN:en',
      BUSINESS: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en',
      SPORTS: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-IN&gl=IN&ceid=IN:en',
      ENTERTAINMENT: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-IN&gl=IN&ceid=IN:en',
      HEALTH: 'https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en-IN&gl=IN&ceid=IN:en',
      SCIENCE: 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-IN&gl=IN&ceid=IN:en'
    };
    return map[catUpper] || `https://news.google.com/rss/search?q=${encodeURIComponent(category)}&hl=en-IN&gl=IN&ceid=IN:en`;
  }

  async fetchTopHeadlines(category: string = 'general'): Promise<NormalizedArticle[]> {
    try {
      const url = this.getRssUrlForCategory(category);
      const feed = await this.parser.parseURL(url);

      return (feed.items || []).slice(0, 15).map((item) => this.normalize(item, category));
    } catch (error: any) {
      logger.warn(`GoogleNewsRSSProvider fetchTopHeadlines error: ${error.message}`);
      return [];
    }
  }

  async fetchNewsByCategory(category: string): Promise<NormalizedArticle[]> {
    return this.fetchTopHeadlines(category);
  }

  async searchNews(query: string): Promise<NormalizedArticle[]> {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
      const feed = await this.parser.parseURL(url);
      return (feed.items || []).slice(0, 15).map((item) => this.normalize(item, 'general'));
    } catch (error: any) {
      logger.warn(`GoogleNewsRSSProvider searchNews error: ${error.message}`);
      return [];
    }
  }

  async fetchLatestNews(): Promise<NormalizedArticle[]> {
    return this.fetchTopHeadlines('general');
  }

  private normalize(item: any, category: string): NormalizedArticle {
    const rawTitle = item.title || 'Google News Headline';
    const parts = rawTitle.split(' - ');
    const sourceName = parts.length > 1 ? parts.pop()?.trim() || 'Google News' : 'Google News';
    const cleanTitle = parts.join(' - ');

    const snippet = item.contentSnippet || item.content || cleanTitle;
    const shortSummary = snippet.replace(/<[^>]*>?/gm, '').trim().slice(0, 300);

    return {
      externalId: item.guid || item.link || `gnews_${Date.now()}_${Math.random()}`,
      title: cleanTitle,
      shortSummary,
      description: shortSummary,
      content: shortSummary,
      sourceName,
      sourceUrl: item.link,
      articleUrl: item.link,
      imageUrl: '',
      author: sourceName,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      category: category.toLowerCase(),
      tags: [category.toLowerCase(), 'gnews'],
      language: 'en',
      country: 'in',
      provider: this.name
    };
  }
}
