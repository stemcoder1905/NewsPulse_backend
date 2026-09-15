import axios from 'axios';

// Persistent client/guest session ID
export function getClientAnonymousId(): string {
  let id = localStorage.getItem('np_user_client_id');
  if (!id) {
    id = `client_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem('np_user_client_id', id);
  }
  return id;
}

const envApiUrl = (import.meta as any).env?.VITE_API_URL;
const apiBase = envApiUrl ? `${envApiUrl.replace(/\/$/, '')}/api/v1` : '/api/v1';

const api = axios.create({
  baseURL: apiBase,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token & persistent x-anonymous-id header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('np_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-anonymous-id'] = getClientAnonymousId();
  return config;
});

// Types
export interface Article {
  _id: string;
  title: string;
  shortSummary: string;
  description: string;
  content?: string;
  sourceName: string;
  sourceUrl: string;
  articleUrl: string;
  imageUrl: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  provider: string;
  viewsCount: number;
  likesCount: number;
}

export interface PaginatedNews {
  articles: Article[];
  total: number;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: { _id: string; name: string; email: string; interests: string[] };
}

export interface ReadArticleRecord extends Article {
  readAt: string;
}

export interface CategoryInterestStat {
  category: string;
  count: number;
  percentage: number;
}

export interface UserInterestProfile {
  totalRead: number;
  clickCount: number;
  clicksUntilNextAd: number;
  topCategory: string | null;
  secondaryCategory: string | null;
  categoryStats: CategoryInterestStat[];
}

export interface TrackReadResponse {
  profile: UserInterestProfile;
  shouldTriggerAd: boolean;
  clickCount: number;
}

// ── Auth ──────────────────────────────────────────────────────────
export const register = (name: string, email: string, password: string) =>
  api.post<{ success: boolean; data: AuthResponse }>('/auth/register', { name, email, password });

export const login = (email: string, password: string) =>
  api.post<{ success: boolean; data: AuthResponse }>('/auth/login', { email, password });

// ── News ──────────────────────────────────────────────────────────
export const fetchLatestNews = (page = 1, limit = 20) =>
  api.get<{ success: boolean; data: PaginatedNews }>(`/news?page=${page}&limit=${limit}`);

export const fetchByCategory = (category: string, page = 1, limit = 20) =>
  api.get<{ success: boolean; data: PaginatedNews }>(`/news/category/${category}?page=${page}&limit=${limit}`);

export const fetchTrending = (limit = 10) =>
  api.get<{ success: boolean; data: { articles: Article[] } }>(`/news/trending?limit=${limit}`);

export const searchNews = (q: string, page = 1) =>
  api.get<{ success: boolean; data: PaginatedNews }>(`/news/search?q=${encodeURIComponent(q)}&page=${page}`);

export const fetchArticle = (id: string) =>
  api.get<{ success: boolean; data: { article: Article } }>(`/news/${id}`);

// ── Backend Analytics & Old Feed ────────────────────────────────────
export const trackReadArticle = (article: Article) =>
  api.post<{ success: boolean; data: TrackReadResponse }>('/analytics/track-read', {
    articleId: article._id,
    articleUrl: article.articleUrl,
    title: article.title,
    category: article.category,
    sourceName: article.sourceName,
    imageUrl: article.imageUrl,
    publishedAt: article.publishedAt
  });

export const fetchUserAnalytics = () =>
  api.get<{ success: boolean; data: UserInterestProfile }>('/analytics/user-profile');

export const fetchOldFeed = (limit = 50) =>
  api.get<{ success: boolean; data: { oldFeed: ReadArticleRecord[]; total: number } }>(`/analytics/old-feed?limit=${limit}`);

export const clearOldFeedHistory = () =>
  api.delete<{ success: boolean; message: string }>('/analytics/old-feed');

export default api;
