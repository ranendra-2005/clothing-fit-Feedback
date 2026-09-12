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
