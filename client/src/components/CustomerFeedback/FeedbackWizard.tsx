import React, { useState } from 'react';
import {
  GarmentType,
  Size,
  FitPreference,
  BodyAreaIssue,
  ReturnReason,
  Feedback,
} from '../../types';
import { BodyAreaSelector } from './BodyAreaSelector';
import { FeedbackSuccessModal } from './FeedbackSuccessModal';
import { submitFeedback } from '../../api/client';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Star,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface FeedbackWizardProps {
  onFeedbackSubmitted: (feedback: Feedback) => void;
  onNavigateToDashboard: () => void;
}

const GARMENT_TYPES: GarmentType[] = [
  'Shirt',
  'T-Shirt',
  'Jeans',
  'Trousers',
  'Dress',
  'Jacket',
  'Hoodie',
  'Kurta',
  'Other',
];

const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const FIT_PREFERENCES: FitPreference[] = ['Slim', 'Regular', 'Relaxed', 'Oversized'];

const RETURN_REASONS: ReturnReason[] = [
  'Fit issue',
  'Size issue',
  'Comfort issue',
  'Quality issue',
  'Style issue',
  'No return',
  'Other',
];

const BRANDS = ['Aura Atelier', 'Nordik Studio', 'Verve Denim', 'Urban Stitch', 'Silk & Stone'];

