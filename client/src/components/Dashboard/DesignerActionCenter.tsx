import React, { useState, useEffect } from 'react';
import { DesignerActionSpec } from '../../types';
import { fetchDesignerActionPlan } from '../../api/client';
import {
  Ruler,
  AlertTriangle,
  BookOpen,
  Lightbulb,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';

export const DesignerActionCenter: React.FC = () => {
  const [actionPlan, setActionPlan] = useState<DesignerActionSpec | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDesignerActionPlan()
      .then((data) => {
        setActionPlan(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
        Loading technical measurement specs and pattern revisions...
      </div>
    );
  }

  if (!actionPlan) return null;

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <Ruler className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-bold text-white">Designer Action Center & Spec Sheet</h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Direct engineering tolerances and pattern grading adjustments ready for technical design handoff.
        </p>
      </div>

      {/* 1. Problems to Fix */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Critical Problems to Fix
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actionPlan.problemsToFix.map((prob, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {prob.severity}
                </span>
                <span className="text-xs font-bold text-white">
                  {prob.garment} ({prob.size})
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-200">{prob.title}</p>
              <p className="text-[11px] text-pink-400 font-medium">Urgency: {prob.urgency}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Recommended Measurement Changes Table */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Recommended Measurement Changes (Tech Pack Deltas)
          </h4>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Garment & Size</th>
                <th className="p-3">Point of Measure</th>
                <th className="p-3">Current Spec</th>
                <th className="p-3">Recommended Spec</th>
                <th className="p-3">Adjustment (&Delta;)</th>
                <th className="p-3">Design Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {actionPlan.measurementChanges.map((spec, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">
                    {spec.garment} <span className="text-slate-400 font-normal">({spec.size})</span>
                  </td>
                  <td className="p-3 text-slate-300">{spec.measurementPoint}</td>
                  <td className="p-3 text-slate-400 font-mono">{spec.currentSpec}</td>
                  <td className="p-3 text-emerald-300 font-mono font-bold">{spec.recommendedSpec}</td>
                  <td className="p-3">
                    <span
                      className={`font-mono font-extrabold px-2 py-0.5 rounded ${
                        spec.delta.startsWith('+')
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {spec.delta}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 max-w-xs">{spec.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Recommended Size Chart Changes */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            3. Recommended E-Commerce Size Chart Updates
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actionPlan.sizeChartChanges.map((sc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
            >
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block">
                {sc.garment}
              </span>
              <p className="text-xs font-semibold text-white leading-relaxed">{sc.recommendation}</p>
              <p className="text-[11px] text-slate-400 italic">Impact: {sc.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Future Collection Suggestions & 5. Customer Segments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Future Collection Suggestions */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400">
            <Lightbulb className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              4. Future Collection Suggestions
            </h4>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {actionPlan.futureCollectionSuggestions.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Segments to Investigate */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Users className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              5. Customer Segments to Investigate
            </h4>
          </div>
          <div className="space-y-3 text-xs">
            {actionPlan.customerSegmentsToInvestigate.map((seg, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-indigo-300 block">{seg.segment}</span>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  <strong>Pain Point:</strong> {seg.primaryComplaint}
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  <strong>Recommended Focus:</strong> {seg.recommendedFocus}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
