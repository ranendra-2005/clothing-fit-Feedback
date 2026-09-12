import React from 'react';
import {
  Sparkles,
  BarChart3,
  UserCheck,
  Presentation,
  RotateCcw,
  Download,
  QrCode,
  Share2,
} from 'lucide-react';

interface NavbarProps {
  activeView: 'landing' | 'feedback' | 'dashboard' | 'presentation';
  onNavigate: (view: 'landing' | 'feedback' | 'dashboard' | 'presentation') => void;
  onResetDemo: () => void;
  onExport: () => void;
  onOpenShareModal: () => void;
  isResetting?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  onResetDemo,
  onExport,
  onOpenShareModal,
  isResetting,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-pink-400 bg-clip-text text-transparent">
                FitPulse
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400">
                Fashion for People
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Clothing Fit Feedback & Intelligence System
            </p>
          </div>
        </div>

        {/* Navigation / Role Switcher */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeView === 'landing'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => onNavigate('feedback')}
            className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeView === 'feedback'
                ? 'bg-pink-600/20 border border-pink-500/50 text-pink-300 shadow-sm'
                : 'text-slate-400 hover:text-pink-300 hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Customer Flow</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeView === 'dashboard'
                ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 shadow-sm'
                : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Brand Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('presentation')}
            className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeView === 'presentation'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-700/60'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Judge</span>
            <span>Presentation</span>
          </button>
        </nav>

        {/* Participant Share & Demo Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Highlighted Participant Share Button */}
          <button
            onClick={onOpenShareModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:to-indigo-500/30 border border-pink-500/40 text-pink-300 text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            title="Invite hackathon participants to submit feedback via QR code or direct link"
          >
            <QrCode className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span className="hidden sm:inline">Invite Participants</span>
            <span className="sm:hidden">Share QR</span>
          </button>

          {/* Reset Demo */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset to 175 realistic sample records"
            className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin text-pink-400' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo'}</span>
          </button>

          {/* Export */}
          <button
            onClick={onExport}
            title="Export Insights & CSV"
            className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <Download className="w-3 h-3 text-pink-400" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
