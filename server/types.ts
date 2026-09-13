export type GarmentType =
  | 'T-Shirt'
  | 'Shirt'
  | 'Jeans'
  | 'Trousers'
  | 'Dress'
  | 'Jacket'
  | 'Hoodie'
  | 'Kurta'
  | 'Other';

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type FitPreference = 'Slim' | 'Regular' | 'Relaxed' | 'Oversized';

export type BodyArea =
  | 'Shoulders'
  | 'Chest'
  | 'Waist'
  | 'Hips'
  | 'Sleeves'
  | 'Length'
  | 'Neck'
  | 'Arms'
  | 'Thighs'
  | 'Rise'
  | 'Other';

export type FitIssueType =
  | 'Too Tight'
  | 'Too Loose'
  | 'Too Short'
  | 'Too Long'
  | 'Fits Correctly'
  | 'Other';

export type ReturnReason =
  | 'Fit issue'
  | 'Size issue'
  | 'Comfort issue'
  | 'Quality issue'
  | 'Style issue'
  | 'No return'
  | 'Other';

export type Sentiment = 'Positive' | 'Neutral' | 'Negative';

export type Severity = 'Low' | 'Medium' | 'High';

export interface BodyAreaIssue {
  area: BodyArea;
  issue: FitIssueType;
}

export interface AiExtractedIssue {
  area: BodyArea | string;
  issue: FitIssueType | string;
}

export interface AiAnalysisResult {
  fitIssues: AiExtractedIssue[];
  positiveAreas: string[];
  fitPreference?: FitPreference | string;
  sentiment: Sentiment;
  severity: Severity;
  returnReason?: ReturnReason | string;
  aiSummary: string;
  engineUsed: 'Gemini-2.5-Flash' | 'Rule-based-NLP';
}

export interface Feedback {
  id: string;
  timestamp: string;
  brand: string;
  product: string;
  garmentType: GarmentType;
  category: string;
  size: Size;
  expectedSize: Size;
  fitPreference: FitPreference;
  bodyAreas: BodyAreaIssue[];
  overallRating: number;
  comfortRating: number;
  sizeAccuracyRating: number;
  comment: string;
  returnReason: ReturnReason;
  imageUrl?: string;
  aiAnalysis: AiAnalysisResult;
}

export interface FilterParams {
  search?: string;
  brand?: string;
  garmentType?: string;
  size?: string;
  bodyArea?: string;
  issueType?: string;
  fitPreference?: string;
  returnReason?: string;
  sentiment?: string;
  severity?: string;
  minRating?: number;
  maxRating?: number;
  startDate?: string;
  endDate?: string;
}

export interface Recommendation {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  garmentType: GarmentType;
  targetSize?: Size | 'All Sizes' | string;
  problem: string;
  evidence: string;
  affectedCustomersPercent: number;
  affectedCount: number;
  suggestedAction: string;
  expectedImpact: string;
  category: 'Measurement' | 'Grading' | 'Size Chart' | 'Fabric/Pattern';
  status?: 'Proposed' | 'Under Review' | 'Applied to Tech Pack';
}

export interface AnalyticsMetrics {
  totalFeedback: number;
  avgOverallRating: number;
  avgComfortRating: number;
  avgSizeAccuracyRating: number;
  fitIssueRate: number; // percentage
  returnRate: number; // percentage
  topIssue: string;
  mostAffectedSize: string;
  issuesByBodyArea: { area: string; count: number; percentage: number }[];
  issueTypeDistribution: { issue: string; count: number; percentage: number }[];
  problemsBySize: { size: string; totalFeedback: number; issueCount: number; issueRate: number }[];
  problemsByGarmentType: { garmentType: string; count: number; issueRate: number; avgRating: number }[];
  sentimentDistribution: { sentiment: string; count: number; percentage: number }[];
  returnReasonsDistribution: { reason: string; count: number; percentage: number }[];
  trendOverTime: { date: string; totalFeedback: number; complaints: number; avgRating: number }[];
}

// --- PARTICIPANT & SESSION SYSTEM TYPES ---

export type SessionStatus = 'active' | 'paused' | 'ended';

export interface Session {
  id: string;
  token: string;
  name: string;
  status: SessionStatus;
  createdAt: string;
  expiresAt: string;
  totalParticipants?: number;
  totalSubmissions?: number;
}

export interface Participant {
  id: string;
  sessionId?: string;
  height: number; // in cm
  weight?: number; // optional in kg
  garmentType: GarmentType;
  fitPreference: FitPreference;
  consentGiven: boolean;
  createdAt: string;
}

export interface PhotoQualityReport {
  score: number; // 0 - 100
  isAcceptable: boolean;
  personDetected: boolean;
  singlePerson: boolean;
  lighting: 'Good' | 'Fair' | 'Poor';
  blurScore: number; // 0 - 100
  bodyFraming: 'Well-Centered' | 'Too Close' | 'Partial Body' | 'Obstructed';
  issues: string[];
  suggestions: string[];
}

export interface BodyProportions {
  shoulderWidthCm: number;
  chestCircumferenceCm: number;
  waistCircumferenceCm: number;
  hipCircumferenceCm: number;
  armLengthCm: number;
  torsoLengthCm: number;
  confidenceScore: number;
  isApproximate: boolean;
}

export interface SizeAlternative {
  size: Size;
  description: string;
  fitLabel: string;
}

export interface SizeRecommendationResult {
  recommendedSize: Size;
  confidence: number; // percentage
  alternatives: SizeAlternative[];
  fitBreakdown: Record<string, string>;
  explanation: string;
  isDemoAnalysis: boolean;
  measurements: BodyProportions;
  photoQuality: PhotoQualityReport;
}

export interface ImageAnalysis {
  id: string;
  participantId: string;
  sessionId?: string;
  photoQuality: PhotoQualityReport;
  measurements: BodyProportions;
  recommendation: SizeRecommendationResult;
  imageUrl?: string;
  createdAt: string;
}

export interface ParticipantFeedback {
  id: string;
  participantId: string;
  sessionId?: string;
  garmentType: GarmentType;
  recommendedSize: Size;
  actualSize: Size;
  fitRating: 'Too Tight' | 'Slightly Tight' | 'Perfect' | 'Slightly Loose' | 'Too Loose';
  problemAreas: string[];
  comment?: string;
  sentiment?: Sentiment;
  severity?: Severity;
  sizeDifference: number; // e.g. 0 if match, 1 if 1 size off
  isCorrectSize: boolean;
  createdAt: string;
}

export interface RecommendationAccuracyMetrics {
  totalEvaluated: number;
  exactMatches: number;
  accuracyRate: number; // percentage
  avgSizeDifference: number;
  oneSizeDifferenceRate: number; // percentage
  twoPlusSizeDifferenceRate: number; // percentage
  sizeDistributionRecommended: { size: string; count: number; percentage: number }[];
  sizeDistributionActual: { size: string; count: number; percentage: number }[];
  fitSatisfactionBreakdown: { rating: string; count: number; percentage: number }[];
  problemAreaFrequency: { area: string; count: number; percentage: number }[];
}

export interface BrandInsightItem {
  id: string;
  insight: string;
  evidence: string;
  recommendation: string;
  severity: Severity;
  affectedMetric: string;
  createdAt: string;
}

export type UserRole = 'shopper' | 'designer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  brand?: string;
  avatar?: string;
  sizingProfile?: {
    gender?: 'Men' | 'Women';
    heightCm?: number;
    weightKg?: number;
    recommendedSize?: Size;
    chestCm?: number;
    shoulderCm?: number;
    waistCm?: number;
  };
  createdAt: string;
}


