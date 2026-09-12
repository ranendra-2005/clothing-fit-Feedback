import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Layers,
  BarChart3,
  Cpu,
  Target,
  Ruler,
  TrendingDown,
  CheckCircle2,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { AnalyticsMetrics } from '../types';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'feedback' | 'dashboard' | 'presentation') => void;
  metrics: AnalyticsMetrics | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, metrics }) => {
  return (
    <div className="relative overflow-hidden py-10 sm:py-16">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-pink-600/20 via-rose-500/10 to-indigo-600/20 blur-[120px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Track Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-pink-500/30 text-pink-300 text-xs font-medium shadow-inner">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span>Hackathon Track: Fashion for People</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">End-to-End Working MVP</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Turn Clothing Fit Feedback{' '}
            <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-indigo-400 bg-clip-text text-transparent">
              Into Better Fashion.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            An intelligent feedback and analytics platform that transforms customer fit experiences
            into actionable insights for brands and designers.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('feedback')}
              className="flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-semibold text-base shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Give Feedback</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-base border border-slate-700/80 hover:bg-slate-800 hover:border-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>View Brand Insights</span>
            </button>

            <button
              onClick={() => onNavigate('presentation')}
              className="flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-indigo-950/40 text-indigo-300 font-medium text-base border border-indigo-500/30 hover:bg-indigo-900/30 transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Judge Presentation Mode</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Ticker Bar */}
        {metrics && metrics.totalFeedback > 0 && (
          <div className="mt-14 max-w-5xl mx-auto p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Feedback Captured
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {metrics.totalFeedback}
              </p>
              <p className="text-[11px] text-emerald-400 mt-0.5">Persisted in Live DB</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Fit Issue Rate
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-pink-400 mt-1">
                {metrics.fitIssueRate}%
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Identified via AI NLP</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Top Issue Detected
              </p>
              <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1 truncate px-2">
                {metrics.topIssue}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Most affected: Size {metrics.mostAffectedSize.split(' ')[0]}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Return Rate
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-rose-400 mt-1">
                {metrics.returnRate}%
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Fit/Sizing Related</p>
            </div>
          </div>
        )}

        {/* 3 Core Value Pillars (Capture -> Understand -> Improve) */}
        <div className="mt-16 sm:mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              From Unstructured Complaints to Precision Garment Specs
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Closing the broken feedback loop between what customers feel and what designers cut.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1: Capture */}
            <div className="relative p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-pink-400">
                Step 1: Capture
              </span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">
                Structured Fit Feedback
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Customers pinpoint exact body zones (shoulders, sleeves, chest, rise) on an
                interactive silhouette without tedious typing or invasive full-body photos.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                  <span>Interactive body zone selector</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                  <span>1–5 star ratings for comfort & size</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                  <span>Privacy-first optional photo upload</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Understand */}
            <div className="relative p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400">
                Step 2: Understand
              </span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">
                AI Feedback Intelligence
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Converts messy reviews, return reasons, and unstructured comments into normalized
                garment defect patterns using Gemini and instant rule-based NLP.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Compound clause & negation extraction</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sentiment & defect severity scoring</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Visual body area heatmap clustering</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Improve */}
            <div className="relative p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Ruler className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">
                Step 3: Improve
              </span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">
                Actionable Design Specs
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Translates customer discontent into engineering measurements: point-to-point deltas
                (+1.5 cm shoulder width, -2 cm waist) ready for factory tech packs.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Size-specific comparative analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Prioritized HIGH/MED/LOW design fixes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Measurable return rate reductions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Role Selection Demonstration Cards */}
        <div className="mt-20 max-w-4xl mx-auto p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white">Choose an Experience to Explore</h3>
            <p className="text-slate-400 text-sm mt-1">
              Switch seamlessly between customer submission and brand analytics anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div
              onClick={() => onNavigate('feedback')}
              className="p-6 rounded-2xl bg-slate-950 border border-pink-500/30 hover:border-pink-500 cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-pink-400 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="text-lg font-bold text-white">Continue as Customer</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Test the mobile-friendly 7-step feedback form, select problem areas on the body
                silhouette, and observe instant AI extraction.
              </p>
            </div>

            <div
              onClick={() => onNavigate('dashboard')}
              className="p-6 rounded-2xl bg-slate-950 border border-indigo-500/30 hover:border-indigo-500 cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-indigo-400 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="text-lg font-bold text-white">Continue as Brand / Designer</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Explore real-time KPI metrics, size-specific defect comparisons, dynamic body
                heatmaps, and prioritized design recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
