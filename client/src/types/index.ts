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

export interface AiAnalysisResult {
  fitIssues: { area: string; issue: string }[];
  positiveAreas: string[];
  fitPreference?: string;
  sentiment: Sentiment;
  severity: Severity;
  returnReason?: string;
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

export interface AnalyticsMetrics {
  totalFeedback: number;
  avgOverallRating: number;
  avgComfortRating: number;
  avgSizeAccuracyRating: number;
  fitIssueRate: number;
  returnRate: number;
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

export interface DesignerActionSpec {
  problemsToFix: { title: string; garment: string; size: string; severity: string; urgency: string }[];
  measurementChanges: {
    garment: string;
    size: string;
    measurementPoint: string;
    currentSpec: string;
    recommendedSpec: string;
    delta: string;
    rationale: string;
  }[];
  sizeChartChanges: {
    garment: string;
    recommendation: string;
    reason: string;
  }[];
  futureCollectionSuggestions: string[];
  customerSegmentsToInvestigate: {
    segment: string;
    primaryComplaint: string;
    recommendedFocus: string;
  }[];
}

export interface SizeAnalysisConclusion {
  id: string;
  area: string;
  issue: string;
  statStatement: string;
  comparisonStatement: string;
  targetRate: number;
  comparativeRate: number;
}

export interface SizeAnalysisResult {
  garmentType: string;
  targetSize: string;
  sampleSize: number;
  conclusions: SizeAnalysisConclusion[];
}

export interface HeatmapItem {
  area: BodyArea;
  count: number;
  frequencyPercent: number;
  primaryIssue: string;
  intensity: 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';
}

export interface FilterState {
  search: string;
  brand: string;
  garmentType: string;
  size: string;
  bodyArea: string;
  issueType: string;
  fitPreference: string;
  returnReason: string;
  sentiment: string;
  severity: string;
  minRating: number | '';
  maxRating: number | '';
  startDate: string;
  endDate: string;
}
