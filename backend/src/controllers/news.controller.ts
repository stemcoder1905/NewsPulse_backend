import { Response, NextFunction } from 'express';
import { newsService } from '../services/news/news.service';
import { recommendationService } from '../services/recommendation/recommendation.service';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AppError } from '../middlewares/errorMiddleware';

export const getNews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const category = req.query.category as string | undefined;

    let result;
    if (category) {
      result = await newsService.getNewsByCategory(category, page, limit);
    } else {
      result = await newsService.getLatestNews(page, limit);
    }

    res.json({
      success: true,
      message: 'News retrieved',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getNewsById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const article = await newsService.getArticleById(id);
    if (!article) {
      throw new AppError('Article not found', 404);
    }
    res.json({
      success: true,
      message: 'Article retrieved',
      data: { article }
    });
  } catch (error) {
    next(error);
  }
};

export const getNewsByCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = req.params.category as string;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const result = await newsService.getNewsByCategory(category, page, limit);
    res.json({
      success: true,
      message: `News for category ${category} retrieved`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const searchNews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = ((req.query.q as string) || (req.query.keywords as string) || '').trim();
    if (!q) {
      res.json({ success: true, message: 'Empty query', data: { articles: [], total: 0 } });
      return;
    }
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const result = await newsService.searchNews(q, page, limit);
    res.json({
      success: true,
      message: 'Search results retrieved',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getTrendingNews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const articles = await newsService.getTrendingNews(limit);
    res.json({
      success: true,
      message: 'Trending news retrieved',
      data: { articles }
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestNews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const result = await newsService.getLatestNews(1, limit);
    res.json({
      success: true,
      message: 'Latest news retrieved',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const testMediastack = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = newsService.getMediastackProvider();
    const isConfigured = provider.isConfigured();

    if (!isConfigured) {
      res.status(400).json({
        success: false,
        message: 'MEDIASTACK_API_KEY is not configured in backend environment variables (.env)',
        data: { configured: false }
      });
      return;
    }

    const articles = await provider.fetchNews({ limit: 5, countries: 'in' });

    res.json({
      success: true,
      message: 'Mediastack test request executed successfully',
      data: {
        configured: true,
        count: articles.length,
        articles
      }
    });
  } catch (error) {
    next(new AppError('News provider temporarily unavailable', 503));
  }
};

export const explainRecommendation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user ? req.user._id.toString() : undefined;
    const anonymousUserId = req.anonymousUserId;

    const reasons = await recommendationService.explainRecommendation(id, userId, anonymousUserId);
    res.json({
      success: true,
      message: 'Recommendation explanation retrieved',
      data: {
        articleId: id,
        reasons
      }
    });
  } catch (error) {
    next(error);
  }
};

// @ts-ignore
import { JSDOM } from 'jsdom';
// @ts-ignore
import { Readability } from '@mozilla/readability';
import axios from 'axios';
import logger from '../utils/logger';

export const proxyArticle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let targetUrl = req.query.url as string;
  if (!targetUrl) {
    res.status(400).send('URL is required');
    return;
  }

  try {
    const headers = { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };

    // 1. Fetch initial HTML
    let response = await axios.get(targetUrl, { headers, maxRedirects: 5, validateStatus: () => true });
    
    // If it's still 400+, just return the fallback
    if (response.status >= 400) {
      throw new Error(`External site returned status ${response.status}`);
    }

    let html = response.data;

    // 2. Resolve Meta Refresh Redirects (Google News uses this)
    const metaRefreshMatch = html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^;]+;\s*url=([^"']+)["']/i);
    if (metaRefreshMatch && metaRefreshMatch[1]) {
      let redirectUrl = metaRefreshMatch[1].replace(/&amp;/g, '&');
      if (!redirectUrl.startsWith('http')) {
        redirectUrl = new URL(redirectUrl, targetUrl).toString();
      }
      targetUrl = redirectUrl;
      // Fetch the real article
      response = await axios.get(targetUrl, { headers, maxRedirects: 5, validateStatus: () => true });
      html = response.data;
    }

    // 3. Use Readability to extract clean article content
    const doc = new JSDOM(html, { url: targetUrl });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article || !article.content) {
      res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 40px; color: #fff; background: #0f172a; height: 100vh;">
          <h2>Article could not be extracted cleanly.</h2>
          <a href="${targetUrl}" target="_parent" style="color: #34d399; text-decoration: none; font-size: 18px;">Click here to read the original article</a>
        </div>
      `);
      return;
    }

    // 4. Return clean, styled HTML for the iframe
    const cleanHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <base href="${targetUrl}">
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; line-height: 1.7; color: #cbd5e1; background-color: #0f172a; padding: 24px; max-width: 800px; margin: 0 auto; overflow-x: hidden; }
          h1, h2, h3, h4 { color: #f8fafc; margin-top: 1.5em; margin-bottom: 0.5em; }
          h1 { font-size: 2rem; line-height: 1.2; margin-top: 0; }
          a { color: #34d399; text-decoration: none; }
          a:hover { text-decoration: underline; }
          img { max-width: 100%; height: auto; border-radius: 12px; margin: 24px 0; display: block; }
          figure { margin: 0; }
          figcaption { font-size: 0.875rem; color: #94a3b8; margin-top: 8px; text-align: center; }
          blockquote { border-left: 4px solid #34d399; margin: 24px 0; padding-left: 20px; font-style: italic; color: #94a3b8; }
          p { margin-bottom: 1.5em; font-size: 1.125rem; }
          ul, ol { margin-bottom: 1.5em; font-size: 1.125rem; padding-left: 24px; }
          li { margin-bottom: 0.5em; }
        </style>
      </head>
      <body>
        <h1>${article.title}</h1>
        ${article.content}
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(cleanHtml);
  } catch (error: any) {
    logger.error(`Proxy/Extraction failed for ${targetUrl}: ${error.message}`);
    res.status(500).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 40px; color: #fff; background: #0f172a; height: 100vh;">
        <h2>Failed to load article content.</h2>
        <p>${error.message}</p>
        <a href="${targetUrl}" target="_parent" style="color: #34d399; text-decoration: none; font-size: 18px;">Click here to read the original article</a>
      </div>
    `);
  }
};
