import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
  anonymousUserId?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const anonHeader = req.headers['x-anonymous-id'] as string;

  if (anonHeader) {
    req.anonymousUserId = anonHeader;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (req.anonymousUserId) {
      return next();
    }
    // Guest mode supported without header too: generate temporary anonymous ID
    req.anonymousUserId = req.anonymousUserId || `guest_${Math.random().toString(36).substring(2, 11)}`;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; role: string };
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      res.status(401).json({ success: false, message: 'User no longer exists', errors: [] });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    // If token expired/invalid, allow guest fallback if x-anonymous-id present
    if (req.anonymousUserId) {
      return next();
    }
    res.status(401).json({ success: false, message: 'Invalid or expired token', errors: [] });
  }
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required', errors: [] });
    return;
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin privileges required', errors: [] });
    return;
  }
  next();
};
