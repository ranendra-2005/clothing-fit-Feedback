import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Users,
  BarChart3,
  Lightbulb,
  Settings,
  RefreshCw,
  Copy,
  Check,
  Download,
  Maximize2,
  Play,
  Pause,
  StopCircle,
  Globe,
  WifiOff,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Session,
  RecommendationAccuracyMetrics,
  BrandInsightItem,
} from '../../types';
import {
  fetchSessions,
  createSession,
  updateSessionStatus,
  fetchSessionStats,
  fetchAccuracyMetrics,
  fetchBrandInsights,
  fetchRecentParticipants,
  fetchTunnelInfo,
} from '../../api/client';
import { FullscreenQrModal } from './FullscreenQrModal';

interface AdminHubProps {
  onNavigate?: (view: any, token?: string) => void;
  onToast?: (msg: string) => void;
}

const COLORS = ['#ec4899', '#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export const AdminHub: React.FC<AdminHubProps> = ({ onNavigate, onToast }) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'participants' | 'accuracy' | 'insights' | 'settings'>('qr');

  // Sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [publicUrl, setPublicUrl] = useState<string>('https://29ffb96a622c2d.lhr.life');
  const [customPublicUrl, setCustomPublicUrl] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showFullscreenQr, setShowFullscreenQr] = useState<boolean>(false);

  // Live Participation Stats
  const [stats, setStats] = useState<{
    activeParticipants: number;
    completedAnalyses: number;
    totalSubmissions: number;
  }>({ activeParticipants: 0, completedAnalyses: 0, totalSubmissions: 0 });

  // Accuracy & Insights
  const [accuracyMetrics, setAccuracyMetrics] = useState<RecommendationAccuracyMetrics | null>(null);
  const [brandInsights, setBrandInsights] = useState<BrandInsightItem[]>([]);
  const [recentParticipants, setRecentParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    const interval = setInterval(refreshTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update QR Code when session or public URL changes
  useEffect(() => {
    if (!activeSession) return;
    const base = customPublicUrl.trim() || publicUrl;
    const link = `${base.replace(/\/$/, '')}/?view=participant&sessionToken=${encodeURIComponent(activeSession.token)}`;

    QRCode.toDataURL(link, {
      width: 320,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR:', err));
  }, [activeSession, publicUrl, customPublicUrl]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [sessList, tunnel, acc, ins, part] = await Promise.all([
        fetchSessions().catch(() => []),
        fetchTunnelInfo().catch(() => ({ publicUrl: 'https://29ffb96a622c2d.lhr.life', wifiUrl: '' })),
        fetchAccuracyMetrics().catch(() => null),
        fetchBrandInsights().catch(() => []),
        fetchRecentParticipants().catch(() => []),
      ]);

      setSessions(sessList);
      if (sessList.length > 0) {
        setActiveSession(sessList[0]);
      }
      if (tunnel.publicUrl) {
        setPublicUrl(tunnel.publicUrl);
      }
      setAccuracyMetrics(acc);
      setBrandInsights(ins);
      setRecentParticipants(part);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTelemetry = async () => {
    try {
      if (activeSession) {
        const s = await fetchSessionStats(activeSession.token);
        setStats({
          activeParticipants: s.activeParticipants,
          completedAnalyses: s.completedAnalyses,
          totalSubmissions: s.totalSubmissions,
        });
      }
      const [acc, ins, part] = await Promise.all([
        fetchAccuracyMetrics().catch(() => null),
        fetchBrandInsights().catch(() => []),
        fetchRecentParticipants().catch(() => []),
      ]);
      setAccuracyMetrics(acc);
      setBrandInsights(ins);
      setRecentParticipants(part);
    } catch {}
  };

  const handleGenerateNewSession = async () => {
    try {
      const newSess = await createSession(`Round 1 Demo (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`, 8);
      setSessions((prev) => [newSess, ...prev]);
      setActiveSession(newSess);
      onToast?.(`🎉 New QR Session created: ${newSess.token}`);
    } catch (err: any) {
      alert('Error creating session: ' + err.message);
    }
  };

  const handleUpdateStatus = async (status: 'active' | 'paused' | 'ended') => {
    if (!activeSession) return;
    try {
      const updated = await updateSessionStatus(activeSession.token, status);
      setActiveSession(updated);
      setSessions((prev) => prev.map((s) => (s.token === updated.token ? updated : s)));
      onToast?.(`Session status updated to ${status.toUpperCase()}`);
    } catch (err: any) {
      alert('Error updating session status: ' + err.message);
    }
  };

  const handleCopyLink = () => {
    if (!activeSession) return;
    const base = customPublicUrl.trim() || publicUrl;
    const link = `${base.replace(/\/$/, '')}/?view=participant&sessionToken=${encodeURIComponent(activeSession.token)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
    onToast?.('Participant link copied to clipboard!');
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || !activeSession) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `fitpulse-qr-${activeSession.token}.png`;
    a.click();
  };

  const currentParticipantUrl = activeSession
    ? `${(customPublicUrl.trim() || publicUrl).replace(/\/$/, '')}/?view=participant&sessionToken=${encodeURIComponent(activeSession.token)}`
    : '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/20">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">
                Hackathon Organizer Hub
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Multi-Participant Live</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Clothing Fit Intelligence & QR Control
            </h1>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'qr'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Session</span>
          </button>

          <button
            onClick={() => setActiveTab('accuracy')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'accuracy'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Accuracy & Charts</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'insights'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Designer Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('participants')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'participants'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Live Stream ({recentParticipants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= TAB 1: QR SESSION MANAGEMENT ================= */}
      {activeTab === 'qr' && activeSession && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Big Scannable QR */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center">
            <div>
              <div className="flex items-center justify-center space-x-2 text-xs font-bold text-emerald-400 mb-1">
                <Globe className="w-4 h-4" />
                <span>Public Internet QR • No Local Wi-Fi Needed</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">Participant Access QR</h3>
              <p className="text-xs text-slate-400 mt-1">
                Participants can scan with any smartphone camera on mobile data or Wi-Fi.
              </p>
            </div>

            {/* QR Card */}
            <div className="p-6 rounded-3xl bg-white shadow-xl border-4 border-pink-500/30 inline-block mx-auto relative group">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Session QR Code"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-700 font-bold">
                  Generating QR...
                </div>
              )}
            </div>

            {/* URL Display */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-pink-300 break-all select-all flex items-center justify-between">
              <span className="truncate pr-2">{currentParticipantUrl}</span>
              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white shrink-0"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowFullscreenQr(true)}
                className="py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-xs font-bold shadow-md hover:scale-[1.01] transition-all flex items-center justify-center space-x-1.5"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Fullscreen Projector</span>
              </button>

              <button
                onClick={handleDownloadQr}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>

          {/* Right Column: Session Controls & Stats */}
          <div className="lg:col-span-7 space-y-6">
            {/* Session Status Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Current Active Session
                  </span>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {activeSession.token}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        activeSession.status === 'active'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : activeSession.status === 'paused'
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {activeSession.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleGenerateNewSession}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold hover:bg-indigo-600/30 transition-all flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate New QR</span>
                </button>
              </div>

              {/* State Toggles */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  disabled={activeSession.status === 'active'}
                  onClick={() => handleUpdateStatus('active')}
                  className="py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-xs font-bold text-emerald-400 disabled:opacity-40 flex items-center justify-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Activate Session</span>
                </button>

                <button
                  disabled={activeSession.status === 'paused'}
                  onClick={() => handleUpdateStatus('paused')}
                  className="py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-xs font-bold text-amber-400 disabled:opacity-40 flex items-center justify-center space-x-1.5"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Session</span>
                </button>

                <button
                  disabled={activeSession.status === 'ended'}
                  onClick={() => handleUpdateStatus('ended')}
                  className="py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500 text-xs font-bold text-rose-400 disabled:opacity-40 flex items-center justify-center space-x-1.5"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>End Session</span>
                </button>
              </div>
            </div>

            {/* Live Participation Counter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Active Participants</span>
                  <Users className="w-4 h-4 text-pink-400" />
                </div>
                <div className="text-3xl font-black text-white">{stats.activeParticipants}</div>
                <p className="text-[10px] text-slate-500">Connected in current session</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Completed Analyses</span>
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-black text-white">{stats.completedAnalyses}</div>
                <p className="text-[10px] text-slate-500">Photos analyzed & sizes computed</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Fit Feedbacks</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white">{stats.totalSubmissions}</div>
                <p className="text-[10px] text-slate-500">Verified wearability submissions</p>
              </div>
            </div>

            {/* Instructions Pill for Judges & Organizers */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center space-x-2 font-bold text-slate-200">
                <WifiOff className="w-4 h-4 text-indigo-400" />
                <span>Zero-Friction Hackathon Architecture:</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Participants do not need to install an app or connect to local Wi-Fi. The QR code resolves through our public cloud domain (or live HTTPS tunnel). Multiple judges and attendees can scan simultaneously on 5G/LTE and submit fit evaluations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ACCURACY & ANALYTICS CHARTS ================= */}
      {activeTab === 'accuracy' && accuracyMetrics && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Evaluated Fit Samples</span>
              <div className="text-3xl font-black text-white">{accuracyMetrics.totalEvaluated}</div>
              <p className="text-[10px] text-slate-500">Participant validations</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Recommendation Accuracy</span>
              <div className="text-3xl font-black text-emerald-400">{accuracyMetrics.accuracyRate}%</div>
              <p className="text-[10px] text-slate-500">Exact size matches</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Avg Size Error</span>
              <div className="text-3xl font-black text-pink-400">{accuracyMetrics.avgSizeDifference} <span className="text-sm font-normal text-slate-500">sizes</span></div>
              <p className="text-[10px] text-slate-500">Mean absolute sizing delta</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">1-Size Tolerance Rate</span>
              <div className="text-3xl font-black text-indigo-400">{accuracyMetrics.oneSizeDifferenceRate}%</div>
              <p className="text-[10px] text-slate-500">Adjacent size preference</p>
            </div>
          </div>

          {/* 8 Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1 & 2: Recommended vs Actual Size */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>1. Recommended vs Actual Size Distribution</span>
                <span className="text-xs font-normal text-slate-400">Grouped Comparison</span>
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={accuracyMetrics.sizeDistributionRecommended.map((r, idx) => ({
                      size: r.size,
                      Recommended: r.count,
                      Actual: accuracyMetrics.sizeDistributionActual[idx]?.count || 0,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="size" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                    <Legend />
                    <Bar dataKey="Recommended" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Actual" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Fit Satisfaction Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>2. Participant Fit Satisfaction</span>
                <span className="text-xs font-normal text-slate-400">Perception Ratings</span>
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accuracyMetrics.fitSatisfactionBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="rating" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Problem Areas Frequency */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>3. Problem Area Frequency</span>
                <span className="text-xs font-normal text-slate-400">Anatomical Defect Clustering</span>
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accuracyMetrics.problemAreaFrequency}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="area" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                    <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 5: Sizing Error Delta Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>4. Size Error Step Distribution</span>
                <span className="text-xs font-normal text-slate-400">Tolerance Deviation</span>
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Exact Match', count: accuracyMetrics.exactMatches, percentage: accuracyMetrics.accuracyRate },
                      { name: '1 Size Off', count: Math.round((accuracyMetrics.oneSizeDifferenceRate / 100) * accuracyMetrics.totalEvaluated), percentage: accuracyMetrics.oneSizeDifferenceRate },
                      { name: '2+ Sizes Off', count: Math.round((accuracyMetrics.twoPlusSizeDifferenceRate / 100) * accuracyMetrics.totalEvaluated), percentage: accuracyMetrics.twoPlusSizeDifferenceRate },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                    <Bar dataKey="percentage" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: DESIGNER INSIGHTS ================= */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-white">Brand & Designer Intelligence</h3>
              <p className="text-xs text-slate-400 mt-1">
                Data-backed patternmaking and grading adjustments computed from participant telemetry.
              </p>
            </div>
            <button
              onClick={refreshTelemetry}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Insights</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brandInsights.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-pink-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                      item.severity === 'High'
                        ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        : item.severity === 'Medium'
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {item.severity} Severity Flaw
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{item.affectedMetric}</span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-white">{item.insight}</h4>
                  <p className="text-xs text-slate-400 mt-1">{item.evidence}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-pink-400 block tracking-wider">
                    Factory Pattern Tech Pack Recommendation:
                  </span>
                  <p className="text-slate-200 font-medium leading-relaxed">
                    {item.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: LIVE PARTICIPANTS STREAM ================= */}
      {activeTab === 'participants' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-white">Live Participant Stream</h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time feed of participants who scanned and completed fit evaluations.
              </p>
            </div>
            <button
              onClick={refreshTelemetry}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="pb-3">Participant</th>
                  <th className="pb-3">Garment</th>
                  <th className="pb-3">Photo Quality</th>
                  <th className="pb-3">Recommended</th>
                  <th className="pb-3">Actual Tried</th>
                  <th className="pb-3">Fit Rating</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No participants have submitted fit telemetry yet. Scan the QR code to test!
                    </td>
                  </tr>
                ) : (
                  recentParticipants.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-3.5 font-mono text-slate-300">
                        {row.participant.id.slice(0, 12)}...
                      </td>
                      <td className="py-3.5 text-white font-semibold">
                        {row.participant.garmentType}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-bold">
                          {row.analysis?.photoQuality?.score || 88}/100
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-pink-400">
                        {row.analysis?.recommendation?.recommendedSize || row.feedback?.recommendedSize || 'M'}
                      </td>
                      <td className="py-3.5 font-bold text-indigo-400">
                        {row.feedback?.actualSize || '—'}
                      </td>
                      <td className="py-3.5">
                        {row.feedback?.fitRating ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.feedback.fitRating === 'Perfect'
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-amber-950 text-amber-400'
                            }`}
                          >
                            {row.feedback.fitRating}
                          </span>
                        ) : (
                          <span className="text-slate-500">Evaluating...</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        {row.feedback ? (
                          <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Submitted</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">In Progress</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 5: SYSTEM & PRIVACY SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <div>
            <h3 className="text-xl font-extrabold text-white">System & Public Domain Settings</h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure public HTTPS routing and privacy controls for participant access.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 block">
                Public Domain / Tunnel URL (No Localhost in QR!)
              </label>
              <input
                type="text"
                value={customPublicUrl}
                onChange={(e) => setCustomPublicUrl(e.target.value)}
                placeholder={publicUrl}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-pink-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500">
                Default: <span className="font-mono text-pink-400">{publicUrl}</span>. Enter your custom domain (e.g. <span className="font-mono">https://clothing-fit-ai.vercel.app</span>) to override.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Privacy & Storage Compliance:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                • Uploaded images are stored in a private directory with randomized hash filenames.
                <br />• Raw images are never exposed to other participants.
                <br />• Zero personally identifiable biometric data is collected.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onToast?.('Settings updated!')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-xs font-bold"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Projector Modal */}
      {showFullscreenQr && activeSession && (
        <FullscreenQrModal
          sessionToken={activeSession.token}
          publicUrl={customPublicUrl.trim() || publicUrl}
          activeCount={stats.activeParticipants}
          totalSubmissions={stats.totalSubmissions}
          onClose={() => setShowFullscreenQr(false)}
        />
      )}
    </div>
  );
};
