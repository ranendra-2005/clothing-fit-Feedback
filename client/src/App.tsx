import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { FeedbackWizard } from './components/CustomerFeedback/FeedbackWizard';
import { BrandDashboard } from './components/Dashboard/BrandDashboard';
import { HackathonPresentationMode } from './components/Presentation/HackathonPresentationMode';
import { ExportReportModal } from './components/Dashboard/ExportReportModal';
import { ShareFeedbackModal } from './components/ShareFeedbackModal';
import { Feedback, AnalyticsMetrics, Recommendation } from './types';
import { fetchAnalytics, resetDemoData, fetchRecommendations } from './api/client';
import { CheckCircle2, QrCode } from 'lucide-react';

export function App() {
  // Read initial view from URL query param e.g. ?view=feedback
  const [activeView, setActiveView] = useState<'landing' | 'feedback' | 'dashboard' | 'presentation'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      if (v === 'feedback' || v === 'dashboard' || v === 'presentation' || v === 'landing') {
        return v;
      }
    }
    return 'landing';
  });

  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync active view to URL parameter so links and bookmarks work
  const handleNavigate = (view: 'landing' | 'feedback' | 'dashboard' | 'presentation') => {
    setActiveView(view);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      window.history.pushState({}, '', url.toString());
    }
  };

  useEffect(() => {
    loadGlobalData();
  }, []);

  // Periodic polling when on Brand Dashboard to automatically stream incoming participant feedback
  useEffect(() => {
    if (activeView !== 'dashboard') return;

    const interval = setInterval(() => {
      fetchAnalytics().then((latest) => {
        setMetrics((prev) => {
          if (prev && latest.totalFeedback > prev.totalFeedback) {
            showToast(`🎉 New participant feedback received! Total: ${latest.totalFeedback}`);
          }
          return latest;
        });
      }).catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [activeView]);

  const loadGlobalData = async () => {
    try {
      const [analytics, recs] = await Promise.all([
        fetchAnalytics(),
        fetchRecommendations(),
      ]);
      setMetrics(analytics);
      setRecommendations(recs);
    } catch (err) {
      console.error('Error initializing app data:', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const msg = await resetDemoData();
      await loadGlobalData();
      showToast(msg || 'Demo dataset reset to 175 realistic records');
    } catch (err: any) {
      showToast('Failed to reset demo dataset');
    } finally {
      setIsResetting(false);
    }
  };

  const handleFeedbackSubmitted = (newFeedback: Feedback) => {
    loadGlobalData();
    showToast(`Feedback saved & analyzed: ${newFeedback.product} (Size ${newFeedback.size})`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-pink-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-slate-900 border border-pink-500/50 text-white shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        onResetDemo={handleResetDemo}
        onExport={() => setShowExportModal(true)}
        onOpenShareModal={() => setShowShareModal(true)}
        isResetting={isResetting}
      />

      {/* Main View Router */}
      <main className="flex-1">
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
      </main>

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
export default App;
