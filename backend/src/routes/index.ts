import { Router } from 'express';
import authRoutes from './auth.routes';
import newsRoutes from './news.routes';
import feedRoutes from './feed.routes';
import interactionRoutes from './interaction.routes';
import userRoutes from './user.routes';
import bookmarkRoutes from './bookmark.routes';
import adRoutes from './ad.routes';
import adminRoutes from './admin.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/news', newsRoutes);
router.use('/feed', feedRoutes);
router.use('/interactions', interactionRoutes);
router.use('/users', userRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/ads', adRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
