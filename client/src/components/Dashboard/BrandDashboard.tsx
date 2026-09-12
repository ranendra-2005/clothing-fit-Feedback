import React, { useState, useEffect } from 'react';
import {
  Feedback,
  AnalyticsMetrics,
  Recommendation,
  HeatmapItem,
  FilterState,
  BodyArea,
  GarmentType,
  Size,
} from '../../types';
import {
  fetchFeedback,
  fetchAnalytics,
  fetchHeatmap,
  fetchRecommendations,
} from '../../api/client';
import { KpiCards } from './KpiCards';
import { AnalyticsCharts } from './AnalyticsCharts';
import { BodyHeatmap } from './BodyHeatmap';
import { SizeSpecificAnalysis } from './SizeSpecificAnalysis';
import { AiRecommendations } from './AiRecommendations';
import { DesignerActionCenter } from './DesignerActionCenter';
import { CustomerSegments } from './CustomerSegments';
import { FeedbackTable } from './FeedbackTable';
import { FeedbackDetailModal } from './FeedbackDetailModal';
import { ExportReportModal } from './ExportReportModal';
import {
  LayoutDashboard,
  BarChart3,
  Flame,
  Maximize2,
  Sparkles,
  Ruler,
  Users,
  Table,
  FileDown,
  RotateCcw,
  Search,
  Filter,
  SlidersHorizontal,
  X,
} from 'lucide-react';

interface BrandDashboardProps {
  onResetDemo: () => void;
  isResetting?: boolean;
}

type DashboardTab =
  | 'overview'
  | 'feedback'
  | 'heatmap'
  | 'size-analysis'
  | 'recommendations'
  | 'action-center'
  | 'segments'
  | 'reports';

const INITIAL_FILTERS: FilterState = {
  search: '',
  brand: '',
  garmentType: '',
  size: '',
  bodyArea: '',
  issueType: '',
  fitPreference: '',
  returnReason: '',
  sentiment: '',
  severity: '',
  minRating: '',
  maxRating: '',
  startDate: '',
  endDate: '',
};

export const BrandDashboard: React.FC<BrandDashboardProps> = ({ onResetDemo, isResetting }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  // Modals State
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Heatmap garment filter
  const [heatmapGarment, setHeatmapGarment] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, [filters.brand, filters.garmentType]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [fbList, analytics, hm, recs] = await Promise.all([
        fetchFeedback(filters),
        fetchAnalytics(filters.brand, filters.garmentType),
        fetchHeatmap(heatmapGarment),
        fetchRecommendations(),
      ]);

      setFeedbacks(fbList);
      setMetrics(analytics);
      setHeatmapData(hm);
      setRecommendations(recs);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    fetchFeedback(INITIAL_FILTERS).then(setFeedbacks);
    fetchAnalytics().then(setMetrics);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    fetchFeedback(updated).then(setFeedbacks);
  };

  const handleHeatmapAreaClick = (area: BodyArea) => {
    handleFilterChange('bodyArea', area);
    setActiveTab('feedback');
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== undefined);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Filter & Control Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand / Garment Quick Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-pink-400" />
            <span className="font-semibold text-white">Filters:</span>
          </div>

          {/* Garment Type */}
          <select
            value={filters.garmentType}
            onChange={(e) => handleFilterChange('garmentType', e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:border-pink-500 outline-none"
          >
            <option value="">All Garments</option>
            {['Shirt', 'T-Shirt', 'Jeans', 'Trousers', 'Dress', 'Jacket', 'Hoodie', 'Kurta'].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Size */}
          <select
            value={filters.size}
            onChange={(e) => handleFilterChange('size', e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:border-pink-500 outline-none"
          >
            <option value="">All Sizes</option>
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Body Area */}
          <select
            value={filters.bodyArea}
            onChange={(e) => handleFilterChange('bodyArea', e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:border-pink-500 outline-none"
          >
            <option value="">All Body Areas</option>
            {['Shoulders', 'Chest', 'Waist', 'Hips', 'Sleeves', 'Length', 'Neck', 'Arms', 'Thighs', 'Rise'].map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* Fit Preference */}
          <select
            value={filters.fitPreference}
            onChange={(e) => handleFilterChange('fitPreference', e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:border-pink-500 outline-none"
          >
            <option value="">All Fit Styles</option>
            {['Slim', 'Regular', 'Relaxed', 'Oversized'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold border border-rose-500/30 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-xs font-bold shadow-sm hover:scale-[1.02] transition-all"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Reports</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Subtabs (Information Architecture - Section 29) */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'overview', label: 'Overview & KPIs', icon: LayoutDashboard },
          { id: 'heatmap', label: 'Fit Heatmap', icon: Flame },
          { id: 'size-analysis', label: 'Size Analysis', icon: Maximize2 },
          { id: 'recommendations', label: 'AI Recommendations', icon: Sparkles },
          { id: 'action-center', label: 'Designer Action Center', icon: Ruler },
          { id: 'segments', label: 'Customer Segments', icon: Users },
          { id: 'feedback', label: 'Feedback Table', icon: Table },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-pink-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {loading && !metrics ? (
        <div className="py-20 text-center text-slate-400 animate-pulse text-sm">
          Crunching fit intelligence telemetry...
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && metrics && (
            <div className="space-y-8">
              {/* TOP KPI CARDS (Section 6) */}
              <KpiCards metrics={metrics} />

              {/* Quick Visual Heatmap Teaser */}
              <BodyHeatmap
                heatmapData={heatmapData}
                selectedGarment={heatmapGarment}
                onSelectGarment={(g) => {
                  setHeatmapGarment(g);
                  fetchHeatmap(g).then(setHeatmapData);
                }}
                onAreaClick={handleHeatmapAreaClick}
              />

              {/* ANALYTICS CHARTS (Section 7) */}
              <AnalyticsCharts metrics={metrics} />

              {/* Highlights from AI Recommendations */}
              <AiRecommendations recommendations={recommendations.slice(0, 3)} />
            </div>
          )}

          {/* TAB 2: FIT HEATMAP */}
          {activeTab === 'heatmap' && (
            <div className="space-y-6">
              <BodyHeatmap
                heatmapData={heatmapData}
                selectedGarment={heatmapGarment}
                onSelectGarment={(g) => {
                  setHeatmapGarment(g);
                  fetchHeatmap(g).then(setHeatmapData);
                }}
                onAreaClick={handleHeatmapAreaClick}
              />
            </div>
          )}

          {/* TAB 3: SIZE-SPECIFIC ANALYSIS */}
          {activeTab === 'size-analysis' && (
            <SizeSpecificAnalysis
              initialGarment={filters.garmentType || 'Shirt'}
              initialSize={filters.size || 'M'}
            />
          )}

          {/* TAB 4: AI RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <AiRecommendations recommendations={recommendations} />
          )}

          {/* TAB 5: DESIGNER ACTION CENTER */}
          {activeTab === 'action-center' && <DesignerActionCenter />}

          {/* TAB 6: CUSTOMER SEGMENTS */}
          {activeTab === 'segments' && <CustomerSegments feedbacks={feedbacks} />}

          {/* TAB 7: FEEDBACK TABLE */}
          {activeTab === 'feedback' && (
            <FeedbackTable
              feedbacks={feedbacks}
              onSelectFeedback={(f) => setSelectedFeedback(f)}
            />
          )}
        </div>
      )}

      {/* Feedback Detail Drawer Modal */}
      {selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}

      {/* Export Report Modal */}
      {showExportModal && metrics && (
        <ExportReportModal
          metrics={metrics}
          recommendations={recommendations}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
