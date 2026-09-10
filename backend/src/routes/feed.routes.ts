import { Router } from 'express';
import { getFeed } from '../controllers/feed.controller';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, getFeed);

export default router;
