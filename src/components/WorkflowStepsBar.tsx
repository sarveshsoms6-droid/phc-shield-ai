import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Cpu, ArrowRight } from 'lucide-react';

const WORKFLOW_STEPS = [
  { step: 1, title: 'User enters PHC data', desc: 'Medicine, patients, beds, staff, disease records', actor: 'User' },
  { step: 2, title: 'System validates data', desc: 'Boundary checks, data quality calculation', actor: 'System' },
  { step: 3, title: 'Data is saved', desc: 'Durable client state & timestamp tracking', actor: 'System' },
  { step: 4, title: 'AI analyses current conditions', desc: 'Capacity ratios, stock days, surge metrics', actor: 'AI' },
  { step: 5, title: 'Prediction models forecast', desc: 'Tomorrow footfall, 7-day demand, bed %', actor: 'AI' },
  { step: 6, title: 'AI detects risks', desc: 'Stockouts, fever surges, clinical shortages', actor: 'AI' },
  { step: 7, title: 'AI explains WHY', desc: 'Underlying causes and contextual drivers', actor: 'AI' },
  { step: 8, title: 'AI recommends action', desc: 'Prioritised intervention proposals', actor: 'AI' },
  { step: 9, title: 'Official reviews & decides', desc: 'Approve, Modify, or Reject actions', actor: 'Human' },
  { step: 10, title: 'System records decision', desc: 'Audit log, accountability, and redistribution', actor: 'System' },
];

interface Props {
  currentStep?: number;
  currentActiveStep?: number;
  onStepClick?: (step: number) => void;
}

export function WorkflowStepsBar({ currentStep, currentActiveStep = 1, onStepClick }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const activeStep = currentStep ?? currentActiveStep;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <button
          type="button"
          id="btn-toggle-workflow"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-5 py-3 flex items-center justify-between bg-slate-50/90 hover:bg-slate-100/90 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Operational Protocol
              </div>
              <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>10-Step User Input → AI Analysis → Human Approval Pipeline</span>
                <span className="hidden sm:inline-block text-xs font-normal text-slate-500">
                  (Strict human-in-the-loop governance)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="hidden md:inline text-[11px] text-slate-500">
              Stage: Step {activeStep} of 10 ({WORKFLOW_STEPS[activeStep - 1]?.actor})
            </span>
            {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </div>
        </button>

        {/* Expandable 10-step horizontal / grid layout */}
        {isOpen && (
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {WORKFLOW_STEPS.map((s) => {
                const isPast = s.step < activeStep;
                const isCurrent = s.step === activeStep;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => onStepClick?.(s.step)}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : isPast
                        ? 'border-slate-200 bg-slate-50 text-slate-600'
                        : 'border-slate-100 bg-white text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                        <span className={isCurrent ? 'text-blue-700 font-mono' : 'font-mono'}>
                          Step {s.step}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            s.actor === 'User'
                              ? 'bg-blue-100 text-blue-800'
                              : s.actor === 'AI'
                              ? 'bg-indigo-100 text-indigo-800'
                              : s.actor === 'Human'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {s.actor}
                        </span>
                      </div>
                      <div
                        className={`text-xs font-bold leading-snug line-clamp-2 ${
                          isCurrent ? 'text-blue-900' : 'text-slate-800'
                        }`}
                      >
                        {s.title}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">{s.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
