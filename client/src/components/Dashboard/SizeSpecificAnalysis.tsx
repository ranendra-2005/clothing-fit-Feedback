import React, { useState, useEffect } from 'react';
import { SizeAnalysisResult, GarmentType, Size } from '../../types';
import { fetchSizeAnalysis } from '../../api/client';
import { Maximize2, GitCompare, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface SizeSpecificAnalysisProps {
  initialGarment?: string;
  initialSize?: string;
}

const GARMENTS = ['Shirt', 'Jeans', 'Dress', 'T-Shirt', 'Jacket'];
const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const SizeSpecificAnalysis: React.FC<SizeSpecificAnalysisProps> = ({
  initialGarment = 'Shirt',
  initialSize = 'M',
}) => {
  const [selectedGarment, setSelectedGarment] = useState<string>(initialGarment);
  const [selectedSize, setSelectedSize] = useState<string>(initialSize);
  const [analysisResult, setAnalysisResult] = useState<SizeAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [selectedGarment, selectedSize]);

  const loadAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSizeAnalysis(selectedGarment, selectedSize);
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate size analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-white">Size-Specific Comparative Intelligence</h3>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Dynamic Grading Analytics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detects grading anomalies between adjacent sizes calculated strictly from live customer records.
          </p>
        </div>

        {/* Garment & Size Selectors */}
        <div className="flex items-center space-x-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Garment</label>
            <select
              value={selectedGarment}
              onChange={(e) => setSelectedGarment(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-indigo-500 outline-none"
            >
              {GARMENTS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Size</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:border-indigo-500 outline-none"
            >
              {SIZES.map((sz) => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
          Computing dynamic statistical comparisons across size samples...
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      ) : analysisResult ? (
        <div className="space-y-4">
          {/* Metadata Ribbon */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Garment Category:</span>
              <strong className="text-white">{analysisResult.garmentType}</strong>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Target Size:</span>
              <span className="font-extrabold text-indigo-400">Size {analysisResult.targetSize}</span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px]">
              Sample Volume: <strong>{analysisResult.sampleSize}</strong> customer records
            </span>
          </div>

          {/* Dynamic Conclusions Grid */}
          {analysisResult.conclusions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.conclusions.map((conc) => (
                <div
                  key={conc.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-pink-400 shrink-0" />
                      <span className="text-xs font-bold text-white uppercase tracking-wide">
                        {conc.area} • {conc.issue}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {conc.targetRate}% Rate
                    </span>
                  </div>

                  {/* Core Dynamic Conclusion Quote */}
                  <p className="text-sm font-semibold text-slate-200 leading-snug">
                    "{conc.comparisonStatement}"
                  </p>

                  <p className="text-xs text-slate-400">
                    {conc.statStatement}
                  </p>

                  {/* Visual Comparison Bar */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Size {selectedSize} Issue Rate</span>
                      <span className="font-bold text-white">{conc.targetRate}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                        style={{ width: `${Math.min(100, conc.targetRate)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Disproportionate Anomalies</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Size {selectedSize} {selectedGarment} feedback demonstrates consistent grading within expected tolerances.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
