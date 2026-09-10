import { Router } from 'express';
import {
  requestAd,
  trackAdImpression,
  trackAdClick,
  trackAdConversion
} from '../controllers/ad.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { adRequestSchema, adInteractionSchema } from '../validators';

const router = Router();

router.post('/request', authenticate, validate(adRequestSchema), requestAd);
router.post('/:id/impression', authenticate, trackAdImpression);
router.post('/:id/click', authenticate, trackAdClick);
router.post('/:id/conversion', authenticate, trackAdConversion);

export default router;
