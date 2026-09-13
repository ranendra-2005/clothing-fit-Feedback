import {
  GarmentType,
  Size,
  FitPreference,
  PhotoQualityReport,
  BodyProportions,
  SizeRecommendationResult,
  SizeAlternative,
  ParticipantFeedback,
  BrandInsightItem,
} from '../types';

/**
 * Validates uploaded photo quality for body fit analysis
 * Computes a quality score 0-100 and provides actionable guidance.
 */
export function validateImageQuality(file: {
  size: number;
  mimetype: string;
  originalname?: string;
}): PhotoQualityReport {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 85;

  // File size checks (Optimal 200KB - 4MB)
  if (file.size < 40 * 1024) {
    score -= 25;
    issues.push('Image resolution is very low (file size < 40KB)');
    suggestions.push('Upload a higher-resolution photo taken with your smartphone camera');
  } else if (file.size > 4.8 * 1024 * 1024) {
    score -= 10;
    issues.push('Image size is close to the 5MB upload limit');
  }

  // Simulated computer vision heuristic checks
  const hash = Math.abs(
    (file.originalname || 'photo.jpg')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), file.size)
  );

  const lightingType = hash % 5 === 0 ? 'Fair' : 'Good';
  const blurScore = 15 + (hash % 20); // low blur is good
  const framingType = hash % 8 === 0 ? 'Too Close' : 'Well-Centered';

  if (lightingType === 'Fair') {
    score -= 12;
    issues.push('Ambient lighting is slightly uneven or backlit');
    suggestions.push('Face a natural light source or lamp to illuminate your clothing silhouette');
  }

  if (framingType === 'Too Close') {
    score -= 15;
    issues.push('Camera is framed too close; shoulders or waist partially clipped');
    suggestions.push('Step back 2-3 paces so your full torso and shoulders are in view');
  }

  const isAcceptable = score >= 55;
  if (!isAcceptable) {
    suggestions.unshift('Please retake with your body centered, standing straight against a plain background');
  }

  return {
    score: Math.max(20, Math.min(98, score)),
    isAcceptable,
    personDetected: true,
    singlePerson: true,
    lighting: lightingType,
    blurScore,
    bodyFraming: framingType,
    issues,
    suggestions: suggestions.length > 0 ? suggestions : ['Photo framing and clarity are excellent for fit analysis'],
  };
}

/**
 * Estimates anatomical body proportions using height, weight/BMI and anthropological ratios.
 * All measurements are clearly identified as approximate AI estimates.
 */
export function estimateBodyProportions(
  heightCm: number,
  weightKg?: number,
  _garmentType: GarmentType = 'Shirt',
  _fitPreference: FitPreference = 'Regular'
): BodyProportions {
  const safeHeight = Math.max(140, Math.min(220, heightCm || 175));
  
  // Normalized BMI factor (22 is standard BMI)
  const estimatedWeight = weightKg && weightKg > 35 && weightKg < 200
    ? weightKg
    : (safeHeight - 100) * 0.9;
  
  const heightM = safeHeight / 100;
  const bmi = estimatedWeight / (heightM * heightM);
  const bmiFactor = Math.max(0.8, Math.min(1.35, bmi / 22.0));

  // Anthropological grade ratios with non-linear BMI elasticity
  const shoulderWidthCm = Math.round((safeHeight * 0.258 * Math.pow(bmiFactor, 0.35)) * 10) / 10;
  const chestCircumferenceCm = Math.round((safeHeight * 0.545 * Math.pow(bmiFactor, 0.72)) * 10) / 10;
  const waistCircumferenceCm = Math.round((safeHeight * 0.448 * Math.pow(bmiFactor, 0.88)) * 10) / 10;
  const hipCircumferenceCm = Math.round((safeHeight * 0.540 * Math.pow(bmiFactor, 0.62)) * 10) / 10;
  const armLengthCm = Math.round((safeHeight * 0.365) * 10) / 10;
  const torsoLengthCm = Math.round((safeHeight * 0.412) * 10) / 10;

  return {
    shoulderWidthCm,
    chestCircumferenceCm,
    waistCircumferenceCm,
    hipCircumferenceCm,
    armLengthCm,
    torsoLengthCm,
    confidenceScore: Math.round(82 + (safeHeight % 12)),
    isApproximate: true,
  };
}

// Garment Sizing Standards
interface SizeRange {
  size: Size;
  chestMin: number;
  chestMax: number;
  shoulderMin: number;
  shoulderMax: number;
  waistMin: number;
  waistMax: number;
  heightMin: number;
  heightMax: number;
}

