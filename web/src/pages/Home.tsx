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
import { Loader2, AlertCircle, Sparkles, Newspaper, History } from 'lucide-react';

export const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const query = searchParams.get('q');

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User reading history (Old Feed) and interest profile state (backed by Backend API)
  const [oldFeed, setOldFeed] = useState<ReadArticleRecord[]>(() => getOldFeed());
  const [userProfile, setUserProfile] = useState<UserInterestProfile>(() => getCachedUserProfile());

  // Ad Modal state
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [activeAd, setActiveAd] = useState<TargetedAd | null>(null);

  // Mobile responsive view tabs: 'new' vs 'old'
  const [mobileTab, setMobileTab] = useState<'new' | 'old'>('new');

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (query) {
          res = await searchNews(query);
        } else if (category) {
          res = await fetchByCategory(category);
        } else {
          res = await fetchLatestNews(1, 40);
        }
        
        if (res.data?.success) {
          setArticles(res.data.data.articles || []);
        } else {
          setError('Failed to fetch news format.');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'An error occurred fetching news.');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [category, query]);

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

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-900/40 rounded-3xl border border-slate-800">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
              <p className="text-slate-400 font-medium">Analyzing news feed & interests...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start space-x-4">
              <AlertCircle className="text-red-400 w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-400 font-bold mb-1">Failed to load news</h3>
                <p className="text-red-400/80 text-sm">{error}</p>
              </div>
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

