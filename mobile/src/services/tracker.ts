import api from './api';

export type EventType =
  | 'impression'
  | 'open'
  | 'view'
  | 'read_complete'
  | 'skip'
  | 'like'
  | 'dislike'
  | 'bookmark'
  | 'share'
  | 'not_interested';

class BehaviorTracker {
  private activeArticleStartTime: number | null = null;
  private activeArticleId: string | null = null;
  private activeArticleCategory: string | null = null;

  onArticleVisible(articleId: string, category: string) {
    // Flush previous article reading duration if any
    this.flushActiveArticle();

    this.activeArticleId = articleId;
    this.activeArticleCategory = category;
    this.activeArticleStartTime = Date.now();

    // Fire view event
    this.sendInteraction(articleId, category, 'view');
  }

  flushActiveArticle() {
    if (this.activeArticleId && this.activeArticleStartTime && this.activeArticleCategory) {
      const durationSeconds = Math.round((Date.now() - this.activeArticleStartTime) / 1000);
      const articleId = this.activeArticleId;
      const category = this.activeArticleCategory;

      if (durationSeconds >= 15) {
        this.sendInteraction(articleId, category, 'read_complete', durationSeconds, 100);
      } else if (durationSeconds < 3) {
        this.sendInteraction(articleId, category, 'skip', durationSeconds, 20);
      } else {
        this.sendInteraction(articleId, category, 'view', durationSeconds, 50);
      }
    }

    this.activeArticleId = null;
    this.activeArticleStartTime = null;
    this.activeArticleCategory = null;
  }

  async sendInteraction(
    articleId: string,
    category: string,
    eventType: EventType,
    readingDuration: number = 0,
    scrollDepth: number = 0
  ) {
    try {
      await api.post('/interactions', {
        articleId,
        category: category.toLowerCase(),
        eventType,
        readingDuration,
        scrollDepth
      });
    } catch (error) {
      // Background silent fail
    }
  }

  // Ad event tracking
  async trackAdImpression(adId: string, campaignId?: string) {
    try {
      await api.post(`/ads/${adId}/impression`, { campaignId });
    } catch (e) {}
  }

  async trackAdClick(adId: string, campaignId?: string) {
    try {
      await api.post(`/ads/${adId}/click`, { campaignId });
    } catch (e) {}
  }
}

export const tracker = new BehaviorTracker();
