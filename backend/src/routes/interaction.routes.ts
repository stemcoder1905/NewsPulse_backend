import { Router } from 'express';
import { trackInteraction } from '../controllers/interaction.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { interactionSchema } from '../validators';

const router = Router();

router.post('/', authenticate, validate(interactionSchema), trackInteraction);

export default router;
