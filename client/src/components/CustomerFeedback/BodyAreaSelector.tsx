import React, { useState } from 'react';
import { BodyArea, FitIssueType, BodyAreaIssue } from '../../types';
import { Check, X, AlertCircle } from 'lucide-react';

interface BodyAreaSelectorProps {
  selectedIssues: BodyAreaIssue[];
  onChange: (issues: BodyAreaIssue[]) => void;
}

const ALL_AREAS: { id: BodyArea; label: string; coords: { cx: number; cy: number; r: number } }[] = [
  { id: 'Neck', label: 'Neck / Collar', coords: { cx: 150, cy: 65, r: 18 } },
  { id: 'Shoulders', label: 'Shoulders', coords: { cx: 150, cy: 95, r: 24 } },
  { id: 'Chest', label: 'Chest / Bust', coords: { cx: 150, cy: 135, r: 24 } },
  { id: 'Arms', label: 'Arms / Biceps', coords: { cx: 90, cy: 145, r: 20 } },
  { id: 'Sleeves', label: 'Sleeves / Cuffs', coords: { cx: 65, cy: 215, r: 20 } },
  { id: 'Waist', label: 'Waist', coords: { cx: 150, cy: 185, r: 22 } },
  { id: 'Hips', label: 'Hips / Pelvis', coords: { cx: 150, cy: 235, r: 24 } },
  { id: 'Rise', label: 'Rise / Inseam', coords: { cx: 150, cy: 275, r: 20 } },
  { id: 'Thighs', label: 'Thighs', coords: { cx: 125, cy: 335, r: 22 } },
  { id: 'Length', label: 'Overall Garment Length', coords: { cx: 150, cy: 405, r: 22 } },
];

const ISSUE_OPTIONS: FitIssueType[] = [
  'Too Tight',
  'Too Loose',
  'Too Short',
  'Too Long',
  'Fits Correctly',
  'Other',
];

