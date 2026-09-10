import React from 'react';
import { Users, Eye, Newspaper, MousePointer, Activity, BarChart2 } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';

interface OverviewProps {
  analytics: any;
}

export const Overview: React.FC<OverviewProps> = ({ analytics }) => {
  if (!analytics) {
    return <div className="p-8 text-slate-400">Loading analytics...</div>;
  }

  const {
    totalUsers = 0,
    totalNews = 0,
    totalViews = 0,
    totalUserReads = 0,
    adImpressions = 0,
    adClicks = 0,
    adCTR = 0,
    popularCategories = [],
    userCategoryInterests = [],
    mostReadArticles = [],
    providerHealth = []
  } = analytics;

  const totalInterestReads = (userCategoryInterests || []).reduce((acc: number, curr: any) => acc + curr.count, 0);

  return (
    <div className="space-y-6">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard title="Total App Readers" value={totalUsers} icon={Users} color="sky" subtext="Active & Guest Sessions" />
        <MetricCard title="Articles Ingested" value={totalNews} icon={Newspaper} color="indigo" subtext="Live & Categorized" />
        <MetricCard title="Total Article Reads" value={totalViews} icon={Eye} color="emerald" subtext={`${totalUserReads} reads profiled`} />
        <MetricCard title="Ad CTR Rate" value={`${adCTR}%`} icon={MousePointer} color="amber" subtext={`${adClicks} clicks / ${adImpressions} impressions`} />
      </div>

      {/* Main Grid: Category Distribution & User Interest Profiling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Behavioral Interest Analytics (Background Aggregated) */}
        <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              User Interest Profiling (AI Backend Analytics)
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {totalInterestReads} Reads Analyzed
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Aggregated in background to drive user feed re-ranking and 5-click targeted ad campaigns.
          </p>

          {userCategoryInterests && userCategoryInterests.length > 0 ? (
            <div className="space-y-4">
              {userCategoryInterests.map((cat: any) => {
                const percent = totalInterestReads > 0 ? Math.round((cat.count / totalInterestReads) * 100) : 0;
                return (
                  <div key={cat._id} className="flex items-center justify-between">
                    <div className="w-36 font-semibold text-sm capitalize text-slate-300">{cat._id}</div>
                    <div className="flex-1 mx-4 bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-xs font-bold text-slate-400 w-24 text-right">
                      {percent}% ({cat.count} reads)
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No user reads recorded yet. Users reading news will populate this.</p>
          )}
        </div>

        {/* News Provider Health */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
          <h3 className="font-bold text-lg text-slate-100 mb-4">News Provider Status</h3>
          <div className="space-y-4">
            {providerHealth.map((prov: any) => (
              <div key={prov.name} className="p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-200">{prov.name}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {prov.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Last Synced: {new Date(prov.lastSync).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Most Read Articles Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
        <h3 className="font-bold text-lg text-slate-100 mb-4">Top Trending Articles</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-3 rounded-l-lg">Headline</th>
                <th className="p-3">Category</th>
                <th className="p-3">Source</th>
                <th className="p-3">Reads</th>
                <th className="p-3 rounded-r-lg">Likes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {mostReadArticles.map((art: any) => (
                <tr key={art._id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-200 max-w-md truncate">{art.title}</td>
                  <td className="p-3">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-sky-500/10 text-sky-400 rounded-full border border-sky-500/20 capitalize">
                      {art.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{art.sourceName}</td>
                  <td className="p-3 font-bold text-slate-200">{art.viewsCount || 0}</td>
                  <td className="p-3 font-bold text-rose-400">{art.likesCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
