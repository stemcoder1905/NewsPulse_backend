import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Overview } from './pages/Overview';
import { NewsManagement } from './pages/NewsManagement';
import { RecommendationSettings } from './pages/RecommendationSettings';
import { AdSettings } from './pages/AdSettings';
import { adminApi } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await adminApi.get('/analytics');
      if (res.data?.data) {
        setAnalytics(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching admin analytics:', e);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await adminApi.post('/news/refresh');
      await fetchAnalytics();
      alert('News Ingestion Pipeline successfully completed!');
    } catch (e) {
      alert('News refresh failed.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#090D16] text-slate-100 overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTriggerRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white capitalize">
              {activeTab === 'overview'
                ? 'System Analytics Dashboard'
                : activeTab === 'news'
                ? 'News Catalog Management'
                : activeTab === 'recommendations'
                ? 'Recommendation Engine Configuration'
                : 'Ad Monetization & Settings'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">Real-time metrics, content moderation & ML scoring controls.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Server Online
            </span>
          </div>
        </header>

        {activeTab === 'overview' && <Overview analytics={analytics} />}
        {activeTab === 'news' && <NewsManagement />}
        {activeTab === 'recommendations' && <RecommendationSettings />}
        {activeTab === 'ads' && <AdSettings />}
      </main>
    </div>
  );
}

export default App;