export const FeedbackWizard: React.FC<FeedbackWizardProps> = ({
  onFeedbackSubmitted,
  onNavigateToDashboard,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 6;

  // Form State
  const [brand, setBrand] = useState<string>('Aura Atelier');
  const [product, setProduct] = useState<string>('Oxford Tailored Shirt');
  const [garmentType, setGarmentType] = useState<GarmentType>('Shirt');
  const [category, setCategory] = useState<string>('Formalwear');
  const [size, setSize] = useState<Size>('M');
  const [expectedSize, setExpectedSize] = useState<Size>('M');
  const [fitPreference, setFitPreference] = useState<FitPreference>('Regular');

  // Step 2: Body Areas
  const [bodyAreas, setBodyAreas] = useState<BodyAreaIssue[]>([
    { area: 'Shoulders', issue: 'Too Tight' },
  ]);

  // Step 3: Ratings
  const [overallRating, setOverallRating] = useState<number>(2);
  const [comfortRating, setComfortRating] = useState<number>(2);
  const [sizeAccuracyRating, setSizeAccuracyRating] = useState<number>(2);

  // Step 4: Text Feedback
  const [comment, setComment] = useState<string>(
    'The shirt looks good but the shoulders are tight and the sleeves are shorter than expected.'
  );

  // Step 5: Optional Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Step 6: Return Reason
  const [returnReason, setReturnReason] = useState<ReturnReason>('Fit issue');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedFeedback, setSubmittedFeedback] = useState<Feedback | null>(null);

  // Quick Demo Auto-Fill
  const handleAutoFillDemoCase = () => {
    setBrand('Aura Atelier');
    setProduct('Oxford Slim Button-Down');
    setGarmentType('Shirt');
    setCategory('Formalwear');
    setSize('M');
    setExpectedSize('M');
    setFitPreference('Regular');
    setBodyAreas([
      { area: 'Shoulders', issue: 'Too Tight' },
      { area: 'Sleeves', issue: 'Too Short' },
    ]);
    setOverallRating(2);
    setComfortRating(2);
    setSizeAccuracyRating(2);
    setComment('The shirt looks good but the shoulders are tight and the sleeves are shorter than expected.');
    setReturnReason('Fit issue');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size exceeds 5MB limit.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let payload: FormData | Record<string, any>;

      if (imageFile) {
        const formData = new FormData();
        formData.append('brand', brand);
        formData.append('product', product);
        formData.append('garmentType', garmentType);
        formData.append('category', category);
        formData.append('size', size);
        formData.append('expectedSize', expectedSize);
        formData.append('fitPreference', fitPreference);
        formData.append('bodyAreas', JSON.stringify(bodyAreas));
        formData.append('overallRating', String(overallRating));
        formData.append('comfortRating', String(comfortRating));
        formData.append('sizeAccuracyRating', String(sizeAccuracyRating));
        formData.append('comment', comment);
        formData.append('returnReason', returnReason);
        formData.append('image', imageFile);
        payload = formData;
      } else {
        payload = {
          brand,
          product,
          garmentType,
          category,
          size,
          expectedSize,
          fitPreference,
          bodyAreas,
          overallRating,
          comfortRating,
          sizeAccuracyRating,
          comment,
          returnReason,
        };
      }

      const created = await submitFeedback(payload);
      setSubmittedFeedback(created);
      onFeedbackSubmitted(created);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedFeedback(null);
    setCurrentStep(1);
    handleAutoFillDemoCase();
  };

  // Helper star rater component
  const renderStarRating = (
    label: string,
    currentValue: number,
    onSelect: (val: number) => void
  ) => {
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-300">{label}</span>
          <span className="text-pink-400 font-bold">{currentValue} of 5 Stars</span>
        </div>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onSelect(star)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-pink-500/50 transition-colors"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= currentValue
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-700'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Banner with Demo Autofill */}
      <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-slate-900 to-indigo-950/40 border border-pink-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Hackathon Evaluation Mode
            </h4>
            <p className="text-[11px] text-slate-400">
              One-click populate the requested Shirt (M) Tight Shoulders & Short Sleeves test case.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoFillDemoCase}
          className="shrink-0 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500 text-pink-300 text-xs font-semibold transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Autofill Sample Test Case</span>
        </button>
      </div>

      {/* Wizard Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-8">
        {/* Step Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>
              STEP {currentStep} OF {totalSteps}:{' '}
              {currentStep === 1 && 'Garment Information'}
              {currentStep === 2 && 'Body Area Problem Selector'}
              {currentStep === 3 && 'Fit & Comfort Ratings'}
              {currentStep === 4 && 'Your Fit Story'}
              {currentStep === 5 && 'Optional Fit Photo'}
              {currentStep === 6 && 'Return Intent & Submit'}
            </span>
            <span className="text-pink-400 font-bold">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Garment Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-white">Garment Details</h3>
              <p className="text-xs text-slate-400">Tell us what you purchased and your expected fit.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-pink-500 outline-none"
                >
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="Other Brand">Other Brand</option>
                </select>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Product Name</label>
                <input
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g. Oxford Slim Button-Down"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-pink-500 outline-none"
                />
              </div>

              {/* Garment Type */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-2">Garment Type</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {GARMENT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setGarmentType(type)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        garmentType === type
                          ? 'bg-pink-600/20 border-pink-500 text-pink-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Purchased */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Size Purchased</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSize(sz)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        size === sz
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expected Size */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Your Usual / Expected Size</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setExpectedSize(sz)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        expectedSize === sz
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Preference */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-2">Preferred Fit Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FIT_PREFERENCES.map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setFitPreference(pref)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${
                        fitPreference === pref
                          ? 'bg-pink-600/20 border-pink-500 text-pink-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Interactive Body Area Selector */}
        {currentStep === 2 && (
          <div className="animate-in fade-in duration-200">
            <BodyAreaSelector
              selectedIssues={bodyAreas}
              onChange={setBodyAreas}
            />
          </div>
        )}

        {/* STEP 3: Ratings */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-white">Rate the Fit Experience</h3>
              <p className="text-xs text-slate-400">Score overall satisfaction, comfort, and size fidelity.</p>
            </div>

            <div className="space-y-5 p-5 rounded-2xl bg-slate-950 border border-slate-800">
              {renderStarRating('Overall Fit Satisfaction', overallRating, setOverallRating)}
              {renderStarRating('Wearing Comfort & Mobility', comfortRating, setComfortRating)}
              {renderStarRating('Size Accuracy (True to Tag)', sizeAccuracyRating, setSizeAccuracyRating)}
            </div>
          </div>
        )}

        {/* STEP 4: Text Feedback */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-white">Tell us what went wrong with the fit</h3>
              <p className="text-xs text-slate-400">
                Our AI analyzes your description to detect subtle fit issues and comfort notes.
              </p>
            </div>

            <div>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Example: The shoulders are tight but the waist is loose. Sleeves are also shorter than expected."
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-pink-500 outline-none leading-relaxed"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>Natural conversational language supported</span>
                <span>{comment.length} characters</span>
              </div>
            </div>

            {/* Quick Inspiration Prompts */}
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                Click to try a sample feedback prompt:
              </span>
              <div className="space-y-2">
                {[
                  'The shirt looks good but the shoulders are tight and the sleeves are shorter than expected.',
                  'The chest fits nicely but the shoulders are very tight whenever I reach forward.',
                  'Waist is loose and gaps around my lower back, while the thighs are uncomfortably tight.',
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setComment(sample)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-pink-500/40 text-xs text-slate-300 transition-colors"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Optional Image Upload */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">Upload Clothing Fit Photo</h3>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Optional
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                You can optionally upload a photo showing the garment fit issue (e.g. shoulder bunching, waist gap).
              </p>
            </div>

            <div className="p-6 border-2 border-dashed border-slate-800 hover:border-pink-500/50 rounded-2xl bg-slate-950/60 text-center transition-colors">
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Fit Preview"
                    className="max-h-48 mx-auto rounded-xl object-contain border border-slate-700"
                  />
                  <div className="flex justify-center space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs hover:bg-rose-500/30"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">Click to select an image</span>
                    <p className="text-xs text-slate-500 mt-0.5">JPEG, PNG, or WebP up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Privacy Reassurance Note */}
            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center space-x-3 text-xs text-indigo-300">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>
                <strong>Privacy Protected:</strong> Photos are purely optional and used strictly by technical
                designers to diagnose sewing tolerances. We never share customer images.
              </span>
            </div>
          </div>
        )}

        {/* STEP 6: Return Reason & Submit */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-white">Return or Exchange Status</h3>
              <p className="text-xs text-slate-400">Did this fit issue cause you to return or keep the item?</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {RETURN_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setReturnReason(reason)}
                  className={`p-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    returnReason === reason
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {/* Summary Preview Box before submission */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 block uppercase text-[10px] tracking-wider">
                Submission Summary
              </span>
              <p className="text-slate-400">
                <strong className="text-white">{garmentType}</strong> ({size}) • {brand} •{' '}
                <span className="text-pink-400">{bodyAreas.length} problem areas tagged</span>
              </p>
              <p className="text-slate-400 italic">"{comment}"</p>
            </div>

            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex items-center space-x-2 px-7 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-pink-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{isSubmitting ? 'Analyzing & Saving...' : 'Submit Feedback'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {submittedFeedback && (
        <FeedbackSuccessModal
          feedback={submittedFeedback}
          onViewDashboard={onNavigateToDashboard}
          onResetForm={handleResetForm}
        />
      )}
    </div>
  );
};
