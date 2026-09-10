import React, { useEffect } from 'react';
import { X, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { TargetedAd } from '../services/adService';

interface AdModalProps {
  ad: TargetedAd;
  isOpen: boolean;
  onClose: () => void;
  matchedCategory?: string | null;
}

export const AdModal: React.FC<AdModalProps> = ({ ad, isOpen, onClose, matchedCategory }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          title="Close Ad"
        >
          <X size={18} />
        </button>

        {/* Sponsor Banner Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-800">
          <img
            src={ad.imageUrl}
            alt={ad.headline}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />

          {/* Targeted Category Match Badge */}
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/90 text-white shadow-lg backdrop-blur-sm">
              <Sparkles size={12} className="mr-1.5" />
              Tailored for You
            </span>
            {matchedCategory && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700/80 capitalize backdrop-blur-sm">
                Interest: {matchedCategory}
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-4 flex items-center space-x-1.5 text-xs text-slate-300 bg-black/50 px-2.5 py-1 rounded-md backdrop-blur-sm">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Sponsored by {ad.sponsorName}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <p className="text-xs font-semibold tracking-wider text-emerald-400 uppercase mb-1">
            Special Recommendation
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug mb-2">
            {ad.headline}
          </h2>
          <p className="text-sm font-medium text-slate-300 mb-3">
            {ad.tagline}
          </p>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            {ad.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href={ad.sponsorUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all text-center flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            >
              <span>{ad.ctaText}</span>
              <ExternalLink size={16} />
            </a>
            <button
              onClick={onClose}
              className="w-full sm:w-auto py-3.5 px-5 rounded-xl font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 transition-colors text-center text-sm"
            >
              Continue to Article
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

