import { Router } from 'express';
import {
  refreshNews,
  getAnalytics,
  getUserInterestsDistribution,
  getAdminNews,
  updateNews,
  deleteNews,
  updateAppConfig
} from '../controllers/admin.controller';
import { authenticate, requireAuth, requireAdmin } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { adminConfigSchema } from '../validators';

const router = Router();

// In development / demo, allow access; in production, enforce admin auth
router.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  return authenticate(req, res, () => requireAuth(req, res, () => requireAdmin(req, res, next)));
});

router.post('/news/refresh', refreshNews);
router.get('/analytics', getAnalytics);
router.get('/users/interests', getUserInterestsDistribution);
router.get('/news', getAdminNews);
router.put('/news/:id', updateNews);
router.delete('/news/:id', deleteNews);
router.put('/config', validate(adminConfigSchema), updateAppConfig);

export default router;
