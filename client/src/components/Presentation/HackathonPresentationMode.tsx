import React, { useState } from 'react';
import {
  Presentation,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  Layers,
  Cpu,
  Target,
  Ruler,
  TrendingDown,
  CheckCircle2,
  BarChart3,
  Flame,
  Leaf,
  DollarSign,
} from 'lucide-react';

interface HackathonPresentationModeProps {
  onNavigate: (view: 'landing' | 'feedback' | 'dashboard' | 'presentation') => void;
}

const STEPS = [
  {
    step: 1,
    title: 'The Customer Problem',
    subtitle: 'The $38B Clothing Fit & Return Crisis in Fashion E-Commerce',
    badge: 'Industry Crisis',
  },
  {
    step: 2,
    title: 'Frictionless Feedback Capture',
    subtitle: 'An Accessible, Human-Centric Silhouette Input System',
    badge: 'Fashion for People',
  },
  {
    step: 3,
    title: 'AI Pattern Detection Layer',
    subtitle: 'Unstructured Review Text Converted into Standardized Garment Telemetry',
    badge: 'Hybrid AI & NLP',
  },
  {
    step: 4,
    title: 'Key Fit Anomaly Uncovered',
    subtitle: 'System Detects Severe Shoulder Defect in Size M Button-Down Shirts',
    badge: 'Pattern Detection',
  },
  {
    step: 5,
    title: 'Empirical Evidence & Telemetry',
    subtitle: 'Data-Backed Proof Validated Across Hundreds of Submissions',
    badge: 'Statistical Rigor',
  },
  {
    step: 6,
    title: 'Precision Design Recommendations',
    subtitle: 'Converting Feedback into Exact Millimeter Tech Pack Tolerances',
    badge: 'Actionable Engineering',
  },
  {
    step: 7,
    title: 'Economic & Environmental Impact',
    subtitle: '28% Return Reduction, Happy Customers, and Less Landfill Waste',
    badge: 'Real-World Value',
  },
];

