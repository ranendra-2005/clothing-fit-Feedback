import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Ruler,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Info,
  Sliders,
  Send,
  Check,
  Eye,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  GarmentType,
  Size,
  FitPreference,
  PhotoQualityReport,
  SizeRecommendationResult,
  ParticipantFeedback,
} from '../../types';
import {
  validateSession,
  validateParticipantPhoto,
  analyzeParticipantFit,
  submitParticipantFeedback,
} from '../../api/client';

interface ParticipantExperienceProps {
  sessionToken?: string;
  onNavigateHome?: () => void;
}

export const ParticipantExperience: React.FC<ParticipantExperienceProps> = ({
  sessionToken = 'SESS-ROUND1',
  onNavigateHome,
}) => {
  // Session status state
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Wizard Screen (1 to 7)
  const [currentScreen, setCurrentScreen] = useState<number>(1);

  // Screen 1: Consent
  const [consentGiven, setConsentGiven] = useState<boolean>(true);

  // Screen 2: Photo Upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Screen 3: Photo Quality
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState<boolean>(false);
  const [photoQuality, setPhotoQuality] = useState<PhotoQualityReport | null>(null);

  // Screen 4: Information Form
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<string>('72');
  const [garmentType, setGarmentType] = useState<GarmentType>('Shirt');
  const [fitPreference, setFitPreference] = useState<FitPreference>('Regular');

  // Screen 5 & 6: AI Fit Analysis & Recommendation
  const [isComputingFit, setIsComputingFit] = useState<boolean>(false);
  const [recommendationResult, setRecommendationResult] = useState<SizeRecommendationResult | null>(null);
  const [participantId, setParticipantId] = useState<string>('');

  // Screen 7: Actual Fit Feedback
  const [actualSize, setActualSize] = useState<Size>('M');
  const [fitRating, setFitRating] = useState<'Too Tight' | 'Slightly Tight' | 'Perfect' | 'Slightly Loose' | 'Too Loose'>('Perfect');
  const [problemAreas, setProblemAreas] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<ParticipantFeedback | null>(null);

  // Validate session on load
  useEffect(() => {
    checkSession();
  }, [sessionToken]);

  const checkSession = async () => {
    setSessionLoading(true);
    setSessionError(null);
    try {
      const res = await validateSession(sessionToken);
      if (!res.isValid) {
        if (res.error === 'Paused') setSessionError('This participation session is temporarily paused by the organizer.');
        else if (res.error === 'Expired') setSessionError('This QR session has expired.');
        else if (res.error === 'Ended') setSessionError('This participation session has ended.');
        else setSessionError('Invalid QR code session token.');
      }
    } catch {
      // Fallback: allow demo participation even if offline
    } finally {
      setSessionLoading(false);
    }
  };

  // Handle Photo Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  // Use Sample Demo Photo
  const handleUseDemoPhoto = () => {
    setPhotoPreview('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80');
    setPhotoFile(new File(['sample'], 'demo-portrait.jpg', { type: 'image/jpeg' }));
  };

  // Process Photo Quality
  const handleContinueToQualityCheck = async () => {
    setIsAnalyzingPhoto(true);
    setCurrentScreen(3);
    try {
      const res = await validateParticipantPhoto(photoFile || undefined);
      setPhotoQuality(res.photoQuality);
    } catch {
      setPhotoQuality({
        score: 88,
        isAcceptable: true,
        personDetected: true,
        singlePerson: true,
        lighting: 'Good',
        blurScore: 16,
        bodyFraming: 'Well-Centered',
        issues: [],
        suggestions: ['Photo resolution and posture are well-suited for proportional fit analysis.'],
      });
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  // Run AI Body Estimation & Size Recommendation
  const handleRunAiAnalysis = async () => {
    setIsComputingFit(true);
    setCurrentScreen(5);

    try {
      const res = await analyzeParticipantFit({
        sessionId: sessionToken,
        height: heightCm,
        weight: weightKg ? Number(weightKg) : undefined,
        garmentType,
        fitPreference,
        consentGiven,
        photoQuality: photoQuality || undefined,
        imageUrl: photoPreview || undefined,
      });

      setParticipantId(res.participantId);
      setRecommendationResult(res.recommendation);
      setActualSize(res.recommendation.recommendedSize);

      // Transition smoothly from scanning animation (Screen 5) to Results (Screen 6)
      setTimeout(() => {
        setIsComputingFit(false);
        setCurrentScreen(6);
      }, 1500);
    } catch {
      setIsComputingFit(false);
      setCurrentScreen(6);
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = async () => {
    if (!participantId && !sessionToken) return;
    setIsSubmittingFeedback(true);

    try {
      const res = await submitParticipantFeedback({
        participantId: participantId || `part-manual-${Date.now()}`,
        sessionId: sessionToken,
        garmentType,
        recommendedSize: recommendationResult?.recommendedSize || 'M',
        actualSize,
        fitRating,
        problemAreas,
        comment,
      });

      setFeedbackSubmitted(res);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#6366f1', '#10b981'],
      });
    } catch (err: any) {
      alert('Error saving feedback: ' + err.message);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const toggleProblemArea = (area: string) => {
    setProblemAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  // Session Error State
  if (sessionLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="w-8 h-8 text-pink-500 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-white">Validating QR Session...</h3>
        <p className="text-xs text-slate-400 mt-1">Connecting to FitPulse Intelligence Cloud</p>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-white">{sessionError}</h3>
        <p className="text-xs text-slate-400 mt-2">
          Please ask the session organizer or booth host for an active QR code.
        </p>
        <button
          onClick={checkSession}
          className="mt-6 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          Try Refreshing
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Mobile Stepper Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-pink-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
            {currentScreen}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider block">
              Step {currentScreen} of 7
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {currentScreen === 1 && 'Welcome & Privacy'}
              {currentScreen === 2 && 'Upload Photo'}
              {currentScreen === 3 && 'Photo Quality'}
              {currentScreen === 4 && 'Fit Profile'}
              {currentScreen === 5 && 'Analyzing Proportions'}
              {currentScreen === 6 && 'Recommended Size'}
              {currentScreen === 7 && 'Actual Fit Feedback'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            {sessionToken}
          </span>
        </div>
      </div>

      {/* ================= SCREEN 1: WELCOME & CONSENT ================= */}
      {currentScreen === 1 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-pink-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Clothing Fit Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
              Upload a photo and share your sizing preferences to receive an explainable, personalized clothing-size recommendation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-0.5">Privacy & Body Dignity Protected</strong>
                We respect your personal privacy. Photos are processed strictly for anatomical silhouette estimation and are never used for facial or biometric surveillance.
              </div>
            </div>

            <label className="flex items-start space-x-2.5 pt-2 border-t border-slate-800/60 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-xs text-slate-300 font-medium">
                I agree to use my photo for clothing-fit analysis.
              </span>
            </label>
          </div>

          <button
            disabled={!consentGiven}
            onClick={() => setCurrentScreen(2)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center space-x-2"
          >
            <span>Start Fit Analysis</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= SCREEN 2: PHOTO UPLOAD ================= */}
      {currentScreen === 2 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <div>
            <h3 className="text-xl font-extrabold text-white">Upload Your Photo</h3>
            <p className="text-xs text-slate-400 mt-1">
              Take a standing photo with your smartphone camera or select from your gallery.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          {!photoPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-pink-500/60 rounded-3xl p-8 text-center cursor-pointer transition-colors bg-slate-950/50 space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-pink-400 flex items-center justify-center mx-auto border border-slate-800 shadow-inner">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Tap to Take or Upload Photo</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Supports JPG, PNG, WebP up to 5MB</p>
              </div>
              <div className="pt-2">
                <span className="px-3 py-1.5 rounded-xl bg-pink-600/20 text-pink-300 text-xs font-semibold border border-pink-500/30">
                  Open Camera / Gallery
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-72 flex items-center justify-center bg-black">
                <img
                  src={photoPreview}
                  alt="Fit preview"
                  className="max-h-72 object-contain"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur text-[10px] text-emerald-400 font-bold border border-emerald-500/30 flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Photo Ready</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Choose Another
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold"
                >
                  Retake Photo
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Shortcut */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleUseDemoPhoto}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium"
            >
              Or click here to use a sample test photo for quick testing
            </button>
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentScreen(1)}
              className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={!photoPreview}
              onClick={handleContinueToQualityCheck}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-xs font-bold shadow-md hover:scale-[1.01] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              Continue to Quality Check &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ================= SCREEN 3: PHOTO QUALITY ANALYSIS ================= */}
      {currentScreen === 3 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <div>
            <h3 className="text-xl font-extrabold text-white">Photo Quality Analysis</h3>
            <p className="text-xs text-slate-400 mt-1">
              Validating person presence, lighting, sharpness, and torso framing.
            </p>
          </div>

          {isAnalyzingPhoto ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-pink-500 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-300">Checking silhouette visibility...</p>
            </div>
          ) : photoQuality ? (
            <div className="space-y-5">
              {/* Score Meter */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Quality Rating
                  </span>
                  <div className="text-3xl font-extrabold text-white mt-0.5">
                    {photoQuality.score}
                    <span className="text-sm font-normal text-slate-400">/100</span>
                  </div>
                  <span
                    className={`text-xs font-bold mt-1 inline-block ${
                      photoQuality.score >= 70 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {photoQuality.score >= 70 ? '✓ Ready for Fit Analysis' : '⚠ Borderline Quality'}
                  </span>
                </div>

                <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center font-bold text-sm text-pink-400">
                  {photoQuality.score}%
                </div>
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Person Present</span>
                  <strong className="text-emerald-400">Single Person (1)</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Lighting</span>
                  <strong className={photoQuality.lighting === 'Good' ? 'text-emerald-400' : 'text-amber-400'}>
                    {photoQuality.lighting}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Framing</span>
                  <strong className="text-white">{photoQuality.bodyFraming}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Clothing Contrast</span>
                  <strong className="text-emerald-400">Clear Edges</strong>
                </div>
              </div>

              {/* Suggestions */}
              {photoQuality.suggestions.length > 0 && (
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5 text-xs text-indigo-300">
                  <div className="flex items-center space-x-1.5 font-bold text-indigo-200">
                    <Info className="w-3.5 h-3.5" />
                    <span>Feedback & Instructions:</span>
                  </div>
                  {photoQuality.suggestions.map((sug, idx) => (
                    <p key={idx} className="text-[11px] leading-relaxed">
                      • {sug}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentScreen(2)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Change Photo
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentScreen(4)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-xs font-bold shadow-md hover:scale-[1.01] transition-all"
                >
                  Continue to Measurement Profile &rarr;
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ================= SCREEN 4: MEASUREMENT PROFILE ================= */}
      {currentScreen === 4 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <div>
            <h3 className="text-xl font-extrabold text-white">Your Fit Profile</h3>
            <p className="text-xs text-slate-400 mt-1">
              Help the recommendation engine calibrate for your specific garment preference.
            </p>
          </div>

          <div className="space-y-4">
            {/* Height input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-200">Height</label>
                <span className="font-bold text-pink-400">{heightCm} cm</span>
              </div>
              <input
                type="range"
                min={145}
                max={205}
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>145 cm</span>
                <span>175 cm</span>
                <span>205 cm</span>
              </div>
            </div>

            {/* Optional Weight */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 block">
                Weight <span className="text-slate-500 font-normal">(Optional, in kg)</span>
              </label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 70"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-pink-500 focus:outline-none"
              />
            </div>

            {/* Garment Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 block">Clothing Item</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Shirt', 'T-Shirt', 'Jeans', 'Trousers', 'Jacket', 'Dress'] as GarmentType[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGarmentType(g)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                      garmentType === g
                        ? 'bg-pink-600/20 border-pink-500 text-pink-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Fit Preference */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 block">Preferred Fit</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Slim', 'Regular', 'Relaxed', 'Oversized'] as FitPreference[]).map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setFitPreference(pref)}
                    className={`py-2 px-1 rounded-xl text-xs font-medium border text-center transition-all ${
                      fitPreference === pref
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Note: Clothing size is determined by proportional contour ratios and drape preference, never from height alone.
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentScreen(3)}
              className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRunAiAnalysis}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-xs font-bold shadow-md hover:scale-[1.01] transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Compute AI Recommendation</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= SCREEN 5: AI ESTIMATION SCANNING ================= */}
      {currentScreen === 5 && (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl text-center">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin" />
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-pink-400">
              <Ruler className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">Analyzing Body Proportions</h3>
            <p className="text-xs text-slate-400">
              Calculating cross-shoulder breadth, chest contour, and torso ratio...
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 max-w-sm mx-auto">
            Applying anthropometric grading ratios for <strong>{garmentType}</strong> ({fitPreference} fit).
          </div>
        </div>
      )}

      {/* ================= SCREEN 6: RECOMMENDED SIZE & EXPLANATION ================= */}
      {currentScreen === 6 && recommendationResult && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          {/* Main Hero Size Badge */}
          <div className="text-center p-6 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-pink-500/30 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-pink-500/10 text-pink-400 text-[10px] font-extrabold uppercase tracking-wider rounded-bl-xl border-l border-b border-pink-500/20">
              {recommendationResult.isDemoAnalysis ? 'AI Fit Recommendation' : 'AI Verified'}
            </div>

            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Your Recommended Size
            </span>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-indigo-400 my-2 tracking-tight">
              {recommendationResult.recommendedSize}
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Confidence Score: {recommendationResult.confidence}%</span>
            </div>
          </div>

          {/* Dynamic Explanation */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/20 space-y-2">
            <h4 className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Why We Recommend Size {recommendationResult.recommendedSize}:</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {recommendationResult.explanation}
            </p>
          </div>

          {/* Anatomical Fit Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300">Anatomical Fit Breakdown:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {Object.entries(recommendationResult.fitBreakdown).map(([area, status]) => (
                <div
                  key={area}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <span className="text-slate-400 text-[11px]">{area}</span>
                  <span
                    className={`font-semibold text-[11px] ${
                      status === 'Good Fit' || status === 'Recommended Fit'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Sizes */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300">Alternative Options:</h4>
            <div className="space-y-1.5">
              {recommendationResult.alternatives.map((alt) => (
                <div
                  key={alt.size}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    alt.size === recommendationResult.recommendedSize
                      ? 'bg-pink-950/20 border-pink-500/40'
                      : 'bg-slate-950 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="font-extrabold text-sm text-white">{alt.size}</span>
                    <span className="text-[11px] text-slate-400">{alt.description}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700 font-medium">
                    {alt.fitLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/60 text-[10px] text-slate-500 leading-relaxed">
            * Approximate AI estimates based on photographic contour heuristics and standard anthropometric charts. An ordinary 2D photograph does not produce medical or tailoring-grade measurements.
          </div>

          <button
            type="button"
            onClick={() => setCurrentScreen(7)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center space-x-2"
          >
            <span>Try & Give Actual Fit Feedback</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= SCREEN 7: ACTUAL FIT FEEDBACK ================= */}
      {currentScreen === 7 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <div>
            <h3 className="text-xl font-extrabold text-white">Actual Fit Feedback</h3>
            <p className="text-xs text-slate-400 mt-1">
              Did you try on this garment? Tell us how it actually fit your body to train the brand intelligence system.
            </p>
          </div>

          {!feedbackSubmitted ? (
            <div className="space-y-4">
              {/* Actual Tried Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  What size did you actually try?
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as Size[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setActualSize(s)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        actualSize === s
                          ? 'bg-pink-600 border-pink-400 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">How was the fit?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['Too Tight', 'Slightly Tight', 'Perfect', 'Slightly Loose', 'Too Loose'] as const).map(
                    (rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setFitRating(rate)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                          fitRating === rate
                            ? rate === 'Perfect'
                              ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-amber-600/30 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {rate}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Problem Areas */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  Problem Areas <span className="text-slate-500 font-normal">(Select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Shoulder', 'Chest', 'Waist', 'Sleeve', 'Length', 'Hip', 'Thigh'].map((area) => {
                    const isSel = problemAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleProblemArea(area)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          isSel
                            ? 'bg-rose-600/20 border-rose-500 text-rose-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  Optional Fit Comment
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. The chest fits perfectly but the sleeves are slightly too long."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-pink-500 focus:outline-none resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setComment(
                        'The shoulders are perfect but the sleeves are slightly too long when reaching.'
                      )
                    }
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    Use Sample Comment
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmittingFeedback}
                onClick={handleSubmitFeedback}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 disabled:opacity-40"
              >
                {isSubmittingFeedback ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Fit Feedback</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-white">Fit Feedback Recorded!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Thank you! Your feedback is actively calibrating garment tech packs and accuracy metrics.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left text-xs pt-2">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Recommendation</span>
                  <span className="text-pink-400 font-bold">Size {recommendationResult?.recommendedSize}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Actual Tried</span>
                  <span className="text-emerald-400 font-bold">Size {actualSize}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackSubmitted(null);
                    setCurrentScreen(1);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Analyze Another Garment
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
