import React, { useState } from 'react';
import { adminApi } from '../services/api';
import { Save, CheckCircle2, Megaphone } from 'lucide-react';

export const AdSettings: React.FC = () => {
  const [adFreq, setAdFreq] = useState(5);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    try {
      await adminApi.put('/config', { adFrequency: adFreq });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      alert('Failed to update ad frequency');
    }
  };

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">AIMLADS Ad Server & Frequency Settings</h2>
          <p className="text-xs text-slate-400">Configure sponsored ad frequency and contextual monetization rules.</p>
        </div>
      </div>

      <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Megaphone className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-sm text-indigo-200">Active Provider: AIMLadsProvider</h3>
        </div>
        <p className="text-xs text-indigo-300/80 leading-relaxed">
          The application requests privacy-aware contextual ads matching the user's top interest categories (e.g. Sports/Cricket ads for sports readers, SaaS/Finance ads for tech/business readers).
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          Ad Frequency (Cards consumed before inserting 1 Sponsored Ad):
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="1"
            max="30"
            value={adFreq}
            onChange={(e) => setAdFreq(parseInt(e.target.value, 10) || 5)}
            className="w-32 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 font-bold text-lg focus:outline-none focus:border-sky-500"
          />
          <span className="text-sm text-slate-400">Default: 5 cards</span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        {isSaved ? (
          <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Ad frequency updated!
          </span>
        ) : (
          <span className="text-slate-400 text-xs">Controls how often Ad Cards appear in the feed.</span>
        )}

        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-md shadow-sky-600/20"
        >
          <Save className="w-4 h-4" />
          Save Ad Configuration
        </button>
      </div>
    </div>
  );
};
