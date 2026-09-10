import { Router } from 'express';
import { getUserInterests, updateUserInterests } from '../controllers/user.controller';
import { getBookmarks } from '../controllers/bookmark.controller';
import { authenticate, requireAuth } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { updateInterestsSchema } from '../validators';

const router = Router();

router.get('/me/interests', authenticate, getUserInterests);
router.put('/me/interests', authenticate, requireAuth, validate(updateInterestsSchema), updateUserInterests);
router.get('/me/bookmarks', authenticate, requireAuth, getBookmarks);

export default router;
