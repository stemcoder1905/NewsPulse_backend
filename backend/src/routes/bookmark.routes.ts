import { Router } from 'express';
import { addBookmark, removeBookmark } from '../controllers/bookmark.controller';
import { authenticate, requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.post('/:articleId', authenticate, requireAuth, addBookmark);
router.delete('/:articleId', authenticate, requireAuth, removeBookmark);

export default router;
