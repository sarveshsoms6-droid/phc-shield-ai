import { useState, type FormEvent } from 'react';
import { DiseaseSurveillanceEntry } from '../types';
import {
  Bug,
  Save,
  Check,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  History,
} from 'lucide-react';
import { analyzeDiseaseSurveillance, evaluateFreshness } from '../utils/phcCalculations';

interface Props {
  surveillanceEntries: DiseaseSurveillanceEntry[];
  onSubmitDiseaseData: (entry: DiseaseSurveillanceEntry) => void;
}

export function DiseaseSection({
  surveillanceEntries,
  onSubmitDiseaseData,
}: Props) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);
  const [feverCases, setFeverCases] = useState<number | ''>(39);
  const [dengueSuspected, setDengueSuspected] = useState<number | ''>(8);
  const [dengueConfirmed, setDengueConfirmed] = useState<number | ''>(2);
  const [malariaCases, setMalariaCases] = useState<number | ''>(2);
  const [diarrheaCases, setDiarrheaCases] = useState<number | ''>(5);
  const [respiratoryCases, setRespiratoryCases] = useState<number | ''>(14);
  const [influenzaCases, setInfluenzaCases] = useState<number | ''>(9);
  const [otherCases, setOtherCases] = useState<number | ''>(12);
  const [justSaved, setJustSaved] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const entry: DiseaseSurveillanceEntry = {
      id: `dis-${Date.now()}`,
      date,
      feverCases: Number(feverCases) || 0,
      dengueSuspected: Number(dengueSuspected) || 0,
      dengueConfirmed: Number(dengueConfirmed) || 0,
      malariaCases: Number(malariaCases) || 0,
      diarrheaCases: Number(diarrheaCases) || 0,
      respiratoryCases: Number(respiratoryCases) || 0,
      influenzaCases: Number(influenzaCases) || 0,
      otherCases: Number(otherCases) || 0,
      lastUpdated: new Date().toISOString(),
    };

    onSubmitDiseaseData(entry);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const analysis = analyzeDiseaseSurveillance(surveillanceEntries);
  const latestEntry = surveillanceEntries[surveillanceEntries.length - 1];
  const freshness = evaluateFreshness(latestEntry?.lastUpdated);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                Disease Surveillance & Outbreak Detection
              </h2>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold tracking-wider uppercase">
                Verified Data
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Epidemic early warning data, weekly baseline comparison, and outbreak detection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${freshness.badgeClass}`}>
            {freshness.label} • {freshness.ageText}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4 bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Bug className="w-4 h-4 text-amber-600" />
              <span>DISEASE SURVEILLANCE DATA</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">Daily / Weekly Entry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Surveillance Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Fever Cases */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Fever Cases <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                id="input-fever-surveillance"
                placeholder="e.g. 39"
                value={feverCases}
                onChange={(e) =>
                  setFeverCases(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Dengue Suspected */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Dengue Suspected
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 8"
                value={dengueSuspected}
                onChange={(e) =>
                  setDengueSuspected(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Dengue Confirmed */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Dengue Confirmed (ELISA/NS1)
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 2"
                value={dengueConfirmed}
                onChange={(e) =>
                  setDengueConfirmed(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Malaria */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Malaria (Smear/RDT)
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 2"
                value={malariaCases}
                onChange={(e) =>
                  setMalariaCases(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Diarrhea */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Diarrhea (Acute Gastroenteritis)
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 5"
                value={diarrheaCases}
                onChange={(e) =>
                  setDiarrheaCases(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Respiratory Infection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Respiratory Infection (ARI)
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 14"
                value={respiratoryCases}
                onChange={(e) =>
                  setRespiratoryCases(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Influenza-like Illness */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Influenza-like Illness (ILI)
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 9"
                value={influenzaCases}
                onChange={(e) =>
                  setInfluenzaCases(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Other */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Other Syndromic Cases
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 12"
                value={otherCases}
                onChange={(e) =>
                  setOtherCases(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            id="btn-submit-disease-data"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
          >
            {justSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>SURVEILLANCE DATA SUBMITTED</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SUBMIT DISEASE DATA</span>
              </>
            )}
          </button>
        </form>

        {/* AI Disease Analysis & Outbreak Detection (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-300 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-amber-950">
                    UNUSUAL DISEASE PATTERN
                  </h3>
                  <p className="text-[11px] text-amber-800">Current cases vs historical baseline</p>
                </div>
              </div>

              <span
                className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  analysis.riskLevel === 'HIGH'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-amber-200 text-amber-950'
                }`}
              >
                Risk: {analysis.riskLevel}
              </span>
            </div>

            {/* Baseline comparison */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-white border border-amber-200 text-center mb-3">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Prev Period</div>
                <div className="text-lg font-bold font-mono text-slate-700">
                  {analysis.prevFever}
                </div>
                <div className="text-[10px] text-slate-400">Fever Cases</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Current Week</div>
                <div className="text-lg font-bold font-mono text-amber-900">
                  {analysis.currentFever}
                </div>
                <div className="text-[10px] text-slate-400">Fever Cases</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Surge Rate</div>
                <div className="text-lg font-black font-mono text-rose-600">
                  {analysis.feverPercentChange >= 0 ? '+' : ''}
                  {analysis.feverPercentChange}%
                </div>
                <div className="text-[10px] text-rose-500 font-medium">Increase</div>
              </div>
            </div>

            {/* Narrative Explanation & AI Recommendation */}
            <div className="space-y-2 text-xs text-amber-950 mb-4">
              <p className="font-semibold leading-relaxed">
                &ldquo;{analysis.explanation}&rdquo;
              </p>
              <div className="p-2.5 rounded-lg bg-amber-100/70 border border-amber-200">
                <span className="font-bold text-amber-950">AI Recommendation: </span>
                <span className="text-amber-900">{analysis.recommendation}</span>
              </div>
            </div>

            {/* Mandatory Operational Disclaimer Notice */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Statutory Clinical Notice:</span>
              </div>
              <p className="italic leading-relaxed text-slate-600">
                &ldquo;This is an operational surveillance alert and not a medical diagnosis. Final public health and clinical decisions must be made by authorized healthcare professionals.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
