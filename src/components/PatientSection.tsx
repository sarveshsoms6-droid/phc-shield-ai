import { useState, type FormEvent } from 'react';
import { PatientDailyEntry } from '../types';
import {
  Users,
  Calendar,
  Save,
  TrendingUp,
  History,
  Check,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { forecastPatientFootfall, evaluateFreshness } from '../utils/phcCalculations';

interface Props {
  entries: PatientDailyEntry[];
  onSaveDailyEntry: (entry: PatientDailyEntry) => void;
}

export function PatientSection({ entries, onSaveDailyEntry }: Props) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);
  const [opPatients, setOpPatients] = useState<number | ''>(75);
  const [emergencyPatients, setEmergencyPatients] = useState<number | ''>(8);
  const [inpatients, setInpatients] = useState<number | ''>(12);
  const [feverCases, setFeverCases] = useState<number | ''>(15);
  const [respiratoryCases, setRespiratoryCases] = useState<number | ''>(8);
  const [diarrheaCases, setDiarrheaCases] = useState<number | ''>(5);
  const [otherCases, setOtherCases] = useState<number | ''>(10);
  const [justSaved, setJustSaved] = useState(false);

  // Auto-calculated Total: OP + Emergency + Inpatients
  const calcTotal =
    (Number(opPatients) || 0) +
    (Number(emergencyPatients) || 0) +
    (Number(inpatients) || 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const entry: PatientDailyEntry = {
      id: `pat-${Date.now()}`,
      date,
      opPatients: Number(opPatients) || 0,
      emergencyPatients: Number(emergencyPatients) || 0,
      inpatients: Number(inpatients) || 0,
      feverCases: Number(feverCases) || 0,
      respiratoryCases: Number(respiratoryCases) || 0,
      diarrheaCases: Number(diarrheaCases) || 0,
      otherCases: Number(otherCases) || 0,
      totalPatients: calcTotal,
      lastUpdated: new Date().toISOString(),
    };

    onSaveDailyEntry(entry);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const forecast = forecastPatientFootfall(entries);
  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const freshness = evaluateFreshness(latestEntry?.lastUpdated);

  // SVG Chart points calculation
  const trendData = forecast.trend;
  const maxVal = Math.max(...trendData.map((d) => Math.max(d.actual || 0, d.predicted || 0, 100)), 120);
  const chartHeight = 160;
  const chartWidth = 600;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                Patient Footfall & Clinical Registrations
              </h2>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold tracking-wider uppercase">
                Verified Data
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Daily OPD, acute triage registrations, and statistical surge projections
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
        {/* Form Column (6 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-6 space-y-4 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>DAILY PATIENT ENTRY</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              Auto-calculates patient volume
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date Picker */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Entry Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                id="input-patient-date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* OP Patients */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                OP Patients <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                id="input-op-patients"
                placeholder="e.g. 75"
                value={opPatients}
                onChange={(e) =>
                  setOpPatients(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Emergency Patients */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Emergency Patients <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                id="input-emergency-patients"
                placeholder="e.g. 8"
                value={emergencyPatients}
                onChange={(e) =>
                  setEmergencyPatients(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Inpatients */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Inpatients Admitted <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                id="input-inpatients"
                placeholder="e.g. 12"
                value={inpatients}
                onChange={(e) =>
                  setInpatients(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Symptomatic Breakdown Subheading */}
            <div className="sm:col-span-2 pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Symptom Breakdown (Subset of OP)
              </span>
            </div>

            {/* Fever Cases */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Fever Cases
              </label>
              <input
                type="number"
                min={0}
                id="input-fever-cases"
                placeholder="e.g. 15"
                value={feverCases}
                onChange={(e) =>
                  setFeverCases(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Respiratory Cases */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Respiratory Cases
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 8"
                value={respiratoryCases}
                onChange={(e) =>
                  setRespiratoryCases(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Diarrhea Cases */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Diarrhea Cases
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

            {/* Other Cases */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Other Cases
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 10"
                value={otherCases}
                onChange={(e) =>
                  setOtherCases(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Auto-calculated Total Callout */}
          <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                TOTAL PATIENTS (AUTOMATICALLY CALCULATED)
              </div>
              <div className="text-xs text-blue-600">OP ({opPatients || 0}) + Emergency ({emergencyPatients || 0}) + Inpatients ({inpatients || 0})</div>
            </div>
            <div className="text-2xl font-black font-mono text-blue-900">
              {calcTotal}
            </div>
          </div>

          <button
            type="submit"
            id="btn-save-daily-patient"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
          >
            {justSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>DAILY PATIENT DATA SAVED</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE DAILY PATIENT DATA</span>
              </>
            )}
          </button>
        </form>

        {/* AI Patient Forecasting & Trend Chart (7 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-xl bg-linear-to-br from-indigo-900 via-slate-900 to-slate-900 text-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI PATIENT FORECASTING</h3>
                  <p className="text-[11px] text-indigo-200">
                    Predictive epidemiological momentum model
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                Confidence: {forecast.confidencePercent}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-bold text-indigo-300">Tomorrow</div>
                <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
                  {forecast.tomorrowForecast}
                </div>
                <div className="text-[10px] text-indigo-200">Patients</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-bold text-indigo-300">Next 7 Days</div>
                <div className="text-xl sm:text-2xl font-black font-mono text-indigo-300 mt-0.5">
                  {forecast.next7DaysForecast}
                </div>
                <div className="text-[10px] text-indigo-200">Patients</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-bold text-indigo-300">Next 30 Days</div>
                <div className="text-xl sm:text-2xl font-black font-mono text-indigo-300 mt-0.5">
                  {forecast.next30DaysForecast}
                </div>
                <div className="text-[10px] text-indigo-200">Patients</div>
              </div>
            </div>

            {/* Historical Trend SVG Chart */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-xs text-indigo-200 mb-2">
                <span className="font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Historical Trend & AI Projection
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-1 text-sky-400">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span> Actual
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> AI Forecast
                  </span>
                </div>
              </div>

              {trendData.length > 0 ? (
                <div className="overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-36 overflow-visible"
                  >
                    {/* Horizontal grid lines */}
                    {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const y = chartHeight - ratio * (chartHeight - 24);
                      return (
                        <g key={i}>
                          <line
                            x1="0"
                            y1={y}
                            x2={chartWidth}
                            y2={y}
                            stroke="rgba(255,255,255,0.07)"
                            strokeDasharray="3 3"
                          />
                          <text
                            x="4"
                            y={y - 3}
                            fill="rgba(255,255,255,0.3)"
                            fontSize="9"
                            fontFamily="monospace"
                          >
                            {Math.round(ratio * maxVal)}
                          </text>
                        </g>
                      );
                    })}

                    {/* Bars & Line connectors */}
                    {trendData.map((point, index) => {
                      const colWidth = chartWidth / trendData.length;
                      const x = index * colWidth + colWidth / 2;
                      const val = point.actual || point.predicted || 0;
                      const y = chartHeight - (val / maxVal) * (chartHeight - 28) - 14;
                      const isPredicted = Boolean(point.predicted);

                      return (
                        <g key={index}>
                          {/* Vertical bar */}
                          <rect
                            x={x - 14}
                            y={y}
                            width="28"
                            height={chartHeight - y - 14}
                            rx="4"
                            fill={
                              isPredicted
                                ? 'rgba(16, 185, 129, 0.35)'
                                : 'rgba(56, 189, 248, 0.35)'
                            }
                            stroke={isPredicted ? '#10b981' : '#38bdf8'}
                            strokeWidth={isPredicted ? '1.5' : '1'}
                            strokeDasharray={isPredicted ? '3 2' : 'none'}
                          />
                          {/* Value label */}
                          <text
                            x={x}
                            y={y - 4}
                            textAnchor="middle"
                            fill={isPredicted ? '#34d399' : '#bae6fd'}
                            fontSize="10"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {val}
                          </text>
                          {/* Date label */}
                          <text
                            x={x}
                            y={chartHeight - 2}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.5)"
                            fontSize="8"
                          >
                            {point.label.slice(0, 6)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-indigo-300">
                  Enter daily patient figures to populate trendline forecast.
                </div>
              )}
            </div>
          </div>

          {/* Historical Records Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-400" /> Recent Daily Records ({entries.length})
              </span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs">
              {entries.slice(-5).reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="font-mono text-slate-700">{entry.date}</span>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>OP: <strong className="text-slate-800 font-mono">{entry.opPatients}</strong></span>
                    <span>Emerg: <strong className="text-slate-800 font-mono">{entry.emergencyPatients}</strong></span>
                    <span>Inpatients: <strong className="text-slate-800 font-mono">{entry.inpatients}</strong></span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                      {entry.totalPatients} Total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
