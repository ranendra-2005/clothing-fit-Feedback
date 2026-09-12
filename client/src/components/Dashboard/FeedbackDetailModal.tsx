import React from 'react';
import { Feedback } from '../../types';
import { X, Sparkles, Star, Calendar, Tag, ShieldCheck, ArrowRight } from 'lucide-react';

interface FeedbackDetailModalProps {
  feedback: Feedback | null;
  onClose: () => void;
}

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({ feedback, onClose }) => {
  if (!feedback) return null;

  const { aiAnalysis } = feedback;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
              Customer Feedback Detail Record
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {feedback.product} ({feedback.garmentType}, Size {feedback.size})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-5 text-xs max-h-[70vh] overflow-y-auto pr-1">
          {/* Garment & Order Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Brand</span>
              <span className="font-bold text-white">{feedback.brand}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Size / Expected</span>
              <span className="font-bold text-white">
                {feedback.size} / {feedback.expectedSize}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Fit Preference</span>
              <span className="font-bold text-white">{feedback.fitPreference}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Date</span>
              <span className="font-bold text-slate-300">{feedback.timestamp.slice(0, 10)}</span>
            </div>
          </div>

          {/* Ratings Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Overall Fit</span>
              <span className="font-bold text-amber-400 text-sm mt-0.5 block">
                {feedback.overallRating} / 5 ★
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Comfort</span>
              <span className="font-bold text-amber-400 text-sm mt-0.5 block">
                {feedback.comfortRating} / 5 ★
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Size Accuracy</span>
              <span className="font-bold text-amber-400 text-sm mt-0.5 block">
                {feedback.sizeAccuracyRating} / 5 ★
              </span>
            </div>
          </div>

          {/* Customer Voice Comment */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Customer Statement:
            </span>
            <p className="text-sm text-slate-200 italic leading-relaxed">
              "{feedback.comment}"
            </p>
          </div>

          {/* AI Interpretation Box (Section 15 requirement) */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-950 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  AI Interpretation Breakdown
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                Engine: {aiAnalysis.engineUsed}
              </span>
            </div>

            <p className="text-xs text-indigo-200">
              {aiAnalysis.aiSummary}
            </p>

            {/* Extracted Areas Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {aiAnalysis.fitIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900 border border-rose-500/30 flex items-center justify-between"
                >
                  <span className="font-bold text-white">{issue.area}</span>
                  <span className="font-semibold text-rose-400">{issue.issue}</span>
                </div>
              ))}
              {aiAnalysis.positiveAreas.map((area, idx) => (
                <div
                  key={`pos-${idx}`}
                  className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between"
                >
                  <span className="font-bold text-white">{area}</span>
                  <span className="font-semibold text-emerald-400">Fits Correctly</span>
                </div>
              ))}
            </div>

            {/* Sentiment & Severity badges */}
            <div className="flex flex-wrap gap-2 pt-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                Sentiment: <strong>{aiAnalysis.sentiment}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                Severity: <strong>{aiAnalysis.severity}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                Return Intent: <strong>{feedback.returnReason}</strong>
              </span>
            </div>
          </div>

          {/* Uploaded Image (if present) */}
          {feedback.imageUrl && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Customer Fit Photo:
              </span>
              <img
                src={feedback.imageUrl}
                alt="Fit defect inspection"
                className="max-h-60 rounded-xl object-contain border border-slate-800 mx-auto"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close Detail View
          </button>
        </div>
      </div>
    </div>
  );
};
