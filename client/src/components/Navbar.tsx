import React, { useState } from 'react';
import {
  Sparkles,
  BarChart3,
  UserCheck,
  Presentation,
  RotateCcw,
  Download,
  QrCode,
  Camera,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  Shield,
  Briefcase,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeView: 'landing' | 'feedback' | 'dashboard' | 'presentation' | 'participant' | 'admin' | 'admin_qr' | 'scanner';
  onNavigate: (view: any) => void;
  onResetDemo: () => void;
  onExport: () => void;
  onOpenShareModal: () => void;
  onOpenAuthModal: () => void;
  isResetting?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  onResetDemo,
  onExport,
  onOpenShareModal,
  onOpenAuthModal,
  isResetting,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);

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

          {/* AI Size Scanner Highlighted Button */}
          <button
            onClick={() => onNavigate('scanner')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
              activeView === 'scanner'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-pink-500/30'
                : 'bg-pink-950/40 text-pink-300 border border-pink-500/40 hover:bg-pink-900/40'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>AI Size Scanner</span>
          </button>

          <button
            onClick={() => onNavigate('participant')}
            className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeView === 'participant'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Participant Flow</span>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeView === 'admin' || activeView === 'admin_qr'
                ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 shadow-sm'
                : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>Admin QR Hub</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeView === 'dashboard'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Brand Heatmap</span>
            <span className="md:hidden">Dashboard</span>
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

        {/* Right Controls & Auth Profile */}
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

          {/* Export */}
          <button
            onClick={onExport}
            title="Export Insights & CSV"
            className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <Download className="w-3 h-3 text-pink-400" />
            <span>Export</span>
          </button>

          {/* Reset Demo */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset to 175 realistic sample records"
            className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin text-pink-400' : ''}`} />
          </button>

          {/* ================= AUTHENTICATION CONTROL ================= */}
          {!isAuthenticated ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 pl-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center font-black text-white text-[11px] shadow-sm">
                  {user?.name?.slice(0, 2).toUpperCase() || 'FP'}
                </div>

                <div className="hidden sm:block">
                  <div className="font-bold text-white leading-tight truncate max-w-[100px]">
                    {user?.name}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span
                      className={`text-[9px] font-black uppercase px-1 rounded ${
                        user?.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300'
                          : user?.role === 'designer'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {user?.role}
                    </span>
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 space-y-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-0.5">
                    <div className="font-bold text-white text-xs">{user?.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                    <div className="pt-1 flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      <span>Authenticated Session</span>
                    </div>
                  </div>

                  {/* Role Specific Shortcuts */}
                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        onNavigate('scanner');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center space-x-2 text-left"
                    >
                      <Camera className="w-3.5 h-3.5 text-pink-400" />
                      <span>Launch AI Body Scanner</span>
                    </button>

                    {user?.role === 'designer' && (
                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center space-x-2 text-left"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Designer Action Center</span>
                      </button>
                    )}

                    {user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center space-x-2 text-left"
                      >
                        <Shield className="w-3.5 h-3.5 text-purple-400" />
                        <span>Admin QR Projector</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-800 pt-2">
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center space-x-2 text-left text-xs font-bold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
