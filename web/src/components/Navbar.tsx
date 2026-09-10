import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, User, Bell } from 'lucide-react';

const CATEGORIES = [
  'General', 'Business', 'Technology', 'Sports', 'Entertainment', 'Science', 'Health'
];

export const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
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
          <div className="flex items-center space-x-4 ml-auto">
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
            
            <button className="p-2 text-slate-400 hover:text-emerald-400 transition-colors">
              <Bell size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-emerald-400 transition-colors">
              <User size={20} />
            </button>
            <button className="md:hidden p-2 text-slate-400 hover:text-emerald-400 transition-colors">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
