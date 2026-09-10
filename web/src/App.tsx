import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { ArticleDetail } from './pages/ArticleDetail';

export function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#0a0f1e]">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
          </Routes>
        </main>
        
        <footer className="bg-[#0f172a] border-t border-slate-800 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4 inline-block">
              NEWSPULSE
            </p>
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} NEWSPULSE. Real-time news powered by Mediastack and AI.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
