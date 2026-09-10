export interface NormalizedArticle {
  externalId: string;
  title: string;
  shortSummary: string;
  description?: string;
  content?: string;
  sourceName: string;
  sourceUrl?: string;
  articleUrl: string;
  imageUrl?: string;
  author?: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  language: string;
  country: string;
  provider: string;
}

export interface NewsProvider {
  name: string;
  fetchTopHeadlines(category?: string): Promise<NormalizedArticle[]>;
  fetchNewsByCategory(category: string): Promise<NormalizedArticle[]>;
  searchNews(query: string): Promise<NormalizedArticle[]>;
  fetchLatestNews(): Promise<NormalizedArticle[]>;
}
