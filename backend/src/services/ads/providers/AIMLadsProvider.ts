import axios from 'axios';
import { AdProvider, AdUserContext, NormalizedAd } from './adProvider.interface';
import AdCampaign from '../../../models/AdCampaign';
import { config } from '../../../config';
import logger from '../../../utils/logger';

export class AIMLadsProvider implements AdProvider {
  name = 'aimlads';
  private baseUrl: string;
  private apiKey: string;
  private publisherId: string;

  constructor() {
    this.baseUrl = config.aimlads.baseUrl;
    this.apiKey = config.aimlads.apiKey;
    this.publisherId = config.aimlads.publisherId;
  }

  private isLiveConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'your_aimlads_api_key_here');
  }

  async getAdsForUser(context: AdUserContext): Promise<NormalizedAd[]> {
    const userCategories = context.topInterestCategories || ['general'];

    // TODO: Live AIMLADS Integration Point
    // When official AIMLADS REST API keys and endpoints are provided:
    // const response = await axios.post(`${this.baseUrl}/ads/decision`, {
    //   publisherId: this.publisherId,
    //   user: context
    // }, { headers: { 'Authorization': `Bearer ${this.apiKey}` } });

    if (this.isLiveConfigured()) {
      try {
        const response = await axios.post(
          `${this.baseUrl}/ads/request`,
          {
            publisher_id: this.publisherId,
            user_context: context
          },
          {
            headers: { Authorization: `Bearer ${this.apiKey}` }
          }
        );
        return (response.data.ads || []).map((ad: any) => ({
          adId: ad.id,
          campaignId: ad.campaign_id,
          title: ad.title,
          sponsorName: ad.sponsor_name,
          description: ad.description,
          imageUrl: ad.image_url,
          targetUrl: ad.target_url,
          callToAction: ad.cta || 'Shop Now',
          categoryTag: ad.category || 'sponsored',
          isSponsored: true
        }));
      } catch (err: any) {
        logger.warn(`AIMLADS Live API request failed: ${err.message}. Using contextual fallback ad server.`);
      }
    }

    // Fallback/Mock Contextual Ad Server Strategy
    // Finds campaigns matching user's top interest categories
    let matchingCampaigns = await AdCampaign.find({
      isActive: true,
      targetCategories: { $in: userCategories.map((c) => c.toLowerCase()) }
    });

    if (matchingCampaigns.length === 0) {
      matchingCampaigns = await AdCampaign.find({ isActive: true });
    }

    if (matchingCampaigns.length === 0) {
      // Seed default fallback ad campaigns if database has none
      return [
        {
          adId: 'aiml_ad_sports_1',
          campaignId: 'camp_sports_01',
          title: 'Premium Cricket Gear & Training Kits - 30% Off',
          sponsorName: 'ProSport Performance',
          description: 'Gear up for the season with professional bats, pads, and smart swing trackers.',
          imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
          targetUrl: 'https://example.com/ads/prosport-cricket',
          callToAction: 'Shop Now',
          categoryTag: 'sports',
          isSponsored: true
        },
        {
          adId: 'aiml_ad_tech_1',
          campaignId: 'camp_tech_01',
          title: 'Next-Gen Cloud Workstations for AI Developers',
          sponsorName: 'PulseCloud Tech',
          description: 'Deploy high-performance GPU clusters in seconds with zero configuration.',
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          targetUrl: 'https://example.com/ads/pulsecloud-gpu',
          callToAction: 'Start Free Trial',
          categoryTag: 'technology',
          isSponsored: true
        }
      ];
    }

    return matchingCampaigns.map((camp) => ({
      adId: camp.adId,
      campaignId: camp._id.toString(),
      title: camp.title,
      sponsorName: camp.sponsorName,
      description: camp.description,
      imageUrl: camp.imageUrl,
      targetUrl: camp.targetUrl,
      callToAction: camp.callToAction,
      categoryTag: camp.targetCategories[0] || 'sponsored',
      isSponsored: true
    }));
  }

  async trackImpression(adId: string, campaignId?: string): Promise<void> {
    // TODO: Live AIMLADS Integration Point
    // await axios.post(`${this.baseUrl}/ads/${adId}/impression`, { publisherId: this.publisherId });
    logger.info(`[AIMLADS] Tracked Impression for Ad: ${adId}`);
    if (campaignId) {
      await AdCampaign.findByIdAndUpdate(campaignId, { $inc: { impressionsCount: 1 } });
    }
  }

  async trackClick(adId: string, campaignId?: string): Promise<void> {
    // TODO: Live AIMLADS Integration Point
    // await axios.post(`${this.baseUrl}/ads/${adId}/click`, { publisherId: this.publisherId });
    logger.info(`[AIMLADS] Tracked Click for Ad: ${adId}`);
    if (campaignId) {
      await AdCampaign.findByIdAndUpdate(campaignId, { $inc: { clicksCount: 1 } });
    }
  }

  async trackConversion(adId: string, campaignId?: string): Promise<void> {
    // TODO: Live AIMLADS Integration Point
    // await axios.post(`${this.baseUrl}/ads/${adId}/conversion`, { publisherId: this.publisherId });
    logger.info(`[AIMLADS] Tracked Conversion for Ad: ${adId}`);
    if (campaignId) {
      await AdCampaign.findByIdAndUpdate(campaignId, { $inc: { conversionsCount: 1 } });
    }
  }
}
