import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  fetchLatestNews,
  fetchByCategory,
  searchNews,
  Article,
  ReadArticleRecord,
  UserInterestProfile,
  fetchUserAnalytics,
  fetchOldFeed,
  trackReadArticle,
  clearOldFeedHistory
} from '../services/api';
import { NewsCard } from '../components/NewsCard';
import { OldFeedSidebar } from '../components/OldFeedSidebar';
import { AdModal } from '../components/AdModal';
import { getTargetedAdForCategory, TargetedAd } from '../services/adService';
import {
  getOldFeed,
  getCachedUserProfile,
  saveOldFeedToCache,
  saveProfileToCache,
  recordArticleReadOptimistic,
  clearOldFeedCache,
  reRankNewFeed
} from '../utils/userInterestTracker';
import { resolveUniqueArticleThumbnail } from '../utils/thumbnailGenerator';
import { Loader2, AlertCircle, Sparkles, Newspaper, History, RefreshCw } from 'lucide-react';

// Local feed cache helpers to ensure users immediately see stories even during cold starts
const getFeedCacheKey = (category: string | null, query: string | null) =>
  `np_articles_cache_${category || 'all'}_${query || 'none'}`;

const getCachedArticles = (category: string | null, query: string | null): Article[] => {
  try {
    const raw = localStorage.getItem(getFeedCacheKey(category, query));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return [];
};

export const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const query = searchParams.get('q');

  const [reloadKey, setReloadKey] = useState(0);
  const [articles, setArticles] = useState<Article[]>(() => getCachedArticles(category, query));
  const [loading, setLoading] = useState(() => getCachedArticles(category, query).length === 0);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User reading history (Old Feed) and interest profile state (backed by Backend API)
  const [oldFeed, setOldFeed] = useState<ReadArticleRecord[]>(() => getOldFeed());
  const [userProfile, setUserProfile] = useState<UserInterestProfile>(() => getCachedUserProfile());

  // Ad Modal state
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [activeAd, setActiveAd] = useState<TargetedAd | null>(null);

  // Mobile responsive view tabs: 'new' vs 'old'
  const [mobileTab, setMobileTab] = useState<'new' | 'old'>('new');

  // Sync cached articles if query or category changes
  useEffect(() => {
    const cached = getCachedArticles(category, query);
    if (cached.length > 0) {
      setArticles(cached);
    }
  }, [category, query]);

  useEffect(() => {
    let wakeTimer: any;
    let isSubscribed = true;

    const loadNews = async () => {
      const hasCached = getCachedArticles(category, query).length > 0;
      if (!hasCached) {
        setLoading(true);
      }
      setError(null);
      setIsWakingUp(false);

      // Trigger friendly cold-start notice if backend takes > 3.5s (sleeping Render instance)
      wakeTimer = setTimeout(() => {
        if (isSubscribed) {
          setIsWakingUp(true);
        }
      }, 3500);

      try {
        let res;
        if (query) {
          res = await searchNews(query);
        } else if (category) {
          res = await fetchByCategory(category);
        } else {
          res = await fetchLatestNews(1, 40);
        }

        if (!isSubscribed) return;

        if (res.data?.success && Array.isArray(res.data.data.articles)) {
          setArticles(res.data.data.articles);
          try {
            localStorage.setItem(
              getFeedCacheKey(category, query),
              JSON.stringify(res.data.data.articles.slice(0, 40))
            );
          } catch (e) {
            // ignore
          }
          setError(null);
        } else {
          if (!hasCached) {
            setError('Failed to fetch news format.');
          }
        }
      } catch (err: any) {
        if (!isSubscribed) return;
        const msg = err.response?.data?.error || err.message || 'Server is taking longer to respond.';
        setError(msg);
      } finally {
        if (isSubscribed) {
          clearTimeout(wakeTimer);
          setLoading(false);
          setIsWakingUp(false);
        }
      }
    };

    loadNews();

    return () => {
      isSubscribed = false;
      clearTimeout(wakeTimer);
    };
  }, [category, query, reloadKey]);

  // Load user interest analytics and Old Feed directly from Backend on initial mount
  useEffect(() => {
    const loadBackendAnalytics = async () => {
      try {
        const [profileRes, oldFeedRes] = await Promise.all([
          fetchUserAnalytics(),
          fetchOldFeed(50)
        ]);

        if (profileRes.data?.success && profileRes.data.data) {
          setUserProfile(profileRes.data.data);
          saveProfileToCache(profileRes.data.data);
        }

        if (oldFeedRes.data?.success && Array.isArray(oldFeedRes.data.data.oldFeed)) {
          setOldFeed(oldFeedRes.data.data.oldFeed);
          saveOldFeedToCache(oldFeedRes.data.data.oldFeed);
        }
      } catch (err) {
        console.warn('Backend analytics sync fallback to local cache:', err);
      }
    };

    loadBackendAnalytics();
  }, []);

  // Handle article click: persist read to Backend database and check for 5-click ad milestone
  const handleArticleClick = async (article: Article) => {
    // 1. Immediate optimistic UI update
    const { updatedFeed, profile: optimisticProfile } = recordArticleReadOptimistic(article);
    setOldFeed(updatedFeed);
    setUserProfile(optimisticProfile);

    // 2. Persist to Backend database and get updated metrics
    try {
      const res = await trackReadArticle(article);
      if (res.data?.success && res.data.data) {
        const { profile: backendProfile, shouldTriggerAd } = res.data.data;
        setUserProfile(backendProfile);
        saveProfileToCache(backendProfile);

        if (shouldTriggerAd) {
          const targeted = getTargetedAdForCategory(backendProfile.topCategory || undefined);
          setActiveAd(targeted);
          setIsAdOpen(true);
        }
      }
    } catch (err) {
      console.warn('Backend read tracking deferred to local calculation:', err);
      if (optimisticProfile.clickCount > 0 && optimisticProfile.clickCount % 5 === 0) {
        const targeted = getTargetedAdForCategory(optimisticProfile.topCategory || undefined);
        setActiveAd(targeted);
        setIsAdOpen(true);
      }
    }
  };

  // Clear Old Feed in Backend database and local state
  const handleClearHistory = async () => {
    clearOldFeedCache();
    setOldFeed([]);
    setUserProfile({
      totalRead: 0,
      clickCount: 0,
      clicksUntilNextAd: 5,
      topCategory: null,
      secondaryCategory: null,
      categoryStats: []
    });

    try {
      await clearOldFeedHistory();
    } catch (err) {
      console.warn('Backend clear history error:', err);
    }
  };

  // Dynamically re-rank articles in the New Feed according to user's analyzed interests
  const { prioritized, standard, allReRanked } = useMemo(() => {
    return reRankNewFeed(articles, userProfile);
  }, [articles, userProfile]);

  // Guarantee 100% unique, headline-specific thumbnails across the entire feed (no duplicate images ever)
  const displayArticles = useMemo(() => {
    const usedThumbnails = new Set<string>();
    return allReRanked.map((article) => ({
      article,
      thumbnail: resolveUniqueArticleThumbnail(article, usedThumbnails)
    }));
  }, [allReRanked]);

  const renderHeader = () => {
    if (query) return `Search Results for "${query}"`;
    if (category) return `${category.charAt(0).toUpperCase() + category.slice(1)} News`;
    return 'New Feed';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center p-1.5 bg-slate-900 border border-slate-800 rounded-2xl mb-6">
        <button
          onClick={() => setMobileTab('new')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            mobileTab === 'new'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Newspaper size={15} />
          <span>New Feed ({articles.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('old')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            mobileTab === 'old'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History size={15} />
          <span>Old Feed ({oldFeed.length})</span>
        </button>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= COLUMN 1: NEW FEED (MAIN) ================= */}
        <main className={`lg:col-span-8 ${mobileTab === 'old' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-3xl font-black tracking-tight text-white">{renderHeader()}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live & Fresh
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Fresh stories curated by NEWSPULSE engine
              </p>
            </div>

            {/* Interest Priority Indicator */}
            {userProfile.topCategory && userProfile.totalRead > 0 && !category && !query && (
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold shadow-inner">
                <Sparkles size={14} className="text-amber-400 flex-shrink-0 animate-pulse" />
                <span>
                  Prioritized by your interest in <strong className="capitalize text-amber-200">{userProfile.topCategory}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Waking / Error Notice when cached articles are already visible */}
          {articles.length > 0 && error && (
            <div className="flex items-center justify-between p-3.5 mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs shadow-sm">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Cloud server is waking up. Displaying recent stories.</span>
              </div>
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="ml-3 font-bold underline hover:text-white transition-colors cursor-pointer"
              >
                Retry Refresh
              </button>
            </div>
          )}

          {/* Background refresh badge if user is viewing cached stories */}
          {articles.length > 0 && loading && (
            <div className="flex items-center space-x-2 px-3 py-1.5 mb-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs w-fit">
              <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>Checking cloud server for fresh updates...</span>
            </div>
          )}

          {articles.length === 0 && loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-slate-900/40 rounded-3xl border border-slate-800 text-center">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">
                {isWakingUp ? 'Waking Up Cloud Server...' : 'Analyzing news feed & interests...'}
              </h3>
              <p className="text-slate-400 text-sm max-w-md">
                {isWakingUp
                  ? 'Render free-tier cloud servers sleep when idle. Booting up takes ~30–45s on first visit. Your news will load automatically!'
                  : 'Curating real-time stories and personalizing your feed...'}
              </p>
              {isWakingUp && (
                <div className="mt-4 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25 animate-pulse">
                  <span>Container spinning up • Automatic retries active</span>
                </div>
              )}
            </div>
          ) : articles.length === 0 && error ? (
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-amber-400 w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Cloud Server Is Waking Up</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Render free-tier instances sleep after periods of inactivity. If you haven't opened the site in a day or two, the server requires 30 to 50 seconds to complete cold startup.
              </p>
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Wake Server & Refresh</span>
              </button>
            </div>
          ) : allReRanked.length === 0 ? (
            <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800">
              <h3 className="text-xl font-bold text-slate-300 mb-2">No articles found</h3>
              <p className="text-slate-500">We couldn't find any news matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Prioritized Section Header (if available) */}
              {prioritized.length > 0 && !category && !query && (
                <div className="flex items-center space-x-2 px-1 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Sparkles size={13} />
                  <span>Recommended For You ({prioritized.length})</span>
                </div>
              )}

              {/* Grid of articles with guaranteed unique thumbnails */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayArticles.map(({ article, thumbnail }, index) => {
                  const isTopPriority = prioritized.some((p) => p._id === article._id);
                  return (
                    <NewsCard 
                      key={article._id || index} 
                      article={article} 
                      displayThumbnail={thumbnail}
                      featured={!category && !query && index === 0 && prioritized.length === 0}
                      isPrioritized={isTopPriority}
                      recommendationReason={
                        isTopPriority 
                          ? `Prioritized for your interest in ${article.category}` 
                          : undefined
                      }
                      onArticleClick={handleArticleClick}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* ================= COLUMN 2: OLD FEED (SIDEBAR) ================= */}
        <div className={`lg:col-span-4 lg:sticky lg:top-24 ${mobileTab === 'new' ? 'hidden lg:block' : 'block'}`}>
          <OldFeedSidebar 
            oldFeed={oldFeed} 
            userProfile={userProfile} 
            onClearHistory={handleClearHistory} 
          />
        </div>
      </div>

      {/* ================= TARGETED AD MODAL (TRIGGERED EVERY 5 CLICKS) ================= */}
      {activeAd && (
        <AdModal
          ad={activeAd}
          isOpen={isAdOpen}
          onClose={() => setIsAdOpen(false)}
          matchedCategory={userProfile.topCategory}
        />
      )}
    </div>
  );
};

