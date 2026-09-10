import AdInteraction from '../../models/AdInteraction';
import { AIMLadsProvider } from './providers/AIMLadsProvider';
import { AdProvider, AdUserContext, NormalizedAd } from './providers/adProvider.interface';
import logger from '../../utils/logger';

export class AdService {
  private provider: AdProvider;

  constructor() {
    this.provider = new AIMLadsProvider();
  }

  async getAdForUser(context: AdUserContext): Promise<NormalizedAd | null> {
    try {
      const ads = await this.provider.getAdsForUser(context);
      if (ads.length === 0) return null;
      // Select random or highest relevance ad
      const selectedAd = ads[Math.floor(Math.random() * ads.length)];
      return selectedAd;
    } catch (err: any) {
      logger.error(`Error in getAdForUser: ${err.message}`);
      return null;
    }
  }

  async recordImpression(adId: string, campaignId?: string, userId?: string, anonymousUserId?: string): Promise<void> {
    await AdInteraction.create({
      adId,
      campaignId,
      userId,
      anonymousUserId,
      eventType: 'impression'
    });
    await this.provider.trackImpression(adId, campaignId);
  }

  async recordClick(adId: string, campaignId?: string, userId?: string, anonymousUserId?: string): Promise<void> {
    await AdInteraction.create({
      adId,
      campaignId,
      userId,
      anonymousUserId,
      eventType: 'click'
    });
    await this.provider.trackClick(adId, campaignId);
  }

  async recordConversion(adId: string, campaignId?: string, userId?: string, anonymousUserId?: string): Promise<void> {
    await AdInteraction.create({
      adId,
      campaignId,
      userId,
      anonymousUserId,
      eventType: 'conversion'
    });
    await this.provider.trackConversion(adId, campaignId);
  }
}

export const adService = new AdService();
