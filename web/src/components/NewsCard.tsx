import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Article } from '../services/api';
import { Clock, ExternalLink, Sparkles } from 'lucide-react';
import {
  generateEditorialThumbnail,
  resolveUniqueArticleThumbnail
} from '../utils/thumbnailGenerator';
import { format60WordSummary } from '../utils/summaryFormatter';

interface NewsCardProps {
  article: Article;
  displayThumbnail?: string;
  featured?: boolean;
  isPrioritized?: boolean;
  recommendationReason?: string;
  onArticleClick?: (article: Article) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  displayThumbnail,
  featured = false,
  isPrioritized = false,
  recommendationReason,
  onArticleClick
}) => {
  // Use passed unique thumbnail (from page-level deduplication) or generate on demand
  const displayImage = displayThumbnail || resolveUniqueArticleThumbnail(article, new Set());

  const handleClick = () => {
    if (onArticleClick) {
      onArticleClick(article);
    }
  };

  const summary60Words = format60WordSummary(article);

  return (
    <article className={`group flex flex-col bg-slate-900 rounded-2xl overflow-hidden border ${isPrioritized ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' : 'border-slate-800 hover:border-slate-700'} transition-all duration-300 ${featured ? 'md:flex-row md:col-span-2' : ''}`}>
      <a 
        href={article.articleUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={handleClick}
        className={`relative overflow-hidden block ${featured ? 'md:w-1/2' : 'w-full aspect-video'}`}
      >
        <img 
          src={displayImage} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { 
            const target = e.target as HTMLImageElement;
            if (target.dataset.failedOnce) return;
            target.dataset.failedOnce = 'true';
            // Even if an external image fails to load, design a custom editorial SVG specifically for this headline!
            target.src = generateEditorialThumbnail(article); 
          }}
        />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
            {article.category || 'News'}
          </span>
          {isPrioritized && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center">
              <Sparkles size={11} className="mr-1" />
              Prioritized
            </span>
          )}
        </div>
      </a>

      <div className={`p-6 flex flex-col flex-1 ${featured ? 'md:w-1/2' : ''}`}>
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-3 font-medium">
          <span className="text-emerald-400">{article.sourceName || 'Unknown Source'}</span>
          <span>•</span>
          <span className="flex items-center">
            <Clock size={12} className="mr-1" />
            {article.publishedAt ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true }) : 'Recently'}
          </span>
        </div>

        <h3 className={`font-bold text-slate-100 mb-3 group-hover:text-emerald-400 transition-colors ${featured ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
          <a href={article.articleUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
            {article.title}
          </a>
        </h3>

        <p className={`text-slate-300 mb-4 leading-relaxed font-normal ${featured ? 'text-sm md:text-base' : 'text-sm'}`}>
          {summary60Words}
        </p>

        {recommendationReason && (
          <p className="text-[11px] text-amber-400/90 font-medium mb-3 flex items-center">
            <Sparkles size={11} className="mr-1 text-amber-400" />
            {recommendationReason}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">
              {article.provider === 'mediastack' ? '⚡ Mediastack' : '🤖 AI Curated'}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              60-70 Words
            </span>
          </div>
          <a 
            href={article.articleUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={handleClick}
            className="flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Read full story <ExternalLink size={14} className="ml-1" />
          </a>
        </div>
      </div>
    </article>
  );
};