const SIZE_CHART: SizeRange[] = [
  { size: 'XS', chestMin: 82, chestMax: 88, shoulderMin: 40.0, shoulderMax: 42.5, waistMin: 68, waistMax: 74, heightMin: 150, heightMax: 165 },
  { size: 'S',  chestMin: 88, chestMax: 94, shoulderMin: 42.5, shoulderMax: 44.5, waistMin: 74, waistMax: 80, heightMin: 163, heightMax: 173 },
  { size: 'M',  chestMin: 94, chestMax: 102, shoulderMin: 44.5, shoulderMax: 47.0, waistMin: 80, waistMax: 88, heightMin: 171, heightMax: 181 },
  { size: 'L',  chestMin: 102, chestMax: 110, shoulderMin: 47.0, shoulderMax: 49.5, waistMin: 88, waistMax: 96, heightMin: 179, heightMax: 188 },
  { size: 'XL', chestMin: 110, chestMax: 118, shoulderMin: 49.5, shoulderMax: 52.0, waistMin: 96, waistMax: 104, heightMin: 185, heightMax: 194 },
  { size: 'XXL', chestMin: 118, chestMax: 128, shoulderMin: 52.0, shoulderMax: 55.0, waistMin: 104, waistMax: 116, heightMin: 188, heightMax: 205 },
];

/**
 * Generates an explainable clothing size recommendation
 */
export function recommendSize(
  measurements: BodyProportions,
  heightCm: number,
  _weightKg?: number,
  garmentType: GarmentType = 'Shirt',
  fitPreference: FitPreference = 'Regular',
  photoQuality?: PhotoQualityReport
): SizeRecommendationResult {
  let bestSize: Size = 'M';
  let bestScore = Infinity;

  const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  for (const s of SIZE_CHART) {
    const chestMid = (s.chestMin + s.chestMax) / 2;
    const shoulderMid = (s.shoulderMin + s.shoulderMax) / 2;
    const waistMid = (s.waistMin + s.waistMax) / 2;

    const chestDiff = Math.abs(measurements.chestCircumferenceCm - chestMid) / 8;
    const shoulderDiff = Math.abs(measurements.shoulderWidthCm - shoulderMid) / 2.5;
    const waistDiff = Math.abs(measurements.waistCircumferenceCm - waistMid) / 8;
    const heightDiff = heightCm < s.heightMin ? (s.heightMin - heightCm) / 10 : heightCm > s.heightMax ? (heightCm - s.heightMax) / 10 : 0;

    const totalDiff = chestDiff * 0.45 + shoulderDiff * 0.35 + waistDiff * 0.15 + heightDiff * 0.05;

    if (totalDiff < bestScore) {
      bestScore = totalDiff;
      bestSize = s.size;
    }
  }

  // Adjust for Fit Preference
  let finalSizeIndex = SIZES.indexOf(bestSize);
  if (fitPreference === 'Slim' && finalSizeIndex > 0) {
    if (measurements.chestCircumferenceCm < (SIZE_CHART[finalSizeIndex].chestMin + 2)) {
      finalSizeIndex = Math.max(0, finalSizeIndex - 1);
    }
  } else if ((fitPreference === 'Relaxed' || fitPreference === 'Oversized') && finalSizeIndex < SIZES.length - 1) {
    if (fitPreference === 'Oversized') {
      finalSizeIndex = Math.min(SIZES.length - 1, finalSizeIndex + 1);
    } else if (measurements.chestCircumferenceCm > (SIZE_CHART[finalSizeIndex].chestMax - 2)) {
      finalSizeIndex = Math.min(SIZES.length - 1, finalSizeIndex + 1);
    }
  }

  const recommendedSize = SIZES[finalSizeIndex];
  const matchedRange = SIZE_CHART[finalSizeIndex];

  // Fit Breakdown per anatomical zone
  const shoulderTolerance = measurements.shoulderWidthCm - ((matchedRange.shoulderMin + matchedRange.shoulderMax) / 2);
  const chestTolerance = measurements.chestCircumferenceCm - ((matchedRange.chestMin + matchedRange.chestMax) / 2);
  const waistTolerance = measurements.waistCircumferenceCm - ((matchedRange.waistMin + matchedRange.waistMax) / 2);

  const fitBreakdown: Record<string, string> = {
    Shoulder: shoulderTolerance > 1.8 ? 'Slightly Tight' : shoulderTolerance < -1.8 ? 'Slightly Loose' : 'Good Fit',
    Chest: chestTolerance > 4 ? 'Slightly Tight' : chestTolerance < -4 ? 'Slightly Loose' : 'Good Fit',
    Waist: waistTolerance > 4 ? 'Slightly Tight' : waistTolerance < -4 ? 'Slightly Loose' : 'Good Fit',
    Sleeve: 'Good Fit',
    Length: 'Good Fit',
    Overall: 'Recommended Fit',
  };

  // Alternatives
  const prevSize = finalSizeIndex > 0 ? SIZES[finalSizeIndex - 1] : null;
  const nextSize = finalSizeIndex < SIZES.length - 1 ? SIZES[finalSizeIndex + 1] : null;

  const alternatives: SizeAlternative[] = [];
  if (prevSize) {
    alternatives.push({
      size: prevSize,
      description: `May feel snug across chest (${measurements.chestCircumferenceCm}cm) and shoulders`,
      fitLabel: 'Closer Fit / Snug',
    });
  }

  alternatives.push({
    size: recommendedSize,
    description: `Optimal anatomical balance based on your ${fitPreference.toLowerCase()} fit preference`,
    fitLabel: 'Best Overall Match',
  });

  if (nextSize) {
    alternatives.push({
      size: nextSize,
      description: `Provides roomier drape with +2cm chest and torso ease`,
      fitLabel: 'Relaxed / Layering',
    });
  }

  // Dynamic explanation
  const explanation = `Your estimated shoulder (${measurements.shoulderWidthCm} cm) and chest (${measurements.chestCircumferenceCm} cm) proportions align closest with the standard ${recommendedSize} size range for ${garmentType}s. Based on your selected ${fitPreference.toLowerCase()}-fit preference and height (${heightCm} cm), size ${recommendedSize} provides the best balance of comfort, range of motion, and silhouette drape.`;

  return {
    recommendedSize,
    confidence: Math.round(84 + (1 - Math.min(1, bestScore)) * 12),
    alternatives,
    fitBreakdown,
    explanation,
    isDemoAnalysis: true,
    measurements,
    photoQuality: photoQuality || {
      score: 85,
      isAcceptable: true,
      personDetected: true,
      singlePerson: true,
      lighting: 'Good',
      blurScore: 18,
      bodyFraming: 'Well-Centered',
      issues: [],
      suggestions: ['High quality photo validation'],
    },
  };
}

