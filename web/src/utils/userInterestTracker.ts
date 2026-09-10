import {
  Article,
  ReadArticleRecord,
  CategoryInterestStat,
  UserInterestProfile
} from '../services/api';

export type { ReadArticleRecord, CategoryInterestStat, UserInterestProfile };

const STORAGE_OLD_FEED = 'np_old_feed_articles_v1';
const STORAGE_CLICK_COUNT = 'np_read_click_count_v1';
const STORAGE_USER_PROFILE = 'np_user_profile_cache_v1';
const AD_TRIGGER_INTERVAL = 5;

/**
 * Retrieves cached Old Feed from localStorage for instant render
 */
export function getOldFeed(): ReadArticleRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_OLD_FEED);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

/**
 * Saves Old Feed to local cache
 */
export function saveOldFeedToCache(articles: ReadArticleRecord[]): void {
  try {
    localStorage.setItem(STORAGE_OLD_FEED, JSON.stringify(articles.slice(0, 100)));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

/**
 * Retrieves cached click counter
 */
export function getClickCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_CLICK_COUNT);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch (e) {
    return 0;
  }
}

/**
 * Saves User Interest Profile to local cache
 */
export function saveProfileToCache(profile: UserInterestProfile): void {
  try {
    localStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(profile));
    localStorage.setItem(STORAGE_CLICK_COUNT, profile.clickCount.toString());
  } catch (e) {
    console.warn('LocalStorage profile save error:', e);
  }
}

/**
 * Loads cached user interest profile or calculates a baseline
 */
export function getCachedUserProfile(): UserInterestProfile {
  try {
    const raw = localStorage.getItem(STORAGE_USER_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return analyzeUserInterests();
}

/**
 * Local analysis fallback if backend response is loading
 */
export function analyzeUserInterests(): UserInterestProfile {
  const oldFeed = getOldFeed();
  const clickCount = getClickCount();
  const clicksUntilNextAd = AD_TRIGGER_INTERVAL - (clickCount % AD_TRIGGER_INTERVAL);

  if (oldFeed.length === 0) {
    return {
      totalRead: 0,
      clickCount,
      clicksUntilNextAd: AD_TRIGGER_INTERVAL,
      topCategory: null,
      secondaryCategory: null,
      categoryStats: []
    };
  }

  const categoryFreq: Record<string, number> = {};
  for (const article of oldFeed) {
    const cat = (article.category || 'general').toLowerCase();
    categoryFreq[cat] = (categoryFreq[cat] || 0) + 1;
  }

  const total = oldFeed.length;
  const sortedStats: CategoryInterestStat[] = Object.entries(categoryFreq)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalRead: total,
    clickCount,
    clicksUntilNextAd: clicksUntilNextAd === 0 ? AD_TRIGGER_INTERVAL : clicksUntilNextAd,
    topCategory: sortedStats[0]?.category || null,
    secondaryCategory: sortedStats[1]?.category || null,
    categoryStats: sortedStats
  };
}

/**
 * Optimistic local record for immediate UI feedback before backend response
 */
export function recordArticleReadOptimistic(article: Article): {
  updatedFeed: ReadArticleRecord[];
  profile: UserInterestProfile;
} {
  const oldFeed = getOldFeed();
  const existingIndex = oldFeed.findIndex(
    (item) => item._id === article._id || item.articleUrl === article.articleUrl
  );

  const updatedRecord: ReadArticleRecord = {
    ...article,
    readAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    oldFeed.splice(existingIndex, 1);
  }
  oldFeed.unshift(updatedRecord);

  const trimmed = oldFeed.slice(0, 100);
  saveOldFeedToCache(trimmed);

  const currentCount = getClickCount() + 1;
  localStorage.setItem(STORAGE_CLICK_COUNT, currentCount.toString());

  const profile = analyzeUserInterests();
  saveProfileToCache(profile);

  return {
    updatedFeed: trimmed,
    profile
  };
}

/**
 * Re-ranks fresh articles for the New Feed based on user's top analyzed interests.
 */
export function reRankNewFeed(
  allArticles: Article[],
  userProfile: UserInterestProfile
): { prioritized: Article[]; standard: Article[]; allReRanked: Article[] } {
  if (!userProfile.topCategory || userProfile.totalRead === 0) {
    return {
      prioritized: [],
      standard: allArticles,
      allReRanked: allArticles
    };
  }

  const topCats = [userProfile.topCategory, userProfile.secondaryCategory]
    .filter(Boolean)
    .map((c) => (c as string).toLowerCase());

  const prioritized: Article[] = [];
  const standard: Article[] = [];

  for (const art of allArticles) {
    const cat = (art.category || '').toLowerCase();
    if (topCats.includes(cat)) {
      prioritized.push(art);
    } else {
      standard.push(art);
    }
  }

  return {
    prioritized,
    standard,
    allReRanked: [...prioritized, ...standard]
  };
}

/**
 * Clears local cache
 */
export function clearOldFeedCache(): void {
  localStorage.removeItem(STORAGE_OLD_FEED);
  localStorage.removeItem(STORAGE_CLICK_COUNT);
  localStorage.removeItem(STORAGE_USER_PROFILE);
}