export const BodyAreaSelector: React.FC<BodyAreaSelectorProps> = ({ selectedIssues, onChange }) => {
  const [activeArea, setActiveArea] = useState<BodyArea | null>('Shoulders');

  const getIssueForArea = (area: BodyArea): FitIssueType | null => {
    const found = selectedIssues.find((i) => i.area === area);
    return found ? found.issue : null;
  };

  const handleSelectIssue = (area: BodyArea, issue: FitIssueType) => {
    const filtered = selectedIssues.filter((i) => i.area !== area);
    const updated = [...filtered, { area, issue }];
    onChange(updated);
  };

  const handleRemoveArea = (area: BodyArea) => {
    const updated = selectedIssues.filter((i) => i.area !== area);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-bold text-white">Identify Problem Areas</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Click on any body/garment zone on the silhouette or select from the list, then specify how it fits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Silhouette SVG Interactive Column */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 relative">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Interactive Garment Fit Map
          </span>

          <svg
            viewBox="0 0 300 450"
            className="w-full max-w-[260px] sm:max-w-[290px] h-auto drop-shadow-md select-none"
          >
            {/* Ambient background silhouette */}
            {/* Head */}
            <circle cx="150" cy="35" r="22" className="fill-slate-800/80 stroke-slate-700" strokeWidth="2" />
            {/* Neck */}
            <rect x="142" y="55" width="16" height="20" rx="3" className="fill-slate-800/80 stroke-slate-700" strokeWidth="1" />
            {/* Torso & Shoulders base shape */}
            <path
              d="M 100 85 L 200 85 L 225 105 L 185 180 L 195 245 L 180 280 L 165 285 L 150 265 L 135 285 L 120 280 L 105 245 L 115 180 L 75 105 Z"
              className="fill-slate-900 stroke-slate-700/80"
              strokeWidth="2"
            />
            {/* Left Arm & Sleeve */}
            <path
              d="M 75 105 L 50 200 L 70 205 L 95 125 Z"
              className="fill-slate-900 stroke-slate-700/80"
              strokeWidth="2"
            />
            {/* Right Arm & Sleeve */}
            <path
              d="M 225 105 L 250 200 L 230 205 L 205 125 Z"
              className="fill-slate-900 stroke-slate-700/80"
              strokeWidth="2"
            />
            {/* Left Leg / Thigh */}
            <path
              d="M 115 280 L 100 420 L 135 420 L 145 280 Z"
              className="fill-slate-900 stroke-slate-700/80"
              strokeWidth="2"
            />
            {/* Right Leg / Thigh */}
            <path
              d="M 185 280 L 200 420 L 165 420 L 155 280 Z"
              className="fill-slate-900 stroke-slate-700/80"
              strokeWidth="2"
            />

            {/* Clickable Hotspots for Each Area */}
            {ALL_AREAS.map((item) => {
              const currentIssue = getIssueForArea(item.id);
              const isSelected = !!currentIssue;
              const isActive = activeArea === item.id;

              let fillClass = 'fill-slate-800/80 stroke-slate-500';
              if (currentIssue === 'Too Tight') fillClass = 'fill-rose-500/80 stroke-rose-300';
              else if (currentIssue === 'Too Loose') fillClass = 'fill-cyan-500/80 stroke-cyan-300';
              else if (currentIssue === 'Too Short' || currentIssue === 'Too Long')
                fillClass = 'fill-purple-500/80 stroke-purple-300';
              else if (currentIssue === 'Fits Correctly')
                fillClass = 'fill-emerald-500/80 stroke-emerald-300';
              else if (isSelected) fillClass = 'fill-amber-500/80 stroke-amber-300';

              return (
                <g
                  key={item.id}
                  onClick={() => setActiveArea(item.id)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={item.coords.cx}
                    cy={item.coords.cy}
                    r={item.coords.r}
                    className={`transition-all duration-200 ${fillClass} ${
                      isActive ? 'stroke-[3px] scale-110 filter drop-shadow-md' : 'stroke-[1.5px]'
                    } hover:brightness-125`}
                  />
                  <text
                    x={item.coords.cx}
                    y={item.coords.cy + 4}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-white pointer-events-none select-none"
                  >
                    {item.id.slice(0, 3)}
                  </text>
                </g>
              );
            })}
          </svg>

          <p className="text-[11px] text-slate-400 mt-3 text-center">
            Tip: Click a circle on the silhouette to assign fit feedback.
          </p>
        </div>

        {/* Issue Selection Controls Column */}
        <div className="lg:col-span-6 space-y-4">
          {/* Active Area Header */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] uppercase font-semibold text-pink-400 tracking-wider">
                  Configuring Area:
                </span>
                <h4 className="text-base font-bold text-white">
                  {ALL_AREAS.find((a) => a.id === activeArea)?.label || activeArea}
                </h4>
              </div>

              {activeArea && getIssueForArea(activeArea) && (
                <button
                  onClick={() => activeArea && handleRemoveArea(activeArea)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Sub-Pills for Fit Issues */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ISSUE_OPTIONS.map((issue) => {
                const isCurrent = activeArea ? getIssueForArea(activeArea) === issue : false;
                let activeStyle = 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-850';

                if (isCurrent) {
                  if (issue === 'Too Tight') activeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500';
                  else if (issue === 'Too Loose') activeStyle = 'bg-cyan-500/20 text-cyan-300 border-cyan-500';
                  else if (issue === 'Fits Correctly') activeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500';
                  else activeStyle = 'bg-pink-500/20 text-pink-300 border-pink-500';
                }

                return (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => activeArea && handleSelectIssue(activeArea, issue)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all ${activeStyle}`}
                  >
                    {issue}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Select Buttons for Other Body Parts */}
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-2">
              Or pick an area from this list:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_AREAS.map((a) => {
                const issue = getIssueForArea(a.id);
                const isSelected = !!issue;
                const isActive = activeArea === a.id;

                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setActiveArea(a.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      isActive
                        ? 'border-pink-500 text-white bg-pink-500/20'
                        : isSelected
                        ? 'border-slate-700 text-pink-300 bg-slate-900'
                        : 'border-slate-800 text-slate-400 bg-slate-950 hover:bg-slate-900'
                    }`}
                  >
                    {a.id} {issue && `(${issue})`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary of Chosen Areas */}
          {selectedIssues.length > 0 ? (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Tagged Problem Areas ({selectedIssues.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedIssues.map((item) => (
                  <span
                    key={item.area}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-white"
                  >
                    <span>{item.area}:</span>
                    <span className="text-pink-400 font-semibold">{item.issue}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveArea(item.area)}
                      className="ml-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center space-x-2 text-slate-400 text-xs">
              <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
              <span>No areas selected yet. Click Shoulders, Sleeves, Waist, etc. above.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
