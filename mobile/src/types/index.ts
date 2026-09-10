export interface NewsArticle {
  _id: string;
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
  publishedAt: string;
  category: string;
  tags: string[];
  likesCount?: number;
  bookmarksCount?: number;
  viewsCount?: number;
}

export interface AdItem {
  adId: string;
  campaignId?: string;
  title: string;
  sponsorName: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  callToAction: string;
  categoryTag: string;
  isSponsored: true;
}

export interface FeedItem {
  type: 'article' | 'ad';
  data: NewsArticle | AdItem;
  recommendationReasons?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  preferredCategories: string[];
  onboardingCompleted: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}
