import React from 'react';
import { LayoutDashboard, Newspaper, Sliders, Megaphone, RefreshCw } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onTriggerRefresh: () => void;
  isRefreshing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onTriggerRefresh,
  isRefreshing
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview Analytics', icon: LayoutDashboard },
    { id: 'news', label: 'News Management', icon: Newspaper },
    { id: 'recommendations', label: 'AI Rec Engine Weights', icon: Sliders },
    { id: 'ads', label: 'Ad Configuration', icon: Megaphone }
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between p-4">
      <div>
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-100">NEWSPULSE</h1>
            <p className="text-xs text-slate-400">Admin Control Panel</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={onTriggerRefresh}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-sky-600/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Syncing News...' : 'Manual News Refresh'}
        </button>
      </div>
    </aside>
  );
};
