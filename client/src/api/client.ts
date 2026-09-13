import {
  Feedback,
  AnalyticsMetrics,
  Recommendation,
  DesignerActionSpec,
  SizeAnalysisResult,
  HeatmapItem,
  FilterState,
} from '../types';

const API_BASE = '/api';

export async function fetchFeedback(filters?: Partial<FilterState>): Promise<Feedback[]> {
  const query = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        query.append(key, String(val));
      }
    });
  }

  const res = await fetch(`${API_BASE}/feedback?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch feedback records');
  const data = await res.json();
  return data.data;
}

export async function fetchFeedbackById(id: string): Promise<Feedback> {
  const res = await fetch(`${API_BASE}/feedback/${id}`);
  if (!res.ok) throw new Error('Feedback not found');
  const data = await res.json();
  return data.data;
}

export async function submitFeedback(payload: FormData | Record<string, any>): Promise<Feedback> {
  let options: RequestInit;

  if (payload instanceof FormData) {
    options = {
      method: 'POST',
      body: payload,
    };
  } else {
    options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };
  }

  const res = await fetch(`${API_BASE}/feedback`, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit feedback');
  }
  const data = await res.json();
  return data.data;
}

export async function fetchAnalytics(brand?: string, garmentType?: string): Promise<AnalyticsMetrics> {
  const params = new URLSearchParams();
  if (brand) params.append('brand', brand);
  if (garmentType) params.append('garmentType', garmentType);

  const res = await fetch(`${API_BASE}/analytics?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch analytics metrics');
  const data = await res.json();
  return data.data;
}

export async function fetchSizeAnalysis(garment: string, size: string): Promise<SizeAnalysisResult> {
  const params = new URLSearchParams({ garment, size });
  const res = await fetch(`${API_BASE}/size-analysis?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch size analysis');
  const data = await res.json();
  return data.data;
}

export async function fetchHeatmap(garment?: string): Promise<HeatmapItem[]> {
  const params = new URLSearchParams();
  if (garment) params.append('garment', garment);

  const res = await fetch(`${API_BASE}/heatmap?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch heatmap');
  const data = await res.json();
  return data.data;
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  const res = await fetch(`${API_BASE}/recommendations`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  const data = await res.json();
  return data.data;
}

export async function fetchDesignerActionPlan(): Promise<DesignerActionSpec> {
  const res = await fetch(`${API_BASE}/designer-action-plan`);
  if (!res.ok) throw new Error('Failed to fetch designer action plan');
  const data = await res.json();
  return data.data;
}

export async function resetDemoData(): Promise<string> {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo data');
  const data = await res.json();
  return data.message;
}

export async function clearAllData(): Promise<string> {
  const res = await fetch(`${API_BASE}/demo/clear`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to clear data');
  const data = await res.json();
  return data.message;
}

export async function fetchExportSummary(): Promise<any> {
  const res = await fetch(`${API_BASE}/export/summary`);
  if (!res.ok) throw new Error('Failed to fetch export summary');
  return res.json();
}

// --- PARTICIPANT QR & SYSTEM APIS ---

import {
  Session,
  SessionStatus,
  PhotoQualityReport,
  SizeRecommendationResult,
  ParticipantFeedback,
  RecommendationAccuracyMetrics,
  BrandInsightItem,
} from '../types';

export async function fetchSessions(): Promise<Session[]> {
  const res = await fetch(`${API_BASE}/sessions`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  const data = await res.json();
  return data.data;
}

export async function createSession(name?: string, durationHours?: number): Promise<Session> {
  const res = await fetch(`${API_BASE}/sessions/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, durationHours }),
  });
  if (!res.ok) throw new Error('Failed to generate new session');
  const data = await res.json();
  return data.data;
}

export async function validateSession(token: string): Promise<{
  isValid: boolean;
  error?: string;
  session?: Session;
}> {
  const res = await fetch(`${API_BASE}/sessions/${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error('Failed to validate session');
  const data = await res.json();
  return {
    isValid: data.isValid,
    error: data.error,
    session: data.data || data.session,
  };
}

export async function updateSessionStatus(token: string, status: SessionStatus): Promise<Session> {
  const res = await fetch(`${API_BASE}/sessions/${encodeURIComponent(token)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update session status');
  const data = await res.json();
  return data.data;
}

export async function fetchSessionStats(token: string): Promise<{
  session: Session;
  activeParticipants: number;
  completedAnalyses: number;
  totalSubmissions: number;
}> {
  const res = await fetch(`${API_BASE}/sessions/${encodeURIComponent(token)}/stats`);
  if (!res.ok) throw new Error('Failed to fetch session stats');
  const data = await res.json();
  return data.data;
}

export async function validateParticipantPhoto(photoFile?: File): Promise<{
  photoQuality: PhotoQualityReport;
  imageUrl?: string;
}> {
  const formData = new FormData();
  if (photoFile) {
    formData.append('photo', photoFile);
  }

  const res = await fetch(`${API_BASE}/participant/validate-photo`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to analyze photo quality');
  const data = await res.json();
  return data.data;
}

export async function analyzeParticipantFit(payload: {
  sessionId?: string;
  height: number;
  weight?: number;
  garmentType: string;
  fitPreference: string;
  consentGiven: boolean;
  photoQuality?: PhotoQualityReport;
  imageUrl?: string;
}): Promise<{
  participantId: string;
  measurements: any;
  recommendation: SizeRecommendationResult;
}> {
  const res = await fetch(`${API_BASE}/participant/analyze-fit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to generate size recommendation');
  const data = await res.json();
  return data.data;
}

export async function submitParticipantFeedback(payload: {
  participantId: string;
  sessionId?: string;
  garmentType: string;
  recommendedSize: string;
  actualSize: string;
  fitRating: string;
  problemAreas: string[];
  comment?: string;
}): Promise<ParticipantFeedback> {
  const res = await fetch(`${API_BASE}/participant/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit fit feedback');
  const data = await res.json();
  return data.data;
}

export async function fetchAccuracyMetrics(): Promise<RecommendationAccuracyMetrics> {
  const res = await fetch(`${API_BASE}/admin/accuracy-metrics`);
  if (!res.ok) throw new Error('Failed to fetch accuracy metrics');
  const data = await res.json();
  return data.data;
}

export async function fetchBrandInsights(): Promise<BrandInsightItem[]> {
  const res = await fetch(`${API_BASE}/admin/brand-insights`);
  if (!res.ok) throw new Error('Failed to fetch brand insights');
  const data = await res.json();
  return data.data;
}

export async function fetchRecentParticipants(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/admin/participants`);
  if (!res.ok) throw new Error('Failed to fetch participant stream');
  const data = await res.json();
  return data.data;
}

export async function fetchTunnelInfo(): Promise<{ publicUrl: string; wifiUrl: string }> {
  const res = await fetch(`${API_BASE}/tunnel-info`);
  if (!res.ok) return { publicUrl: 'https://29ffb96a622c2d.lhr.life', wifiUrl: 'http://172.20.35.121:5173' };
  return res.json();
}

