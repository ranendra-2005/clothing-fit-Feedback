import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, WifiOff, Smartphone, Globe, Users, CheckCircle2 } from 'lucide-react';

interface FullscreenQrModalProps {
  sessionToken: string;
  publicUrl: string;
  activeCount?: number;
  totalSubmissions?: number;
  onClose: () => void;
}

export const FullscreenQrModal: React.FC<FullscreenQrModalProps> = ({
  sessionToken,
  publicUrl,
  activeCount = 0,
  totalSubmissions = 0,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const fullParticipantUrl = `${publicUrl.replace(/\/$/, '')}/?view=participant&sessionToken=${encodeURIComponent(sessionToken)}`;

  useEffect(() => {
    QRCode.toDataURL(fullParticipantUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error rendering full QR:', err));
  }, [fullParticipantUrl]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold text-pink-400 tracking-wider">
              Stage / Booth Projector Mode
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Scan to Test FitPulse Live
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Exit Fullscreen (Esc)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Center QR & Instructions */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 text-center max-w-3xl mx-auto space-y-6">
        {/* Banner Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="px-3.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>Public Internet Live</span>
          </span>
          <span className="px-3.5 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center space-x-1.5">
            <WifiOff className="w-3.5 h-3.5" />
            <span>No Local Wi-Fi Required</span>
          </span>
          <span className="px-3.5 py-1 rounded-full bg-pink-950/40 border border-pink-500/40 text-pink-300 text-xs font-bold flex items-center space-x-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Any Smartphone (iOS / Android)</span>
          </span>
        </div>

        {/* Massive QR Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white shadow-2xl border-4 border-pink-500/30 flex items-center justify-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Participant Access QR Code"
              className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center text-slate-800 font-bold">
              Generating High-Res QR...
            </div>
          )}
        </div>

        {/* Scan Text */}
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-extrabold text-white">
            Scan using your smartphone camera
          </p>
          <p className="text-xs sm:text-sm font-mono text-slate-400 max-w-lg truncate">
            {fullParticipantUrl}
          </p>
        </div>

        {/* Session details */}
        <div className="flex items-center space-x-4 pt-2">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Session Token</span>
            <span className="font-mono font-bold text-pink-400">{sessionToken}</span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Status</span>
              <span className="font-bold text-emerald-400">Live & Accepting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Participation Bar */}
      <div className="border-t border-slate-800 pt-4 max-w-6xl mx-auto w-full flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Active Participants: <strong className="text-white">{activeCount}</strong></span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Completed Analyses: <strong className="text-white">{totalSubmissions}</strong></span>
          </span>
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Press <strong>Esc</strong> to close fullscreen
        </span>
      </div>
    </div>
  );
};
