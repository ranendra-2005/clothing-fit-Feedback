import React, { useState, useMemo } from 'react';
import { Feedback } from '../../types';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, Star } from 'lucide-react';

interface FeedbackTableProps {
  feedbacks: Feedback[];
  onSelectFeedback: (feedback: Feedback) => void;
}

export const FeedbackTable: React.FC<FeedbackTableProps> = ({ feedbacks, onSelectFeedback }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<'timestamp' | 'overallRating' | 'size'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filter & Search
  const filteredList = useMemo(() => {
    let result = feedbacks;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.product.toLowerCase().includes(q) ||
          f.garmentType.toLowerCase().includes(q) ||
          f.brand.toLowerCase().includes(q) ||
          f.comment.toLowerCase().includes(q) ||
          f.bodyAreas.some((b) => b.area.toLowerCase().includes(q) || b.issue.toLowerCase().includes(q))
      );
    }

    return [...result].sort((a, b) => {
      if (sortField === 'timestamp') {
        const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        return sortOrder === 'asc' ? diff : -diff;
      }
      if (sortField === 'overallRating') {
        const diff = a.overallRating - b.overallRating;
        return sortOrder === 'asc' ? diff : -diff;
      }
      return 0;
    });
  }, [feedbacks, searchTerm, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = filteredList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (field: 'timestamp' | 'overallRating' | 'size') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
      {/* Table Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Customer Feedback Database</h3>
          <p className="text-xs text-slate-400">
            Showing {filteredList.length} total customer submissions. Click any row to view AI breakdown.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-pink-500 outline-none"
          />
        </div>
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider select-none">
            <tr>
              <th
                onClick={() => toggleSort('timestamp')}
                className="p-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {sortField === 'timestamp' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="p-3">Product</th>
              <th className="p-3">Garment</th>
              <th className="p-3">Size</th>
              <th className="p-3">Problem Area</th>
              <th className="p-3">Issue</th>
              <th
                onClick={() => toggleSort('overallRating')}
                className="p-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center space-x-1">
                  <span>Rating</span>
                  {sortField === 'overallRating' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="p-3">Sentiment</th>
              <th className="p-3">Return</th>
              <th className="p-3">Comment Preview</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {paginatedList.map((f) => {
              const mainArea = f.bodyAreas[0]?.area || 'N/A';
              const mainIssue = f.bodyAreas[0]?.issue || 'Normal';

              return (
                <tr
                  key={f.id}
                  onClick={() => onSelectFeedback(f)}
                  className="hover:bg-slate-900/60 cursor-pointer transition-colors"
                >
                  <td className="p-3 text-slate-400 font-mono text-[11px]">
                    {f.timestamp.slice(5, 10)}
                  </td>
                  <td className="p-3 font-semibold text-white truncate max-w-[140px]">
                    {f.product}
                  </td>
                  <td className="p-3 text-slate-300">{f.garmentType}</td>
                  <td className="p-3 font-mono font-bold text-indigo-400">{f.size}</td>
                  <td className="p-3 text-white font-medium">{mainArea}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        mainIssue === 'Too Tight'
                          ? 'bg-rose-500/20 text-rose-300'
                          : mainIssue === 'Too Loose'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : mainIssue === 'Fits Correctly'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {mainIssue}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-amber-400">
                    {f.overallRating} ★
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold ${
                        f.aiAnalysis.sentiment === 'Positive'
                          ? 'text-emerald-400'
                          : f.aiAnalysis.sentiment === 'Neutral'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {f.aiAnalysis.sentiment}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px]">
                    {f.returnReason}
                  </td>
                  <td className="p-3 text-slate-400 max-w-[180px] truncate" title={f.comment}>
                    "{f.comment}"
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFeedback(f);
                      }}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="View full AI breakdown"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center space-x-1">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
