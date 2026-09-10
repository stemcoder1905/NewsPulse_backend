import { Router } from 'express';
import {
  trackRead,
  getUserProfile,
  getOldFeed,
  clearOldFeed
} from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// All analytics routes support both logged in users and anonymous/guest sessions
router.post('/track-read', authenticate, trackRead);
router.get('/user-profile', authenticate, getUserProfile);
router.get('/old-feed', authenticate, getOldFeed);
router.delete('/old-feed', authenticate, clearOldFeed);

export default router;
