import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, User, Bell, X, Sparkles, Clock, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  'General', 'Business', 'Technology', 'Sports', 'Entertainment', 'Science', 'Health'
];

export const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside as any);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const closeAll = () => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setMobileSearchOpen(false);
  };

  const handleCategoryClick = (cat: string) => {
    navigate(`/?category=${cat.toLowerCase()}`);
    closeAll();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                onClick={closeAll}
                className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400"
              >
                NEWSPULSE
              </Link>
            </div>

            {/* Desktop Categories */}
            <div className="hidden md:flex space-x-6 items-center overflow-x-auto ml-8">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  to={`/?category=${cat.toLowerCase()}`}
                  className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors whitespace-nowrap"
                >
                  {cat}
                </Link>
              ))}
            </div>

            {/* Search & Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-slate-900 border border-slate-700 rounded-full py-1.5 pl-4 pr-10 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400">
                  <Search size={16} />
                </button>
              </form>

              {/* Notifications Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
                  className={`p-2 transition-colors rounded-lg ${notificationsOpen ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-emerald-400'}`}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-1rem))] bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                        <Bell size={15} className="text-emerald-400" />
                        <span>Notifications</span>
                      </h3>
                      <button onClick={() => setNotificationsOpen(false)} className="text-slate-500 hover:text-white">
                        <X size={16} />
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto overflow-x-hidden">
                      {/* Welcome notification */}
                      <div className="p-4 border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles size={14} className="text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-200 font-medium">Welcome to NewsPulse!</p>
                            <p className="text-xs text-slate-500 mt-1">Your personalized AI-powered news feed is ready. Browse categories to customize your experience.</p>
                            <p className="text-[10px] text-slate-600 mt-1.5 flex items-center space-x-1">
                              <Clock size={10} />
                              <span>Just now</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Feed update notification */}
                      <div className="p-4 border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bell size={14} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-200 font-medium">News feed updated</p>
                            <p className="text-xs text-slate-500 mt-1">Latest headlines across all categories have been refreshed with new stories.</p>
                            <p className="text-[10px] text-slate-600 mt-1.5 flex items-center space-x-1">
                              <Clock size={10} />
                              <span>Recently</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border-t border-slate-800 text-center">
                      <p className="text-xs text-slate-500">You're all caught up!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
                  className={`p-2 transition-colors rounded-lg ${profileOpen ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-emerald-400'}`}
                  aria-label="User profile"
                >
                  <User size={20} />
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2">
                    <div className="p-5 border-b border-slate-800 text-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center mx-auto mb-3">
                        <User size={24} className="text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-white">Guest Reader</h3>
                      <p className="text-xs text-slate-500 mt-1">Browsing as anonymous user</p>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => { navigate('/'); closeAll(); }}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-800/60 transition-colors group"
                      >
                        <span className="text-sm text-slate-300 group-hover:text-white">My Feed</span>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-emerald-400" />
                      </button>
                      <button
                        onClick={() => { navigate('/?category=technology'); closeAll(); }}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-800/60 transition-colors group"
                      >
                        <span className="text-sm text-slate-300 group-hover:text-white">Saved Interests</span>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-emerald-400" />
                      </button>
                    </div>

                    <div className="p-3 border-t border-slate-800">
                      <p className="text-[11px] text-slate-600 text-center">Reading preferences are saved locally</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Menu */}
              <button
                onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setNotificationsOpen(false); setProfileOpen(false); }}
                className={`md:hidden p-2 transition-colors rounded-lg ${mobileMenuOpen ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-emerald-400'}`}
                aria-label="Mobile menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ────── Mobile Menu Overlay ────── */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-in Panel */}
          <div className="fixed top-16 right-0 bottom-0 z-50 w-[85%] max-w-xs bg-[#0f172a] border-l border-slate-800 shadow-2xl overflow-y-auto md:hidden"
               style={{ animation: 'slideInRight 0.25s ease-out' }}
          >
            {/* Mobile Search */}
            <div className="p-4 border-b border-slate-800">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-4 pr-10 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  autoFocus
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400">
                  <Search size={16} />
                </button>
              </form>
            </div>

            {/* Category Links */}
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600 px-3 mb-2">Categories</p>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all flex items-center justify-between group"
                >
                  <span>{cat}</span>
                  <ChevronRight size={14} className="text-slate-700 group-hover:text-emerald-400 transition-colors" />
                </button>
              ))}
            </div>

            {/* Mobile Quick Links */}
            <div className="p-3 border-t border-slate-800">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600 px-3 mb-2">Quick Links</p>
              <button
                onClick={() => { navigate('/'); closeAll(); }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                🏠 Home
              </button>
              <button
                onClick={() => { navigate('/?category=technology'); closeAll(); }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                🔥 Trending Tech
              </button>
              <button
                onClick={() => { navigate('/?category=sports'); closeAll(); }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                ⚽ Sports
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 mt-2">
              <p className="text-[11px] text-slate-600 text-center">
                © {new Date().getFullYear()} NewsPulse • AI-Powered News
              </p>
            </div>
          </div>
        </>
      )}

      {/* Slide-in animation keyframes injected once */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.5; }
          to   { transform: translateX(0);    opacity: 1;   }
        }
      `}</style>
    </>
  );
};
