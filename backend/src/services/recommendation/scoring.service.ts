import mongoose from 'mongoose';
import UserInterestProfile, { IUserInterestProfile } from '../../models/UserInterestProfile';
import UserNewsInteraction from '../../models/UserNewsInteraction';
import User from '../../models/User';
import logger from '../../utils/logger';

export interface ScoreUpdateSignal {
  userId?: string;
  anonymousUserId?: string;
  category: string;
  eventType: string;
  readingDuration?: number;
}

export class ScoringService {
  // Score mapping rules
  private EVENT_SCORES: Record<string, number> = {
    read_complete: 5,
    like: 8,
    bookmark: 10,
    share: 12,
    skip: -2,
    not_interested: -10,
    dislike: -6
  };

  // Half-life decay constant (lambda for ~14 days half-life)
  private DECAY_LAMBDA = 0.049;

  // In-memory fallback scores
  private fallbackScores = new Map<string, Map<string, number>>();

  /**
   * Process a user event interaction and update their interest profile score
   */
  async processInteraction(signal: ScoreUpdateSignal): Promise<void> {
    const { userId, anonymousUserId, category, eventType, readingDuration = 0 } = signal;
    const cat = category.toLowerCase();

    let baseScore = this.EVENT_SCORES[eventType] || 0;

    // Check long read bonus or quick skip penalty
    if (readingDuration > 15 && eventType !== 'not_interested') {
      baseScore += 6; // long_read bonus
    } else if (readingDuration < 3 && (eventType === 'skip' || eventType === 'view')) {
      baseScore -= 3; // quick_skip penalty
    }

    if (baseScore === 0) return;

    const userKey = userId || anonymousUserId || 'guest_default';
    if (!this.fallbackScores.has(userKey)) {
      this.fallbackScores.set(userKey, new Map<string, number>());
    }
    const memScores = this.fallbackScores.get(userKey)!;
    const existingMemScore = memScores.get(cat) || 50;
    memScores.set(cat, Math.max(0, Math.min(100, existingMemScore + baseScore)));

    if (mongoose.connection.readyState !== 1) {
      return;
    }

    try {
      let profile = await this.getOrCreateProfile(userId, anonymousUserId);
      let currentCatScores = profile.categoryScores || new Map<string, number>();

      const existingScore = currentCatScores.get(cat) || 50; // Base baseline score is 50
      const newScore = Math.max(0, Math.min(100, existingScore + baseScore));

      currentCatScores.set(cat, newScore);
      profile.categoryScores = currentCatScores;
      profile.updatedAt = new Date();

      await profile.save();
      logger.info(`Updated interest profile for category '${cat}': ${existingScore} -> ${newScore}`);
    } catch (err: any) {
      logger.warn('Scoring service processInteraction error:', err.message);
    }
  }


  /**
   * Retrieves or creates a UserInterestProfile
   */
  async getOrCreateProfile(userId?: string, anonymousUserId?: string): Promise<IUserInterestProfile> {
    let query: any = {};
    if (userId) {
      query.userId = userId;
    } else if (anonymousUserId) {
      query.anonymousUserId = anonymousUserId;
    } else {
      throw new Error('Either userId or anonymousUserId must be provided');
    }

    let profile = await UserInterestProfile.findOne(query);
    if (!profile) {
      profile = new UserInterestProfile({
        ...query,
        categoryScores: new Map<string, number>(),
        topicScores: new Map<string, number>()
      });
      await profile.save();
    }
    return profile;
  }

  /**
   * Recalculates interest scores applying exponential time decay
   */
  async getDecayedCategoryScores(userId?: string, anonymousUserId?: string): Promise<Record<string, number>> {
    const userKey = userId || anonymousUserId || 'guest_default';
    if (mongoose.connection.readyState !== 1) {
      const result: Record<string, number> = {};
      const memScores = this.fallbackScores.get(userKey);
      if (memScores) {
        memScores.forEach((score, cat) => {
          result[cat] = score;
        });
      }
      return result;
    }

    try {
      const profile = await this.getOrCreateProfile(userId, anonymousUserId);
      const result: Record<string, number> = {};
      const now = Date.now();
      const lastUpdate = profile.updatedAt ? profile.updatedAt.getTime() : now;
      const daysPassed = (now - lastUpdate) / (1000 * 60 * 60 * 24);

      const decayFactor = Math.exp(-this.DECAY_LAMBDA * daysPassed);

      if (profile.categoryScores) {
        profile.categoryScores.forEach((score, category) => {
          result[category] = Math.round(score * decayFactor);
        });
      }

      return result;
    } catch (err: any) {
      logger.warn('Error in getDecayedCategoryScores, returning memory scores');
      const result: Record<string, number> = {};
      const memScores = this.fallbackScores.get(userKey);
      if (memScores) {
        memScores.forEach((score, cat) => {
          result[cat] = score;
        });
      }
      return result;
    }
  }
}

export const scoringService = new ScoringService();

