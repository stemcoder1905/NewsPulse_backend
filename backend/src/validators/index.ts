import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredCategories: z.array(z.string()).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export const interactionSchema = z.object({
  articleId: z.string().min(1, 'Article ID is required'),
  category: z.string().min(1, 'Category is required'),
  eventType: z.enum([
    'impression',
    'open',
    'view',
    'read_complete',
    'skip',
    'like',
    'dislike',
    'bookmark',
    'share',
    'not_interested'
  ]),
  readingDuration: z.number().nonnegative().optional(),
  scrollDepth: z.number().min(0).max(100).optional(),
  anonymousUserId: z.string().optional()
});

export const updateInterestsSchema = z.object({
  preferredCategories: z.array(z.string()).min(1, 'Select at least one preferred category')
});

export const adRequestSchema = z.object({
  anonymousUserId: z.string().optional(),
  topInterestCategories: z.array(z.string()).optional(),
  topTopics: z.array(z.string()).optional(),
  platform: z.string().optional(),
  language: z.string().optional()
});

export const adInteractionSchema = z.object({
  adId: z.string().min(1, 'Ad ID is required'),
  eventType: z.enum(['ad_requested', 'impression', 'click', 'conversion']),
  campaignId: z.string().optional(),
  anonymousUserId: z.string().optional(),
  contextCategories: z.array(z.string()).optional()
});

export const adminConfigSchema = z.object({
  adFrequency: z.number().min(1).max(50).optional(),
  recommendationWeights: z.object({
    interest: z.number().min(0).max(1),
    freshness: z.number().min(0).max(1),
    engagement: z.number().min(0).max(1),
    preference: z.number().min(0).max(1),
    diversity: z.number().min(0).max(1)
  }).optional()
});
