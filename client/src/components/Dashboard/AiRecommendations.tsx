import React, { useState } from 'react';
import { Recommendation } from '../../types';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Filter,
  Check,
  Tag,
  Ruler,
} from 'lucide-react';

interface AiRecommendationsProps {
  recommendations: Recommendation[];
}

export const AiRecommendations: React.FC<AiRecommendationsProps> = ({ recommendations }) => {
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const filteredRecs =
    priorityFilter === 'ALL'
      ? recommendations
      : recommendations.filter((r) => r.priority === priorityFilter);

  const handleStatusChange = (id: string, newStatus: string) => {
    setLocalStatuses((prev) => ({ ...prev, [id]: newStatus }));
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Actionable Design Recommendations</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Synthesized engineering adjustments derived from customer feedback patterns and return risk analysis.
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                priorityFilter === p
                  ? 'bg-pink-600/30 text-pink-300 border border-pink-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => {
          const status = localStatuses[rec.id] || rec.status || 'Proposed';

          return (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(
                      rec.priority
                    )}`}
                  >
                    {rec.priority} PRIORITY
                  </span>
                  <span className="text-xs font-bold text-white">
                    {rec.garmentType} {rec.targetSize && `(${rec.targetSize})`}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    Category: {rec.category}
                  </span>
                </div>

                {/* Tech Pack Status Switcher */}
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">Spec Status:</span>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(rec.id, e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-pink-300 outline-none"
                  >
                    <option value="Proposed">Proposed</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Applied to Tech Pack">Applied to Tech Pack</option>
                  </select>
                </div>
              </div>

              {/* Problem Title */}
              <div>
                <h4 className="text-base font-bold text-white">{rec.problem}</h4>
              </div>

              {/* Evidence */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Supporting Empirical Evidence:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {rec.evidence}
                </p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                  <span>
                    Affected Customers: <strong className="text-pink-400">{rec.affectedCustomersPercent}%</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Complaints Logged: <strong className="text-white">{rec.affectedCount}</strong>
                  </span>
                </div>
              </div>

              {/* Suggested Action & Expected Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1">
                  <div className="flex items-center space-x-1.5 text-indigo-300 text-xs font-bold">
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Suggested Action (Tech Pack Adjustment):</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {rec.suggestedAction}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-300 text-xs font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Expected Business Impact:</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {rec.expectedImpact}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
