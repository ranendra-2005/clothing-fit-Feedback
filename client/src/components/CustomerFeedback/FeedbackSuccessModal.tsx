import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Feedback } from '../../types';
import { CheckCircle2, ArrowRight, Sparkles, RefreshCw, BarChart2, ShieldCheck } from 'lucide-react';

interface FeedbackSuccessModalProps {
  feedback: Feedback;
  onViewDashboard: () => void;
  onResetForm: () => void;
}

export const FeedbackSuccessModal: React.FC<FeedbackSuccessModalProps> = ({
  feedback,
  onViewDashboard,
  onResetForm,
}) => {
  useEffect(() => {
    // Launch celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#6366f1', '#10b981', '#f59e0b'],
    });
  }, []);

  const { aiAnalysis } = feedback;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Thank you!
          </h2>
          <p className="text-sm font-medium text-emerald-400">
            Your feedback has been converted into structured fit insights.
          </p>
          <p className="text-xs text-slate-400">
            Garment: <span className="text-white font-semibold">{feedback.product}</span> ({feedback.garmentType}, Size {feedback.size})
          </p>
        </div>

        {/* AI Extraction Card */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                AI Fit Intelligence Output
              </span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {aiAnalysis.engineUsed}
            </span>
          </div>

          {/* AI Summary Statement */}
          <p className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            "{aiAnalysis.aiSummary}"
          </p>

          {/* Extracted Fit Issues */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase">
              Identified Fit Issues:
            </span>
            {aiAnalysis.fitIssues.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {aiAnalysis.fitIssues.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium"
                  >
                    <span>{item.area}:</span>
                    <span className="font-bold">{item.issue}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500">No critical fit defects detected.</span>
            )}
          </div>

          {/* Positive Areas */}
          {aiAnalysis.positiveAreas.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase">
                Well-Fitting Areas:
              </span>
              <div className="flex flex-wrap gap-2">
                {aiAnalysis.positiveAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                  >
                    {area} (Good Fit)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meta Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-900">
              <span className="text-[10px] uppercase text-slate-400 block">Sentiment</span>
              <span
                className={`text-xs font-bold ${
                  aiAnalysis.sentiment === 'Positive'
                    ? 'text-emerald-400'
                    : aiAnalysis.sentiment === 'Neutral'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {aiAnalysis.sentiment}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900">
              <span className="text-[10px] uppercase text-slate-400 block">Severity</span>
              <span
                className={`text-xs font-bold ${
                  aiAnalysis.severity === 'High'
                    ? 'text-rose-400'
                    : aiAnalysis.severity === 'Medium'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {aiAnalysis.severity}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900">
              <span className="text-[10px] uppercase text-slate-400 block">Rating</span>
              <span className="text-xs font-bold text-white">
                {feedback.overallRating} / 5 ★
              </span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onViewDashboard}
            className="flex-1 flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-opacity"
          >
            <BarChart2 className="w-4 h-4" />
            <span>View on Brand Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onResetForm}
            className="flex items-center justify-center space-x-1.5 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Submit Another</span>
          </button>
        </div>
      </div>
    </div>
  );
};
