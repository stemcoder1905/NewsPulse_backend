import { Response, NextFunction } from 'express';
import User from '../models/User';
import { scoringService } from '../services/recommendation/scoring.service';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AppError } from '../middlewares/errorMiddleware';

export const getUserInterests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user ? req.user._id.toString() : undefined;
    const anonymousUserId = req.anonymousUserId;

    const scores = await scoringService.getDecayedCategoryScores(userId, anonymousUserId);
    const preferredCategories = req.user ? req.user.preferredCategories : [];

    res.json({
      success: true,
      message: 'User interest profile retrieved',
      data: {
        preferredCategories,
        categoryScores: scores
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserInterests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required to update preferences', 401);
    }
    const { preferredCategories } = req.body;

    req.user.preferredCategories = preferredCategories;
    req.user.onboardingCompleted = true;
    await req.user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferredCategories: req.user.preferredCategories,
        onboardingCompleted: req.user.onboardingCompleted
      }
    });
  } catch (error) {
    next(error);
  }
};
