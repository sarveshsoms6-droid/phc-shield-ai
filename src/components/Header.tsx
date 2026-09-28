import { AppMode, PHCAppState } from '../types';
import {
  Sparkles,
  RefreshCw,
  Building2,
  Bot,
  Layers,
  FlaskConical,
  Activity,
  Calendar,
  Shield,
} from 'lucide-react';
import { evaluateFreshness } from '../utils/phcCalculations';

interface HeaderProps {
  state: PHCAppState;
  onModeToggle: (mode: AppMode) => void;
  onAnalyzeClick: () => void;
  onOpenChat: () => void;
  onResetData: () => void;
  isAnalyzing: boolean;
}

export function Header({
  state,
  onModeToggle,
  onAnalyzeClick,
  onOpenChat,
  onResetData,
  isAnalyzing,
}: HeaderProps) {
  const isDemo = state.mode === 'demo';
  const freshness = evaluateFreshness(state.basicInfo.lastUpdated);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand & Active PHC Context */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-xs shrink-0 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-slate-800">
                  PHC-SHIELD AI
                </h1>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                  Tamil Nadu Operational Intel
                </p>
                {/* Active Mode Indicator */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isDemo
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      isDemo ? 'bg-blue-600' : 'bg-emerald-600'
                    }`}
                  />
                  <span>{isDemo ? '🧪 DEMO MODE' : '🏥 LIVE ENTRY'}</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-800">
                  {state.basicInfo.name || 'Unnamed Health Facility'}
                </span>
                <span className="text-slate-300">•</span>
                <span>{state.basicInfo.district} District</span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {freshness.ageText}
                </span>
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Mode Switcher Pill */}
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
              <button
                type="button"
                id="btn-switch-demo"
                onClick={() => onModeToggle('demo')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isDemo
                    ? 'bg-white shadow-xs text-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>🧪 DEMO MODE</span>
                </span>
              </button>
              <button
                type="button"
                id="btn-switch-live"
                onClick={() => onModeToggle('live')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  !isDemo
                    ? 'bg-white shadow-xs text-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>🏥 LIVE ENTRY</span>
                </span>
              </button>
            </div>

            {/* AI Copilot Quick Chat */}
            <button
              type="button"
              id="btn-open-copilot"
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <Bot className="w-4 h-4 text-blue-400" />
              <span>Ask AI Copilot</span>
            </button>

            {/* Reset / Reload button */}
            <button
              type="button"
              id="btn-reset-demo"
              onClick={onResetData}
              title={isDemo ? 'Reset demo state' : 'Clear live entry data'}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Major Primary Action Button: ANALYZE MY PHC in indigo */}
            <button
              type="button"
              id="btn-analyze-my-phc"
              onClick={onAnalyzeClick}
              disabled={isAnalyzing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-white' : 'text-indigo-200'}`} />
              <span>{isAnalyzing ? 'ANALYSING...' : 'ANALYZE MY PHC'}</span>
            </button>
          </div>
        </div>

        {/* Data Classification Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Data Classification:
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Data (User)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Estimated Data
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span> AI Prediction
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-500 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Missing Data
            </span>
          </div>

          <div className="text-slate-400 text-[11px]">
            {isDemo
              ? 'Synthetic Tamil Nadu PHC dataset loaded for demonstration'
              : 'Enter live field numbers to update predictions'}
          </div>
        </div>
      </div>
    </header>
  );
}
