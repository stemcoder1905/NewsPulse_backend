import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Trash2, Edit3, ExternalLink } from 'lucide-react';

export const NewsManagement: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNews = async () => {
    try {
      const res = await adminApi.get('/news?limit=30');
      if (res.data?.data?.articles) {
        setArticles(res.data.data.articles);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to soft-delete this article?')) return;
    try {
      await adminApi.delete(`/news/${id}`);
      setArticles(articles.filter((a) => a._id !== id));
    } catch (e) {
      alert('Failed to delete article');
    }
  };

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">News Ingestion Catalog</h2>
          <p className="text-xs text-slate-400">Manage and moderate ingested short news stories.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-400">Loading ingested news catalog...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Provider</th>
                <th className="p-3">Published</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {articles.map((art) => (
                <tr key={art._id} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <div className="font-semibold text-slate-200 line-clamp-1">{art.title}</div>
                    <div className="text-xs text-slate-400 line-clamp-1">{art.shortSummary}</div>
                  </td>
                  <td className="p-3">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-sky-500/10 text-sky-400 rounded-full border border-sky-500/20 capitalize">
                      {art.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 uppercase text-xs font-bold">{art.provider}</td>
                  <td className="p-3 text-slate-400 text-xs">{new Date(art.publishedAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right space-x-2">
                    <a
                      href={art.articleUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block p-1.5 text-slate-400 hover:text-sky-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(art._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
