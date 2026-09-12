import React, { useState } from 'react';
import { AnalyticsMetrics, Recommendation } from '../../types';
import { fetchExportSummary } from '../../api/client';
import {
  Download,
  FileText,
  FileSpreadsheet,
  X,
  Printer,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface ExportReportModalProps {
  metrics: AnalyticsMetrics;
  recommendations: Recommendation[];
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  metrics,
  recommendations,
  onClose,
}) => {
  const [downloadingJson, setDownloadingJson] = useState<boolean>(false);

  const handleDownloadCsv = () => {
    window.location.href = '/api/export/csv';
  };

  const handleDownloadJson = async () => {
    setDownloadingJson(true);
    try {
      const summary = await fetchExportSummary();
      const blob = new Blob([JSON.stringify(summary, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fit-intelligence-report-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download JSON export');
    } finally {
      setDownloadingJson(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
              Executive Fit Intelligence Export
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">Export Insights & Reports</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options Grid */}
        <div className="space-y-3">
          {/* Option 1: CSV Export */}
          <div
            onClick={handleDownloadCsv}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-pink-500/40 cursor-pointer flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Download Raw Feedback CSV</h4>
                <p className="text-xs text-slate-400">
                  Full dataset of {metrics.totalFeedback} customer entries, ratings, body tags & comments.
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
          </div>

          {/* Option 2: JSON Summary */}
          <div
            onClick={handleDownloadJson}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 cursor-pointer flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {downloadingJson ? 'Generating JSON...' : 'Export Intelligence Summary JSON'}
                </h4>
                <p className="text-xs text-slate-400">
                  Structured machine-readable report with calculated KPIs and AI design adjustments.
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
          </div>

          {/* Option 3: Print / PDF Report */}
          <div
            onClick={handlePrintReport}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-pink-500/40 cursor-pointer flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Print / Save as PDF Executive Report</h4>
                <p className="text-xs text-slate-400">
                  Formatted high-level summary view suitable for technical design and executive meetings.
                </p>
              </div>
            </div>
            <Printer className="w-4 h-4 text-slate-400 group-hover:text-pink-400" />
          </div>
        </div>

        {/* Quick Report Preview Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
            Executive Summary Snapshot:
          </span>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div>• Total Records: <strong className="text-white">{metrics.totalFeedback}</strong></div>
            <div>• Fit Issue Rate: <strong className="text-pink-400">{metrics.fitIssueRate}%</strong></div>
            <div>• Return Rate: <strong className="text-rose-400">{metrics.returnRate}%</strong></div>
            <div>• Top Issue: <strong className="text-amber-400">{metrics.topIssue}</strong></div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
