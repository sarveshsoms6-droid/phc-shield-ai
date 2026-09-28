import { useState } from 'react';
import {
  AIIntelligenceReport,
  RedistributionProposal,
  PHCAppState,
  ActionRecommendation,
} from '../types';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRightLeft,
  ShieldAlert,
  HelpCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  Check,
  X,
  Edit3,
} from 'lucide-react';
import { RedistributionModal } from './RedistributionModal';

interface Props {
  report: AIIntelligenceReport;
  phcState: PHCAppState;
  isAnalyzing: boolean;
  onReAnalyze: () => void;
  onApproveProposal: (id: string) => void;
  onModifyProposal: (id: string, qty: number) => void;
  onRejectProposal: (id: string, reason: string) => void;
  onApproveAction: (id: string) => void;
  onRejectAction: (id: string) => void;
}

export function AIAnalysisDashboard({
  report,
  phcState,
  isAnalyzing,
  onReAnalyze,
  onApproveProposal,
  onModifyProposal,
  onRejectProposal,
  onApproveAction,
  onRejectAction,
}: Props) {
  const [selectedProposal, setSelectedProposal] = useState<RedistributionProposal | null>(null);

  // Compute operational risk score (0-100) from report status and risks
  const riskScore =
    report.overallStatus === 'CRITICAL_RISK'
      ? Math.max(78, Math.min(96, report.topRisks.length * 28))
      : report.overallStatus === 'ATTENTION'
      ? Math.max(45, Math.min(74, 40 + report.topRisks.length * 10))
      : 22;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-rose-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getScoreBadge = (status: 'STABLE' | 'ATTENTION' | 'CRITICAL_RISK') => {
    if (status === 'CRITICAL_RISK') return 'bg-rose-100 text-rose-800 border-rose-300';
    if (status === 'ATTENTION') return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Re-analyze button */}
      <div className="p-6 rounded-xl bg-slate-900 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  PHC-SHIELD AI Operational Diagnostic
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Confidence: {report.confidenceScore}%
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Multi-vector synthesis of inventory, bed capacity, staffing, syndromic surveillance & climate factors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Generated At</div>
              <div className="text-xs font-mono text-slate-200">
                {new Date(report.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <button
              type="button"
              id="btn-reanalyze-phc"
              onClick={onReAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/30 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Synthesizing Data...' : 'RE-ANALYZE PHC'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid: Risk Score + Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Risk Score Dial Card (4 cols) */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold uppercase tracking-wider text-slate-700">
                OPERATIONAL RISK SCORE
              </span>
              <span className="text-[10px] text-slate-400">Scale: 0 - 100</span>
            </div>

            <div className="flex items-baseline gap-2 my-3">
              <span className={`text-5xl font-black font-mono ${getScoreColor(riskScore)}`}>
                {riskScore}
              </span>
              <span className="text-xl font-bold text-slate-400 font-mono">/ 100</span>
              <span
                className={`ml-auto text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${getScoreBadge(
                  report.overallStatus
                )}`}
              >
                {report.overallStatus.replace('_', ' ')}
              </span>
            </div>

            {/* Visual Risk Gauge */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  riskScore >= 70
                    ? 'bg-rose-500'
                    : riskScore >= 40
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, riskScore)}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 pt-3 border-t border-slate-100">
            Calculated across {report.topRisks.length} vulnerability vectors. Clinical decisions require human medical officer sign-off.
          </p>
        </div>

        {/* Health Status & Summary (8 cols) */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold uppercase tracking-wider text-slate-700">
                FACILITY OPERATIONAL SUMMARY
              </span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                PHC: {phcState.basicInfo.name || 'Active Facility'}
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed my-2 font-medium">
              {report.phcSummary}
            </p>
          </div>

          {/* 4 Data Provenance Badges (Section: Data Handling) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-100">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-[10px] font-bold text-emerald-800 uppercase">Verified Data</div>
              <div className="text-xs font-bold text-emerald-700 mt-0.5">User Manual Input</div>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-center">
              <div className="text-[10px] font-bold text-blue-800 uppercase">Estimated Data</div>
              <div className="text-xs font-bold text-blue-700 mt-0.5">System Benchmarks</div>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-center">
              <div className="text-[10px] font-bold text-indigo-800 uppercase">AI Predictions</div>
              <div className="text-xs font-bold text-indigo-700 mt-0.5">Epidemic Trajectory</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-center">
              <div className="text-[10px] font-bold text-slate-600 uppercase">Missing Data</div>
              <div className="text-xs font-bold text-slate-500 mt-0.5">Explicitly Flagged</div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors & Priority Action Plan Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Identified Risk Factors */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Identified Operational Risk Factors ({report.topRisks.length})
            </h3>
          </div>

          <div className="space-y-2.5">
            {report.topRisks.map((rf, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start gap-3"
              >
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${
                    rf.level === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : rf.level === 'HIGH_RISK'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {rf.level}
                </span>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900">{rf.title}</div>
                    <span className="text-[11px] font-mono font-semibold text-slate-500">
                      {rf.metrics}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rf.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Action Items with Approval buttons (Section 18) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Recommended Priority Action Plan
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Human-in-the-Loop Protocol
            </span>
          </div>

          <div className="space-y-3">
            {report.recommendedActions.map((action) => {
              const isApproved = action.status === 'approved';
              const isRejected = action.status === 'rejected';

              return (
                <div
                  key={action.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isApproved
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : isRejected
                      ? 'border-rose-200 bg-rose-50/30 opacity-60'
                      : 'border-blue-100 bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {action.priority}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{action.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {action.description}
                        </p>
                        <p className="text-[11px] text-blue-800 italic mt-1">
                          <strong>Rationale:</strong> {action.rationale}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {action.status}
                    </span>
                  </div>

                  {/* Decision buttons */}
                  {action.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => onApproveAction(action.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>APPROVE</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRejectAction(action.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>REJECT</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Resource Redistribution Proposals (Section 17 & 18) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Resource Redistribution Proposals (Inter-PHC Balancing)
              </h3>
              <p className="text-xs text-slate-500">
                Proactive reallocation between neighboring facilities to resolve critical stockouts
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Human-in-the-Loop Approval Required
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phcState.redistributionProposals.map((prop) => (
            <div
              key={prop.id}
              className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 hover:border-blue-300 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  {prop.medicineName}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    prop.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : prop.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : prop.status === 'modified'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {prop.status}
                </span>
              </div>

              {/* Transfer Details */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Source (Surplus):</span>
                  <strong className="text-slate-800">{prop.fromPhc}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Target (Deficit):</span>
                  <strong className="text-rose-700">{prop.toPhc}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Quantity:</span>
                  <strong className="text-blue-700 font-mono">
                    {prop.quantity} {prop.unit}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Road Distance:</span>
                  <strong className="text-slate-800">{prop.distanceKm} km</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                {prop.reason}
              </p>

              {/* Action Buttons */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedProposal(prop)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Review & Act on Proposal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {prop.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => onApproveProposal(prop.id)}
                    className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                  >
                    Quick Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Explainability & Reasoning Audit Trail (Section 19) */}
      <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4 text-blue-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            AI EXPLAINABILITY & REASONING AUDIT TRAIL
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div>
            <span className="font-bold text-slate-800 block mb-1">
              Why this recommendation was generated:
            </span>
            <p className="leading-relaxed">
              Synthesizes real-time patient surge velocity, daily medicine consumption rate, bed occupancy thresholds, and local disease cluster signals.
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-800 block mb-1">Data points used:</span>
            <p className="leading-relaxed">
              Physical inventory counts, daily OP triage logs, bed occupancy records, staff duty rosters, and verified Tamil Nadu district health telemetry.
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-800 block mb-1">Model Confidence:</span>
            <p className="leading-relaxed">
              {report.confidenceScore}% confidence. Incomplete entries or records older than 24 hours trigger explicit uncertainty markers (&quot;Estimated Data&quot;).
            </p>
          </div>
        </div>
      </div>

      {/* Modal for approval / modification / rejection */}
      {selectedProposal && (
        <RedistributionModal
          proposal={selectedProposal}
          onApprove={(id) => {
            onApproveProposal(id);
            setSelectedProposal(null);
          }}
          onModify={(id, qty) => {
            onModifyProposal(id, qty);
            setSelectedProposal(null);
          }}
          onReject={(id, reason) => {
            onRejectProposal(id, reason);
            setSelectedProposal(null);
          }}
          onClose={() => setSelectedProposal(null)}
        />
      )}
    </div>
  );
}
