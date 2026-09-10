import { Response, NextFunction } from 'express';
import Bookmark from '../models/Bookmark';
import NewsArticle from '../models/NewsArticle';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AppError } from '../middlewares/errorMiddleware';

export const getBookmarks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .populate('articleId')
      .sort({ createdAt: -1 });

    const articles = bookmarks.map((b: any) => b.articleId).filter(Boolean);

    res.json({
      success: true,
      message: 'Bookmarks retrieved',
      data: { articles }
    });
  } catch (error) {
    next(error);
  }
};

export const addBookmark = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required to save bookmarks', 401);
    }
    const { articleId } = req.params;

    const existing = await Bookmark.findOne({ userId: req.user._id, articleId });
    if (!existing) {
      await Bookmark.create({ userId: req.user._id, articleId });
      await NewsArticle.findByIdAndUpdate(articleId, { $inc: { bookmarksCount: 1 } });
    }

    res.status(201).json({
      success: true,
      message: 'Article bookmarked',
      data: { articleId }
    });
  } catch (error) {
    next(error);
  }
};

export const removeBookmark = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    const { articleId } = req.params;

    const removed = await Bookmark.findOneAndDelete({ userId: req.user._id, articleId });
    if (removed) {
      await NewsArticle.findByIdAndUpdate(articleId, { $inc: { bookmarksCount: -1 } });
    }

    res.json({
      success: true,
      message: 'Bookmark removed',
      data: { articleId }
    });
  } catch (error) {
    next(error);
  }
};
