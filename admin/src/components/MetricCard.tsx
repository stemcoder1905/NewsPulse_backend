import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'sky'
}) => {
  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 flex items-start justify-between shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-100">{value}</h3>
        {subtext && <p className="text-xs text-emerald-400 mt-2 font-medium">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-slate-800/80 text-${color}-400 border border-slate-700/50`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
