import React, { useState } from 'react';
import { HeatmapItem, BodyArea, GarmentType } from '../../types';
import { Layers, Filter, Eye, AlertCircle, Info } from 'lucide-react';

interface BodyHeatmapProps {
  heatmapData: HeatmapItem[];
  selectedGarment: string;
  onSelectGarment: (garment: string) => void;
  onAreaClick?: (area: BodyArea) => void;
}

const GARMENT_OPTIONS = ['All Garments', 'Shirt', 'Jeans', 'Dress', 'T-Shirt', 'Jacket'];

const HEATMAP_COORDS: Record<BodyArea, { cx: number; cy: number; r: number; labelY: number }> = {
  Neck: { cx: 150, cy: 65, r: 18, labelY: 69 },
  Shoulders: { cx: 150, cy: 95, r: 28, labelY: 99 },
  Chest: { cx: 150, cy: 135, r: 26, labelY: 139 },
  Arms: { cx: 85, cy: 145, r: 22, labelY: 149 },
  Sleeves: { cx: 65, cy: 215, r: 22, labelY: 219 },
  Waist: { cx: 150, cy: 185, r: 24, labelY: 189 },
  Hips: { cx: 150, cy: 235, r: 26, labelY: 239 },
  Rise: { cx: 150, cy: 275, r: 20, labelY: 279 },
  Thighs: { cx: 125, cy: 335, r: 24, labelY: 339 },
  Length: { cx: 150, cy: 405, r: 24, labelY: 409 },
  Other: { cx: 240, cy: 405, r: 18, labelY: 409 },
};