/**
 * Calculates Recommendation Accuracy metrics comparing AI recommendation with actual tried size
 */
export function computeRecommendationAccuracy(feedbacks: ParticipantFeedback[]) {
  if (feedbacks.length === 0) {
    return {
      totalEvaluated: 0,
      exactMatches: 0,
      accuracyRate: 0,
      avgSizeDifference: 0,
      oneSizeDifferenceRate: 0,
      twoPlusSizeDifferenceRate: 0,
      sizeDistributionRecommended: [],
      sizeDistributionActual: [],
      fitSatisfactionBreakdown: [],
      problemAreaFrequency: [],
    };
  }

  const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  let exactMatches = 0;
  let oneSizeDiff = 0;
  let twoPlusDiff = 0;
  let totalDelta = 0;

  const recCounts: Record<string, number> = {};
  const actCounts: Record<string, number> = {};
  const satCounts: Record<string, number> = {};
  const areaCounts: Record<string, number> = {};

  feedbacks.forEach((f) => {
    const recIdx = SIZES.indexOf(f.recommendedSize);
    const actIdx = SIZES.indexOf(f.actualSize);
    const diff = recIdx !== -1 && actIdx !== -1 ? Math.abs(recIdx - actIdx) : 0;

    totalDelta += diff;
    if (diff === 0) exactMatches++;
    else if (diff === 1) oneSizeDiff++;
    else twoPlusDiff++;

    recCounts[f.recommendedSize] = (recCounts[f.recommendedSize] || 0) + 1;
    actCounts[f.actualSize] = (actCounts[f.actualSize] || 0) + 1;
    satCounts[f.fitRating] = (satCounts[f.fitRating] || 0) + 1;

    (f.problemAreas || []).forEach((area) => {
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    });
  });

  const total = feedbacks.length;
  const accuracyRate = Math.round((exactMatches / total) * 1000) / 10;
  const avgSizeDifference = Math.round((totalDelta / total) * 100) / 100;

  const sizeDistributionRecommended = SIZES.map((s) => ({
    size: s,
    count: recCounts[s] || 0,
    percentage: Math.round(((recCounts[s] || 0) / total) * 100),
  }));

  const sizeDistributionActual = SIZES.map((s) => ({
    size: s,
    count: actCounts[s] || 0,
    percentage: Math.round(((actCounts[s] || 0) / total) * 100),
  }));

  const fitSatisfactionBreakdown = Object.entries(satCounts).map(([rating, count]) => ({
    rating,
    count,
    percentage: Math.round((count / total) * 100),
  }));

  const problemAreaFrequency = Object.entries(areaCounts)
    .map(([area, count]) => ({
      area,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalEvaluated: total,
    exactMatches,
    accuracyRate,
    avgSizeDifference,
    oneSizeDifferenceRate: Math.round((oneSizeDiff / total) * 100),
    twoPlusSizeDifferenceRate: Math.round((twoPlusDiff / total) * 100),
    sizeDistributionRecommended,
    sizeDistributionActual,
    fitSatisfactionBreakdown,
    problemAreaFrequency,
  };
}

/**
 * Generates dynamic fashion/designer intelligence from real participant feedback
 */
export function generateBrandInsightsFromData(feedbacks: ParticipantFeedback[]): BrandInsightItem[] {
  const insights: BrandInsightItem[] = [];

  if (feedbacks.length === 0) {
    return [
      {
        id: 'ins-default-1',
        insight: 'Awaiting participant feedback to generate live sizing insights',
        evidence: '0 participant submissions recorded in this session',
        recommendation: 'Share the participant QR code with attendees to collect real-world telemetry',
        severity: 'Low',
        affectedMetric: 'Session Participation',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  // 1. Calculate problem areas
  const areaCounts: Record<string, number> = {};
  feedbacks.forEach((f) => {
    (f.problemAreas || []).forEach((a) => {
      areaCounts[a] = (areaCounts[a] || 0) + 1;
    });
  });

  const sortedAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);
  if (sortedAreas.length > 0) {
    const [topArea, topCount] = sortedAreas[0];
    const topPct = Math.round((topCount / feedbacks.length) * 100);
    if (topPct >= 20) {
      insights.push({
        id: `ins-area-${Date.now()}`,
        insight: `${topPct}% of participants reported ${topArea} fit defects`,
        evidence: `${topCount} of ${feedbacks.length} participants experienced issues in the ${topArea} region`,
        recommendation: `Review ${topArea.toLowerCase()} grading tolerances in master tech packs. Add +1.2cm to +1.5cm ease in the next production iteration`,
        severity: 'Medium',
        affectedMetric: `${topArea} Defect Rate`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 2. Sizing mismatch trends
  const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  let sizedUpCount = 0;

  feedbacks.forEach((f) => {
    const recIdx = SIZES.indexOf(f.recommendedSize);
    const actIdx = SIZES.indexOf(f.actualSize);
    if (actIdx > recIdx) sizedUpCount++;
  });

  const sizedUpPct = Math.round((sizedUpCount / feedbacks.length) * 100);
  if (sizedUpPct >= 25) {
    insights.push({
      id: `ins-sizeup-${Date.now()}`,
      insight: `${sizedUpPct}% of participants preferred one size larger than recommended`,
      evidence: `${sizedUpCount} users selected larger sizes for looser shoulder/torso drape`,
      recommendation: 'Update e-commerce size guidance to: "For a relaxed silhouette or broad shoulders, size up." Consider expanding garment ease by +2cm.',
      severity: 'Medium',
      affectedMetric: 'Size Chart Accuracy',
      createdAt: new Date().toISOString(),
    });
  }

  // 3. Size M specific satisfaction
  const sizeMFeedbacks = feedbacks.filter((f) => f.actualSize === 'M');
  if (sizeMFeedbacks.length >= 3) {
    const mPerfect = sizeMFeedbacks.filter((f) => f.fitRating === 'Perfect').length;
    const mPct = Math.round((mPerfect / sizeMFeedbacks.length) * 100);
    insights.push({
      id: `ins-sizeM-${Date.now()}`,
      insight: `Size M produced a ${mPct}% successful perfect-fit rate`,
      evidence: `Validated across ${sizeMFeedbacks.length} participants trying Size M`,
      recommendation: mPct >= 70
        ? 'Maintain current Size M block pattern as reference benchmark for grading adjacent sizes'
        : 'Re-evaluate cross-shoulder and sleeve armhole drop for Size M block pattern',
      severity: mPct >= 70 ? 'Low' : 'High',
      affectedMetric: 'Size M Fit Success',
      createdAt: new Date().toISOString(),
    });
  }

  return insights;
}
