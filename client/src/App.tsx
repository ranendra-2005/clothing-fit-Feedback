import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/Auth/AuthModal';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { FeedbackWizard } from './components/CustomerFeedback/FeedbackWizard';
import { BrandDashboard } from './components/Dashboard/BrandDashboard';
import { HackathonPresentationMode } from './components/Presentation/HackathonPresentationMode';
import { ParticipantExperience } from './components/Participant/ParticipantExperience';
import { AdminHub } from './components/Admin/AdminHub';
import { AiBodyScanner } from './components/Scanner/AiBodyScanner';
import { ExportReportModal } from './components/Dashboard/ExportReportModal';
import { ShareFeedbackModal } from './components/ShareFeedbackModal';
import { Feedback, AnalyticsMetrics, Recommendation } from './types';
import { fetchAnalytics, resetDemoData, fetchRecommendations } from './api/client';
import { CheckCircle2, QrCode } from 'lucide-react';

export type AppView = 'landing' | 'feedback' | 'dashboard' | 'presentation' | 'participant' | 'admin' | 'admin_qr' | 'scanner';

function AppContent() {
  // Read initial view from URL query param or path e.g. /participant/:token or ?view=participant
  const [activeView, setActiveView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/scanner')) return 'scanner';
      if (pathname.startsWith('/participant')) return 'participant';
      if (pathname.startsWith('/admin')) return 'admin';

      const params = new URLSearchParams(window.location.search);
      const v = params.get('view') as AppView;
      if (v) return v;
    }
    return 'landing';
  });

  const [sessionToken, setSessionToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/participant/')) {
        const token = pathname.replace('/participant/', '').split('/')[0].split('?')[0];
        if (token) return token;
      }
      const params = new URLSearchParams(window.location.search);
      const token = params.get('sessionToken') || params.get('token');
      if (token) return token;
    }
    return 'SESS-ROUND1';
  });

  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync active view to URL parameter so links and bookmarks work
  const handleNavigate = (view: AppView, token?: string) => {
    setActiveView(view);
    if (token) setSessionToken(token);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      if (token) url.searchParams.set('sessionToken', token);
      window.history.pushState({}, '', url.toString());
    }
  };

  useEffect(() => {
    loadGlobalData();
  }, []);

  const loadGlobalData = async () => {
    try {
      const [analyticsData, recsData] = await Promise.all([
        fetchAnalytics(),
        fetchRecommendations(),
      ]);
      setMetrics(analyticsData);
      setRecommendations(recsData);
    } catch (err) {
      console.error('Error initializing app data:', err);
    }
  };

  const handleFeedbackSubmitted = (_savedFeedback: Feedback) => {
    showToast('Feedback submitted successfully! Analytics updated.');
    loadGlobalData();
    handleNavigate('dashboard');
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await resetDemoData();
      await loadGlobalData();
      showToast('Database reset to 175 calibrated baseline records.');
    } catch (err) {
      console.error('Reset failed:', err);
      showToast('Failed to reset demo data. Try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-pink-500 selection:text-white font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-4 py-3 rounded-xl bg-slate-900 border border-pink-500/50 text-white text-xs font-semibold shadow-2xl flex items-center space-x-2.5 shadow-pink-500/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Navbar with Authentication integration */}
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        onResetDemo={handleResetDemo}
        onExport={() => setShowExportModal(true)}
        onOpenShareModal={() => setShowShareModal(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        isResetting={isResetting}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeView === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            metrics={metrics}
          />
        )}

        {activeView === 'feedback' && (
          <FeedbackWizard
            onFeedbackSubmitted={handleFeedbackSubmitted}
            onNavigateToDashboard={() => handleNavigate('dashboard')}
          />
        )}

        {activeView === 'dashboard' && (
          <BrandDashboard
            onResetDemo={handleResetDemo}
            isResetting={isResetting}
          />
        )}

        {activeView === 'presentation' && (
          <HackathonPresentationMode
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'participant' && (
          <ParticipantExperience
            sessionToken={sessionToken}
            onNavigateHome={() => handleNavigate('landing')}
          />
        )}

        {(activeView === 'admin' || activeView === 'admin_qr') && (
          <AdminHub
            onNavigate={handleNavigate}
            onToast={showToast}
          />
        )}

        {activeView === 'scanner' && (
          <AiBodyScanner
            onNavigateToFeedback={(_size, _garment) => {
              handleNavigate('feedback');
            }}
            onNavigateToDashboard={() => handleNavigate('dashboard')}
          />
        )}
      </main>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Global Export Modal */}
      {showExportModal && metrics && (
        <ExportReportModal
          metrics={metrics}
          recommendations={recommendations}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Share with Participants Modal */}
      {showShareModal && (
        <ShareFeedbackModal
          onClose={() => setShowShareModal(false)}
          onToast={showToast}
        />
      )}

      {/* Modern Fashion-Tech Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center space-x-4">
          <span className="font-semibold text-slate-300">FitPulse</span>
          <span>•</span>
          <span>Hackathon Track: Fashion for People</span>
          <span>•</span>
          <span>Google DeepMind Antigravity Pair-Programming</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Intelligent Feedback & Analytics Platform • Empowering Inclusive Garment Engineering
        </p>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