export const BodyHeatmap: React.FC<BodyHeatmapProps> = ({
  heatmapData,
  selectedGarment,
  onSelectGarment,
  onAreaClick,
}) => {
  const [hoveredArea, setHoveredArea] = useState<HeatmapItem | null>(null);

  const getItemForArea = (area: BodyArea): HeatmapItem | undefined => {
    return heatmapData.find((h) => h.area === area);
  };

  const getHeatmapColor = (intensity: string) => {
    switch (intensity) {
      case 'HIGH':
        return {
          fill: '#ef4444', // Red-500
          stroke: '#f87171',
          bgClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'MEDIUM':
        return {
          fill: '#f97316', // Orange-500
          stroke: '#fb923c',
          bgClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        };
      case 'LOW':
        return {
          fill: '#eab308', // Yellow-500
          stroke: '#facc15',
          bgClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        };
      default:
        return {
          fill: '#10b981', // Emerald/Green-500
          stroke: '#34d399',
          bgClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
      {/* Header & Garment Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-white">Visual Body Fit Heatmap</h3>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Live Density Map
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual clustering of reported garment defects across human body anatomy.
          </p>
        </div>

        {/* Garment Selector */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Filter Garment:</span>
          <select
            value={selectedGarment}
            onChange={(e) => onSelectGarment(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-pink-500 outline-none"
          >
            {GARMENT_OPTIONS.map((g) => (
              <option key={g} value={g === 'All Garments' ? '' : g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Heatmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Silhouette SVG Heatmap (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 relative">
          <svg
            viewBox="0 0 300 450"
            className="w-full max-w-[280px] sm:max-w-[320px] h-auto drop-shadow-2xl select-none"
          >
            <defs>
              {/* Radial glow filter */}
              <filter id="heatmapGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base Body Silhouette */}
            <circle cx="150" cy="35" r="22" className="fill-slate-900 stroke-slate-700/80" strokeWidth="2" />
            <rect x="142" y="55" width="16" height="20" rx="3" className="fill-slate-900 stroke-slate-700/80" strokeWidth="1" />
            {/* Torso */}
            <path
              d="M 100 85 L 200 85 L 225 105 L 185 180 L 195 245 L 180 280 L 165 285 L 150 265 L 135 285 L 120 280 L 105 245 L 115 180 L 75 105 Z"
              className="fill-slate-900/90 stroke-slate-700/80"
              strokeWidth="2"
            />
            {/* Arms */}
            <path d="M 75 105 L 50 200 L 70 205 L 95 125 Z" className="fill-slate-900/90 stroke-slate-700/80" strokeWidth="2" />
            <path d="M 225 105 L 250 200 L 230 205 L 205 125 Z" className="fill-slate-900/90 stroke-slate-700/80" strokeWidth="2" />
            {/* Legs */}
            <path d="M 115 280 L 100 420 L 135 420 L 145 280 Z" className="fill-slate-900/90 stroke-slate-700/80" strokeWidth="2" />
            <path d="M 185 280 L 200 420 L 165 420 L 155 280 Z" className="fill-slate-900/90 stroke-slate-700/80" strokeWidth="2" />

            {/* Heatmap Area Spots */}
            {(Object.keys(HEATMAP_COORDS) as BodyArea[]).map((area) => {
              if (area === 'Other') return null;
              const coord = HEATMAP_COORDS[area];
              const item = getItemForArea(area);
              const intensity = item ? item.intensity : 'NORMAL';
              const color = getHeatmapColor(intensity);
              const percent = item ? item.frequencyPercent : 0;
              const isHovered = hoveredArea?.area === area;

              return (
                <g
                  key={area}
                  onMouseEnter={() => item && setHoveredArea(item)}
                  onMouseLeave={() => setHoveredArea(null)}
                  onClick={() => onAreaClick && onAreaClick(area)}
                  className="cursor-pointer transition-transform duration-200"
                >
                  {/* Outer Heat Glow circle */}
                  <circle
                    cx={coord.cx}
                    cy={coord.cy}
                    r={coord.r + (intensity === 'HIGH' ? 8 : intensity === 'MEDIUM' ? 4 : 0)}
                    fill={color.fill}
                    opacity={intensity === 'HIGH' ? 0.35 : intensity === 'MEDIUM' ? 0.25 : 0.15}
                    filter="url(#heatmapGlow)"
                    className="animate-pulse"
                  />
                  {/* Core Spot */}
                  <circle
                    cx={coord.cx}
                    cy={coord.cy}
                    r={coord.r}
                    fill={color.fill}
                    stroke={color.stroke}
                    strokeWidth={isHovered ? 3 : 1.5}
                    fillOpacity={0.85}
                    className="transition-all hover:scale-110"
                  />
                  {/* Label */}
                  <text
                    x={coord.cx}
                    y={coord.labelY}
                    textAnchor="middle"
                    className="text-[10px] font-extrabold fill-white select-none pointer-events-none drop-shadow"
                  >
                    {percent > 0 ? `${percent}%` : area.slice(0, 3)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Heatmap Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-300">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <span>High Frequency (&ge;25%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
              <span>Medium (15–24%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50" />
              <span>Low (6–14%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span>Optimal (&lt;6%)</span>
            </div>
          </div>
        </div>

        {/* Heatmap Ranking Table & Hover Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dynamic Area Detail Card */}
          {hoveredArea ? (
            <div className="p-4 rounded-2xl bg-slate-950 border border-pink-500/40 animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase font-bold text-pink-400 tracking-wider">
                  Inspecting Body Zone
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    getHeatmapColor(hoveredArea.intensity).bgClass
                  }`}
                >
                  {hoveredArea.intensity} INTENSITY
                </span>
              </div>
              <h4 className="text-xl font-bold text-white">{hoveredArea.area}</h4>
              <p className="text-xs text-slate-300 mt-2">
                Reported in <strong>{hoveredArea.frequencyPercent}%</strong> of garments ({hoveredArea.count} submissions).
              </p>
              <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Predominant Issue:</span>
                <span className="font-bold text-pink-400">{hoveredArea.primaryIssue}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Hover over or click any zone on the silhouette to inspect fit defect density.</span>
            </div>
          )}

          {/* Area Frequency Ranking List */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider mb-3">
              Defect Concentration Ranking
            </span>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {heatmapData.map((item) => {
                const colors = getHeatmapColor(item.intensity);
                return (
                  <div
                    key={item.area}
                    onClick={() => onAreaClick && onAreaClick(item.area)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-850 cursor-pointer border border-slate-800/60 transition-colors text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: colors.fill }}
                      />
                      <span className="font-semibold text-white">{item.area}</span>
                      <span className="text-[11px] text-slate-400">({item.primaryIssue})</span>
                    </div>
                    <span className="font-bold text-slate-200">{item.frequencyPercent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
