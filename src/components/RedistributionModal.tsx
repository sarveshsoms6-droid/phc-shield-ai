import { useState, type FormEvent } from 'react';
import { RedistributionProposal } from '../types';
import {
  ArrowRightLeft,
  Check,
  X,
  Edit3,
  Clock,
  MapPin,
  Sparkles,
  Building,
} from 'lucide-react';

interface Props {
  proposal: RedistributionProposal;
  onApprove: (id: string) => void;
  onModify: (id: string, newQuantity: number) => void;
  onReject: (id: string, reason: string) => void;
  onClose: () => void;
}

export function RedistributionModal({
  proposal,
  onApprove,
  onModify,
  onReject,
  onClose,
}: Props) {
  const [mode, setMode] = useState<'view' | 'modify' | 'reject'>('view');
  const [modQuantity, setModQuantity] = useState(proposal.quantity);
  const [rejectReason, setRejectReason] = useState(
    'Stock reserved for anticipated local flood emergency shelter'
  );

  const handleModifySubmit = (e: FormEvent) => {
    e.preventDefault();
    onModify(proposal.id, Number(modQuantity) || proposal.quantity);
    setMode('view');
  };

  const handleRejectSubmit = (e: FormEvent) => {
    e.preventDefault();
    onReject(proposal.id, rejectReason);
    setMode('view');
  };

  const isPending = proposal.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                AI Resource Redistribution Proposal
              </h3>
              <p className="text-xs text-slate-500">
                Inter-facility balance protocol with human authorization requirement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PHC Transfer Route Visual */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
          <div className="flex items-center justify-between text-xs mb-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Building className="w-4 h-4 text-slate-400" />
              <span>Surplus: {proposal.fromPhc}</span>
            </div>
            <span className="text-blue-600 font-bold flex items-center gap-1">
              <span>➔</span> Transfer <span>➔</span>
            </span>
            <div className="flex items-center gap-1.5 font-bold text-rose-700">
              <Building className="w-4 h-4 text-rose-500" />
              <span>Target: {proposal.toPhc}</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                Medicine / Resource: {proposal.medicineName}
              </span>
              <span className="font-bold font-mono text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 text-xs">
                {proposal.quantity} {proposal.unit}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Transit ETA: <strong className="text-slate-800">~2 Hours</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Road Distance: <strong className="text-slate-800">{proposal.distanceKm} km</strong>
              </span>
            </div>

            <p className="text-slate-700 text-xs leading-relaxed border-t border-slate-100 pt-2">
              <strong className="text-slate-900">AI Clinical Rationale:</strong> {proposal.reason}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mb-4 flex items-center justify-between text-xs">
          <span className="text-slate-500">Current Protocol Status:</span>
          <span
            className={`font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[11px] ${
              proposal.status === 'approved'
                ? 'bg-emerald-100 text-emerald-800'
                : proposal.status === 'rejected'
                ? 'bg-rose-100 text-rose-800'
                : proposal.status === 'modified'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800 animate-pulse'
            }`}
          >
            {proposal.status}
          </span>
        </div>

        {/* View mode action buttons */}
        {mode === 'view' && (
          <div className="space-y-3">
            {isPending ? (
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="btn-approve-transfer"
                  onClick={() => onApprove(proposal.id)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>APPROVE</span>
                </button>
                <button
                  type="button"
                  id="btn-modify-transfer"
                  onClick={() => setMode('modify')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-800 text-white shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>MODIFY</span>
                </button>
                <button
                  type="button"
                  id="btn-reject-transfer"
                  onClick={() => setMode('reject')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>REJECT</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-100 text-xs text-slate-700 text-center font-medium">
                Decision recorded at {proposal.decidedAt ? new Date(proposal.decidedAt).toLocaleTimeString() : 'now'}.
                {proposal.decisionNotes && ` Note: "${proposal.decisionNotes}"`}
              </div>
            )}
          </div>
        )}

        {/* Modify Sub-form */}
        {mode === 'modify' && (
          <form onSubmit={handleModifySubmit} className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Modify Suggested Dispatch Quantity
            </h4>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Approved Quantity ({proposal.unit})
              </label>
              <input
                type="number"
                min={1}
                value={modQuantity}
                onChange={(e) => setModQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setMode('view')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
              >
                Approve Modified Quantity
              </button>
            </div>
          </form>
        )}

        {/* Reject Sub-form */}
        {mode === 'reject' && (
          <form onSubmit={handleRejectSubmit} className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              Record Rejection Clinical Reason (Mandatory Audit)
            </h4>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Rejection
              </label>
              <input
                type="text"
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setMode('view')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
