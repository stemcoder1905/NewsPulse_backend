export interface AdUserContext {
  userId?: string;
  anonymousUserId?: string;
  topInterestCategories?: string[];
  topTopics?: string[];
  coarseLocation?: string;
  platform?: string;
  language?: string;
}

export interface NormalizedAd {
  adId: string;
  campaignId?: string;
  title: string;
  sponsorName: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  callToAction: string;
  categoryTag: string;
  isSponsored: true;
}

export interface AdProvider {
  name: string;
  getAdsForUser(context: AdUserContext): Promise<NormalizedAd[]>;
  trackImpression(adId: string, campaignId?: string): Promise<void>;
  trackClick(adId: string, campaignId?: string): Promise<void>;
  trackConversion(adId: string, campaignId?: string): Promise<void>;
}
