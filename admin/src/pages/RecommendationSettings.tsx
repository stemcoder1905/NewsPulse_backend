import React, { useState } from 'react';
import { adminApi } from '../services/api';
import { Save, CheckCircle2 } from 'lucide-react';

export const RecommendationSettings: React.FC = () => {
  const [weights, setWeights] = useState({
    interest: 0.4,
    freshness: 0.25,
    engagement: 0.15,
    preference: 0.1,
    diversity: 0.1
  });
  const [isSaved, setIsSaved] = useState(false);

  const total = Object.values(weights).reduce((acc, curr) => acc + curr, 0);

  const handleSave = async () => {
    try {
      await adminApi.put('/config', { recommendationWeights: weights });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      alert('Failed to update recommendation weights');
    }
  };

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">AI Recommendation Engine Tuning</h2>
          <p className="text-xs text-slate-400">Dynamically configure weight parameters for the feed ranking formula.</p>
        </div>
        <div className={`text-sm font-bold px-3 py-1 rounded-full ${Math.abs(total - 1.0) < 0.01 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
          Total Weight: {total.toFixed(2)} / 1.00
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-sm font-semibold text-slate-200 mb-1">
            <span>User Behavioral Interest Score (40%)</span>
            <span className="text-sky-400">{(weights.interest * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.interest}
            onChange={(e) => setWeights({ ...weights, interest: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm font-semibold text-slate-200 mb-1">
            <span>Article Freshness Decay (25%)</span>
            <span className="text-sky-400">{(weights.freshness * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.freshness}
            onChange={(e) => setWeights({ ...weights, freshness: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm font-semibold text-slate-200 mb-1">
            <span>Global Reader Engagement (15%)</span>
            <span className="text-sky-400">{(weights.engagement * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.engagement}
            onChange={(e) => setWeights({ ...weights, engagement: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm font-semibold text-slate-200 mb-1">
            <span>Onboarding Category Preference (10%)</span>
            <span className="text-sky-400">{(weights.preference * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.preference}
            onChange={(e) => setWeights({ ...weights, preference: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm font-semibold text-slate-200 mb-1">
            <span>Feed Category Diversity (10%)</span>
            <span className="text-sky-400">{(weights.diversity * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.diversity}
            onChange={(e) => setWeights({ ...weights, diversity: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {isSaved ? (
            <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Recommendation weights updated!
            </span>
          ) : (
            <span className="text-slate-400 text-xs">Changes take effect immediately on feed generation.</span>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-md shadow-sky-600/20"
          >
            <Save className="w-4 h-4" />
            Save Weights Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
