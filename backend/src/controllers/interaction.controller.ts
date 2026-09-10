import { Response, NextFunction } from 'express';
import UserNewsInteraction from '../models/UserNewsInteraction';
import NewsArticle from '../models/NewsArticle';
import { scoringService } from '../services/recommendation/scoring.service';
import { AuthRequest } from '../middlewares/authMiddleware';

export const trackInteraction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user ? req.user._id : undefined;
    const anonymousUserId = req.body.anonymousUserId || req.anonymousUserId;
    const { articleId, category, eventType, readingDuration = 0, scrollDepth = 0 } = req.body;

    // Record interaction in DB
    const interaction = await UserNewsInteraction.create({
      userId,
      anonymousUserId,
      articleId,
      category: category.toLowerCase(),
      eventType,
      readingDuration,
      scrollDepth
    });

    // Update article global statistics based on event type
    const incObj: any = {};
    if (eventType === 'view' || eventType === 'open') incObj.viewsCount = 1;
    if (eventType === 'like') incObj.likesCount = 1;
    if (eventType === 'bookmark') incObj.bookmarksCount = 1;
    if (eventType === 'share') incObj.sharesCount = 1;
    if (eventType === 'not_interested') incObj.notInterestedCount = 1;

    if (Object.keys(incObj).length > 0) {
      await NewsArticle.findByIdAndUpdate(articleId, { $inc: incObj });
    }

    // Trigger Recommendation Scoring Service update asynchronously
    scoringService
      .processInteraction({
        userId: userId ? userId.toString() : undefined,
        anonymousUserId,
        category,
        eventType,
        readingDuration
      })
      .catch((err) => console.error('Scoring update background error:', err));

    res.status(201).json({
      success: true,
      message: 'Interaction recorded',
      data: { interactionId: interaction._id }
    });
  } catch (error) {
    next(error);
  }
};
