import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  Globe,
  Wifi,
  X,
  Smartphone,
  Download,
  MessageSquare,
  Mail,
  Send,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface ShareFeedbackModalProps {
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const ShareFeedbackModal: React.FC<ShareFeedbackModalProps> = ({ onClose, onToast }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tunnelType, setTunnelType] = useState<'public' | 'wifi' | 'custom'>('public');
  const [publicBaseUrl, setPublicBaseUrl] = useState<string>('https://86c9f3996aaa74.lhr.life');
  const [wifiBaseUrl, setWifiBaseUrl] = useState<string>('http://172.20.35.121:5173');
  const [customInput, setCustomInput] = useState<string>('');
  const [loadingInfo, setLoadingInfo] = useState<boolean>(true);

  // Fetch tunnel info from server
  useEffect(() => {
    fetch('/api/tunnel-info')
      .then((res) => res.json())
      .then((data) => {
        if (data.publicUrl) setPublicBaseUrl(data.publicUrl);
        if (data.wifiUrl) setWifiBaseUrl(data.wifiUrl);
      })
      .catch((err) => console.error('Error fetching tunnel info:', err))
      .finally(() => setLoadingInfo(false));
  }, []);

  // Compute final active URL
  const getActiveUrl = () => {
    let base = publicBaseUrl;
    if (tunnelType === 'wifi') base = wifiBaseUrl;
    else if (tunnelType === 'custom') base = customInput || publicBaseUrl;

    // Ensure trailing slash or query param
    const cleanBase = base.replace(/\/+$/, '');
    return `${cleanBase}/?view=feedback`;
  };

  const activeUrl = getActiveUrl();

  useEffect(() => {
    // Generate QR Code on canvas whenever activeUrl changes
    if (canvasRef.current && activeUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        activeUrl,
        {
          width: 230,
          margin: 2,
          color: {
            dark: '#0f172a', // slate-900
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Error rendering QR code:', error);
        }
      );
    }
  }, [activeUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    onToast('Participant link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadQr = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fitpulse-participant-qr.png';
    a.click();
    onToast('QR Code saved as PNG image!');
  };

  const inviteMessage = `Hey everyone! 👋 Please test our hackathon project "FitPulse" (Fashion for People). Share your clothing fit feedback directly from your phone in under 45s: ${activeUrl}`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(inviteMessage);
    setCopiedTemplate(true);
    onToast('Announcement message copied!');
    setTimeout(() => setCopiedTemplate(false), 3000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! 👋 Please test our Clothing Fit Intelligence project "FitPulse" from your phone: ${activeUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Try FitPulse: Clothing Fit Feedback System');
    const body = encodeURIComponent(
      `Hi there,\n\nWe would love your feedback on our hackathon project FitPulse. Please take 45 seconds to share how your recent clothing fits from your mobile phone:\n\n${activeUrl}\n\nThank you!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                  Mobile QR & Participant Link
                </span>
                <span className="inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Public Mobile Live</span>
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white">Send to All Participants</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network / Public Mode Selector Tabs */}
        <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTunnelType('public')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
              tunnelType === 'public'
                ? 'bg-gradient-to-r from-pink-500/30 to-indigo-500/30 text-white border border-pink-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-pink-400" />
            <span>Public HTTPS (4G/5G / Any Mobile)</span>
          </button>

          <button
            type="button"
            onClick={() => setTunnelType('wifi')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl transition-all ${
              tunnelType === 'wifi'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-indigo-400" />
            <span>Local Wi-Fi Network</span>
          </button>
        </div>

        {/* QR Code & Mobile Instructions Card */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="p-3 bg-white rounded-2xl shadow-2xl flex flex-col items-center shrink-0">
            <canvas ref={canvasRef} className="rounded-xl w-[190px] h-[190px]" />
            <span className="text-[10px] font-extrabold text-slate-800 mt-1 uppercase tracking-wider">
              Scan with Any Phone Camera
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <Smartphone className="w-4 h-4" />
              <span>Works on Any Smartphone Instantly</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {tunnelType === 'public' ? (
                <>
                  This QR code uses the secure public HTTPS endpoint (<strong>{publicBaseUrl}</strong>).
                  Participants can scan it using <strong>cellular data (4G/5G) or any Wi-Fi</strong> without being blocked by network firewalls.
                </>
              ) : (
                <>
                  Connects via local LAN (<strong>{wifiBaseUrl}</strong>). Both the host laptop and mobile phone must be connected to the exact same Wi-Fi.
                </>
              )}
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-pink-400" />
                <span>Save QR as PNG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Copyable Link Box */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">Shareable Feedback Form URL:</span>
            <span className="text-[11px] text-pink-400 font-mono">?view=feedback</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={activeUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-pink-300 font-mono text-xs focus:border-pink-500 outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-md shadow-pink-500/25 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Multi-Channel 1-Click Sharing */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            1-Click Multi-Channel Distribution:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleCopyTemplate}
              className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{copiedTemplate ? 'Copied Slack!' : 'Slack / Discord'}</span>
            </button>

            <button
              onClick={handleEmailShare}
              className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
          </div>
        </div>

        {/* Live Sync Notice */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/30 to-pink-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-center space-x-2.5">
          <Sparkles className="w-5 h-5 text-pink-400 shrink-0" />
          <span>
            <strong>Real-Time Live Telemetry:</strong> Every submission received from any participant's phone automatically streams into the <strong>Brand Dashboard</strong> and <strong>Heatmap</strong> without refreshing!
          </span>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
