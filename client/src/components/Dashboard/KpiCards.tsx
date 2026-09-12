import React from 'react';
import { AnalyticsMetrics } from '../../types';
import {
  Users,
  Star,
  AlertTriangle,
  RotateCcw,
  Target,
  Maximize2,
  TrendingUp,
} from 'lucide-react';

interface KpiCardsProps {
  metrics: AnalyticsMetrics;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {/* 1. Total Feedback */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Total Feedback</span>
          <Users className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="text-2xl font-extrabold text-white">{metrics.totalFeedback}</p>
        <p className="text-[10px] text-emerald-400 mt-1 flex items-center space-x-1">
          <TrendingUp className="w-3 h-3 inline" />
          <span>Live Synchronized</span>
        </p>
      </div>

      {/* 2. Average Fit Rating */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Fit Rating</span>
          <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
        </div>
        <div className="flex items-baseline space-x-1">
          <p className="text-2xl font-extrabold text-white">{metrics.avgOverallRating}</p>
          <span className="text-xs text-slate-500">/ 5.0</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Comfort: {metrics.avgComfortRating} ★
        </p>
      </div>

      {/* 3. Fit Issue Rate */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Fit Issue Rate</span>
          <AlertTriangle className="w-4 h-4 text-pink-400" />
        </div>
        <p className="text-2xl font-extrabold text-pink-400">{metrics.fitIssueRate}%</p>
        <p className="text-[10px] text-slate-400 mt-1">
          Of buyers cite defects
        </p>
      </div>

      {/* 4. Return Rate */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Return Rate</span>
          <RotateCcw className="w-4 h-4 text-rose-400" />
        </div>
        <p className="text-2xl font-extrabold text-rose-400">{metrics.returnRate}%</p>
        <p className="text-[10px] text-slate-400 mt-1">
          Fit & size returns
        </p>
      </div>

      {/* 5. Top Reported Issue */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Top Issue</span>
          <Target className="w-4 h-4 text-amber-400" />
        </div>
        <p className="text-sm font-extrabold text-amber-300 truncate" title={metrics.topIssue}>
          {metrics.topIssue}
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Highest frequency
        </p>
      </div>

      {/* 6. Most Affected Size */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Affected Size</span>
          <Maximize2 className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="text-xl font-extrabold text-indigo-300">{metrics.mostAffectedSize}</p>
        <p className="text-[10px] text-slate-400 mt-1">
          Normalized issue %
        </p>
      </div>
    </div>
  );
};
