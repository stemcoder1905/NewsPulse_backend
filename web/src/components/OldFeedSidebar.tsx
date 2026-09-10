import React from 'react';
import { Clock, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ReadArticleRecord, UserInterestProfile } from '../utils/userInterestTracker';

interface OldFeedSidebarProps {
  oldFeed: ReadArticleRecord[];
  userProfile?: UserInterestProfile;
  onClearHistory: () => void;
}

export const OldFeedSidebar: React.FC<OldFeedSidebarProps> = ({
  oldFeed,
  onClearHistory
}) => {
  return (
    <aside className="w-full flex flex-col space-y-6">
      {/* Old Feed (Reading History List) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col flex-1">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <h3 className="font-black text-slate-100 text-lg tracking-tight">Old Feed</h3>
            <span className="text-xs text-slate-500 font-medium">(Read History)</span>
          </div>
          {oldFeed.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center space-x-1 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
              title="Clear Reading History"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {oldFeed.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Clock size={20} />
            </div>
            <h4 className="font-bold text-slate-300 text-sm mb-1">Old Feed is Empty</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[220px] mx-auto">
              Articles you click to read will be moved into this Old Feed column automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
            {oldFeed.map((article) => (
              <a
                key={article._id || article.articleUrl}
                href={article.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-all duration-200"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                  <span className="text-emerald-400 capitalize px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {article.category || 'News'}
                  </span>
                  <span className="flex items-center text-slate-500">
                    <Clock size={11} className="mr-1" />
                    {article.readAt ? formatDistanceToNow(new Date(article.readAt), { addSuffix: true }) : 'Recently'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug mb-1">
                  {article.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800/60">
                  <span className="truncate max-w-[150px]">{article.sourceName || 'Source'}</span>
                  <span className="text-emerald-400 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    Re-read <ExternalLink size={11} className="ml-1" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

