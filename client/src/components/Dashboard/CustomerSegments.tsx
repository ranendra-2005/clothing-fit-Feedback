import React, { useState } from 'react';
import { Feedback, FitPreference } from '../../types';
import { Users, Filter, CheckCircle2, AlertTriangle, Star } from 'lucide-react';

interface CustomerSegmentsProps {
  feedbacks: Feedback[];
}

export const CustomerSegments: React.FC<CustomerSegmentsProps> = ({ feedbacks }) => {
  const [selectedPreference, setSelectedPreference] = useState<FitPreference | 'ALL'>('ALL');

  const preferences: FitPreference[] = ['Slim', 'Regular', 'Relaxed', 'Oversized'];

  // Compute metrics per segment
  const segmentStats = preferences.map((pref) => {
    const list = feedbacks.filter((f) => f.fitPreference === pref);
    const total = list.length || 1;
    const issues = list.filter((f) => f.bodyAreas.some((b) => b.issue !== 'Fits Correctly'));
    const issueRate = Math.round((issues.length / total) * 100);
    const avgRating = Number(
      (list.reduce((acc, f) => acc + f.overallRating, 0) / total).toFixed(1)
    );

    // Top area of complaint for this segment
    const areaCounts: Record<string, number> = {};
    for (const f of list) {
      for (const b of f.bodyAreas) {
        if (b.issue !== 'Fits Correctly') {
          areaCounts[b.area] = (areaCounts[b.area] || 0) + 1;
        }
      }
    }
    const topArea =
      Object.entries(areaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    return {
      preference: pref,
      totalCount: list.length,
      issueRate,
      avgRating,
      topArea,
    };
  });

  const displayFeedbacks =
    selectedPreference === 'ALL'
      ? feedbacks.slice(0, 8)
      : feedbacks.filter((f) => f.fitPreference === selectedPreference).slice(0, 8);

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-bold text-white">Customer Fit Preference Segmentation</h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Compare fit defect vulnerability across customer preference profiles (Slim, Regular, Relaxed, Oversized).
        </p>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {segmentStats.map((stat) => (
          <div
            key={stat.preference}
            onClick={() => setSelectedPreference(stat.preference)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedPreference === stat.preference
                ? 'bg-pink-950/30 border-pink-500 scale-[1.02]'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {stat.preference} Fit
              </span>
              <span className="text-[11px] text-slate-400">{stat.totalCount} records</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Problem Rate:</span>
                <span className="font-extrabold text-pink-400">{stat.issueRate}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Avg Rating:</span>
                <span className="font-bold text-amber-400">{stat.avgRating} ★</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">Top Defect Area:</span>
                <span className="font-bold text-slate-200">{stat.topArea}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Segment Feedback Showcase */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Sample Customer Comments for {selectedPreference === 'ALL' ? 'All Segments' : `${selectedPreference}-Fit Cohort`}:
          </span>
          {selectedPreference !== 'ALL' && (
            <button
              onClick={() => setSelectedPreference('ALL')}
              className="text-xs text-pink-400 hover:text-pink-300"
            >
              Show All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayFeedbacks.map((f) => (
            <div
              key={f.id}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">
                  {f.garmentType} ({f.size}) • {f.fitPreference}
                </span>
                <span className="text-amber-400 font-bold">{f.overallRating} ★</span>
              </div>
              <p className="text-slate-300 italic">"{f.comment}"</p>
              <div className="flex flex-wrap gap-1">
                {f.bodyAreas.map((b, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                  >
                    {b.area}: {b.issue}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
