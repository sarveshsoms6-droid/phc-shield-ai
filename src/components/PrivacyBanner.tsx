import { ShieldCheck, Lock } from 'lucide-react';

export function PrivacyBanner() {
  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Lock className="w-2.5 h-2.5" />
          </div>
          <span className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">PRIVACY-FIRST HEALTHCARE AI</span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="text-slate-300 text-[11px]">
            AI analyses operational and aggregated healthcare data. Sensitive personal identifiers are never stored.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Tamil Nadu Health Systems Protocol</span>
        </div>
      </div>
    </div>
  );
}
