import { Router } from 'express';
import {
  getNews,
  getNewsById,
  getNewsByCategory,
  searchNews,
  getTrendingNews,
  getLatestNews,
  testMediastack,
  explainRecommendation,
  proxyArticle
} from '../controllers/news.controller';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * /api/v1/news:
 *   get:
 *     summary: Retrieve list of latest news articles
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *           default: in
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           default: en
 *       - in: query
 *         name: keywords
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved news list
 */
router.get('/', authenticate, getNews);

/**
 * @openapi
 * /api/v1/news/proxy:
 *   get:
 *     summary: Proxy an external article for iframe embedding
 *     tags: [News]
 */
router.get('/proxy', proxyArticle);

/**
 * @openapi
 * /api/v1/news/test/mediastack:
 *   get:
 *     summary: Test Mediastack API connection
 *     tags: [News]
 *     responses:
 *       200:
 *         description: Controlled Mediastack test request response
 *       400:
 *         description: Missing or unconfigured MEDIASTACK_API_KEY
 */
router.get('/test/mediastack', authenticate, testMediastack);

/**
 * @openapi
 * /api/v1/news/trending:
 *   get:
 *     summary: Get top trending news stories
 *     tags: [News]
 *     responses:
 *       200:
 *         description: Trending articles retrieved
 */
router.get('/trending', authenticate, getTrendingNews);

/**
 * @openapi
 * /api/v1/news/latest:
 *   get:
 *     summary: Get most recent news stories
 *     tags: [News]
 *     responses:
 *       200:
 *         description: Latest articles retrieved
 */
router.get('/latest', authenticate, getLatestNews);

/**
 * @openapi
 * /api/v1/news/search:
 *   get:
 *     summary: Search news articles by query string
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: keywords
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', authenticate, searchNews);

/**
 * @openapi
 * /api/v1/news/category/{category}:
 *   get:
 *     summary: Fetch news stories by category
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category articles
 */
router.get('/category/:category', authenticate, getNewsByCategory);

/**
 * @openapi
 * /api/v1/news/{id}/explain:
 *   get:
 *     summary: Explain why an article was recommended
 *     tags: [Feed & Personalization]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Natural language explanation list
 */
router.get('/:id/explain', authenticate, explainRecommendation);

/**
 * @openapi
 * /api/v1/news/{id}:
 *   get:
 *     summary: Fetch article details by ID
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article detail
 */
router.get('/:id', authenticate, getNewsById);

export default router;
