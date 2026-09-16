import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArticle, Article } from '../services/api';
import { Clock, ExternalLink, ArrowLeft, Share2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { resolveUniqueArticleThumbnail, generateEditorialThumbnail } from '../utils/thumbnailGenerator';
import { format60WordSummary } from '../utils/summaryFormatter';

export const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetchArticle(id);
        if (res.data?.success) {
          setArticle(res.data.data.article);
        } else {
          setError('Failed to load article.');
        }
      } catch (err: any) {
        setError('Article not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-slate-800 rounded w-1/4 mb-8"></div>
        <div className="h-96 bg-slate-800 rounded-2xl mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-5/6"></div>
          <div className="h-4 bg-slate-800 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Oops!</h2>
        <p className="text-slate-400 mb-8">{error || 'Article not found.'}</p>
        <Link to="/" className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white rounded-full font-semibold hover:bg-emerald-600 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors mb-8">
        <ArrowLeft size={16} className="mr-2" /> Back to top stories
      </Link>

      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
            {article.category || 'News'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-sm font-medium text-slate-400">{article.sourceName || 'Unknown Source'}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight mb-6">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-slate-300">{article.sourceName?.charAt(0) || 'N'}</span>
            </div>
            <div>
              <p className="font-medium text-slate-200">{article.author || article.sourceName}</p>
              <div className="flex items-center text-xs text-slate-400 mt-0.5">
                <Clock size={12} className="mr-1" />
                {article.publishedAt ? format(new Date(article.publishedAt), 'MMMM d, yyyy • h:mm a') : 'Recently published'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2.5 rounded-full bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" title="Share">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <figure className="mb-10 relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
        <img 
          src={article.imageUrl || resolveUniqueArticleThumbnail(article, new Set())} 
          alt={article.title}
          className="w-full h-auto max-h-[600px] object-cover"
          onError={(e) => { 
            const target = e.target as HTMLImageElement;
            if (target.dataset.failedOnce) return;
            target.dataset.failedOnce = 'true';
            target.src = generateEditorialThumbnail(article); 
          }}
        />
      </figure>

      <div className="prose prose-invert prose-lg max-w-none prose-p:text-slate-300 prose-p:leading-relaxed mb-12">
        <div className="inline-flex items-center space-x-2 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <span>⚡ 60-70 Word Story Brief</span>
        </div>
        <p className="text-xl text-slate-100 font-normal leading-relaxed mb-8">
          {format60WordSummary(article)}
        </p>
      </div>

      {/* Embedded Full Article */}
      <div className="mt-8 border-t border-slate-800 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-100">Full Article</h3>
          <a 
            href={article.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm flex items-center text-emerald-400 hover:text-emerald-300"
          >
            Open in new tab if it doesn't load <ExternalLink size={14} className="ml-1" />
          </a>
        </div>
        
        <div className="w-full bg-white rounded-xl overflow-hidden border border-slate-700 h-[800px]">
          <iframe 
            src={`http://localhost:5000/api/v1/news/proxy?url=${encodeURIComponent(article.articleUrl)}`} 
            title="Full News Article"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </article>
  );
};