export const HackathonPresentationMode: React.FC<HackathonPresentationModeProps> = ({
  onNavigate,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const active = STEPS[currentStep - 1];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Slide Navigation Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
            {currentStep}/7
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold text-pink-400">
                Hackathon Storytelling Walkthrough
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {active.badge}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{active.title}</h3>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center space-x-1.5">
          {STEPS.map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`w-7 h-2 rounded-full transition-all ${
                s.step === currentStep
                  ? 'bg-gradient-to-r from-pink-500 to-indigo-500 w-9'
                  : s.step < currentStep
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
              title={`Slide ${s.step}: ${s.title}`}
            />
          ))}
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Slide Body Content */}
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-pink-400">
              Act {currentStep} of 7
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              {active.title}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              {active.subtitle}
            </p>
          </div>

          {/* SLIDE 1: Customer Problem */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">68% of Returns Are Fit-Related</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Consumers order clothing blindly. Subtle grading issues (tight shoulders, high rise, gapping waist) lead to massive dissatisfaction.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">$38 Billion Lost Annually</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Reverse logistics, return shipping, restocking, and damaged inventory eliminate fashion brand margins.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Leaf className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Environmental Catastrophe</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Over 5 billion pounds of returned apparel end up incinerated or in landfills every year because restocking costs exceed manufacturing cost.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 2: Feedback Collected */}
          {currentStep === 2 && (
            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white">
                  Why Traditional Feedback Forms Fail:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Vague 1-star reviews saying "fits weird" provide zero engineering value to technical patternmakers. Asking customers to upload sensitive full-body naked or underwear photos is intrusive and rejected by 94% of users.
                </p>
                <div className="p-4 rounded-xl bg-pink-950/20 border border-pink-500/20 text-xs text-pink-300 font-medium">
                  <strong>The FitPulse Innovation:</strong> A non-invasive 2D silhouette clickable zone selector. Customers specify exact areas (Shoulders, Sleeves, Rise, Waist) with issue pills (Too Tight, Too Loose) in under 45 seconds.
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: AI Pattern Detection */}
          {currentStep === 3 && (
            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  NLP Pipeline in Action
                </span>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
                  <span className="text-slate-500 block mb-1">Customer Input:</span>
                  "The shirt looks good but the shoulders are tight and the sleeves are shorter than expected."
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                    <span className="text-[10px] uppercase text-slate-400 block">Issue 1</span>
                    <strong>Shoulders: Too Tight</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                    <span className="text-[10px] uppercase text-slate-400 block">Issue 2</span>
                    <strong>Sleeves: Too Short</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    <span className="text-[10px] uppercase text-slate-400 block">Sentiment</span>
                    <strong>Negative (-0.72)</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                    <span className="text-[10px] uppercase text-slate-400 block">Severity</span>
                    <strong>Medium Severity</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: Key Fit Problem */}
          {currentStep === 4 && (
            <div className="space-y-4 pt-2">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/30 to-slate-950 border border-rose-500/30 space-y-3">
                <div className="flex items-center space-x-2 text-rose-400">
                  <Flame className="w-5 h-5" />
                  <span className="text-xs uppercase font-bold tracking-wider">
                    Critical Garment Flaw Detected
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Restricted Deltoid Movement in Size M Oxford Shirts
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  While Size S and Size L shirts exhibit standard distribution, Size M suffers from a severe cross-shoulder grading defect. When customers reach forward or type, deltoid seam tension pinches painfully.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 5: Evidence */}
          {currentStep === 5 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Comparative Telemetry:
                </span>
                <p className="text-sm font-bold text-white">
                  Size M has 100% higher concentration of tight shoulder reports than Size S.
                </p>
                <p className="text-xs text-slate-400">
                  Calculated dynamically across 49 Size M customer feedback entries.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Return Velocity Link:
                </span>
                <p className="text-sm font-bold text-rose-400">
                  68% of customers experiencing this issue initiated an immediate return.
                </p>
                <p className="text-xs text-slate-400">
                  Proving that shoulder tightness is the primary driver of return loss for this SKU.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 6: Recommended Design Change */}
          {currentStep === 6 && (
            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Ruler className="w-4 h-4" />
                  <span>Exact Pattern Adjustment Ready for Factory</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Cross Shoulder</span>
                    <strong className="text-white text-sm">44.5 &rarr; 46.0 cm</strong>
                    <span className="text-emerald-400 font-bold block mt-0.5">(+1.5 cm)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Armhole Drop</span>
                    <strong className="text-white text-sm">22.0 &rarr; 22.8 cm</strong>
                    <span className="text-emerald-400 font-bold block mt-0.5">(+0.8 cm)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Size Chart Badge</span>
                    <strong className="text-white text-sm">Broad Deltoid Guide</strong>
                    <span className="text-indigo-400 font-bold block mt-0.5">E-Commerce update</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 7: Expected Impact */}
          {currentStep === 7 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-center">
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <TrendingDown className="w-7 h-7 text-emerald-400 mx-auto" />
                <h4 className="text-2xl font-extrabold text-white">28% Reduction</h4>
                <p className="text-xs text-slate-400">
                  In fit-related returns for Size M Shirts.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-pink-500/30 space-y-2">
                <Sparkles className="w-7 h-7 text-pink-400 mx-auto" />
                <h4 className="text-2xl font-extrabold text-white">+1.2 Stars</h4>
                <p className="text-xs text-slate-400">
                  Improvement in garment wearing comfort scores.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-2">
                <Leaf className="w-7 h-7 text-indigo-400 mx-auto" />
                <h4 className="text-2xl font-extrabold text-white">Zero Textile Waste</h4>
                <p className="text-xs text-slate-400">
                  Flaw fixed before the next production run of 10,000 units.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Slide Footer Controls */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              disabled={currentStep <= 1}
              onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Slide</span>
            </button>

            <button
              disabled={currentStep >= STEPS.length}
              onClick={() => setCurrentStep((p) => Math.min(STEPS.length, p + 1))}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold transition-all"
            >
              <span>Next Slide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('feedback')}
              className="px-4 py-2 rounded-xl bg-pink-600/20 border border-pink-500/40 text-pink-300 text-xs font-semibold hover:bg-pink-600/30 transition-colors"
            >
              Test Customer Submission
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-all"
            >
              Open Brand Dashboard &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
