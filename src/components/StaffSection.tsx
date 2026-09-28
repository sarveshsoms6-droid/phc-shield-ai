import { useState, type FormEvent } from 'react';
import { StaffAvailabilityData, StaffCategory } from '../types';
import { UserCheck, Save, Check, AlertTriangle, Users, ShieldAlert } from 'lucide-react';
import { calculateStaffMetrics, evaluateFreshness } from '../utils/phcCalculations';

interface Props {
  staffData: StaffAvailabilityData;
  onUpdateStaff: (updated: StaffAvailabilityData) => void;
}

export function StaffSection({ staffData, onUpdateStaff }: Props) {
  const [categories, setCategories] = useState<StaffCategory[]>(staffData.categories);
  const [justSaved, setJustSaved] = useState(false);

  const handleValueChange = (index: number, field: 'required' | 'availableToday', val: number) => {
    const updated = [...categories];
    updated[index] = {
      ...updated[index],
      [field]: Math.max(0, val),
    };
    setCategories(updated);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const updated: StaffAvailabilityData = {
      categories,
      lastUpdated: new Date().toISOString(),
    };
    onUpdateStaff(updated);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const metrics = calculateStaffMetrics({ categories, lastUpdated: staffData.lastUpdated });
  const freshness = evaluateFreshness(staffData.lastUpdated);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">Staff Attendance & Clinical Availability</h2>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold tracking-wider uppercase">
                Verified Data
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Daily medical officer roster, nursing shifts, paramedical, and community health workforce
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
        {/* Table Form (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-4">
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Staff Category</th>
                  <th className="py-3 px-4 text-center">Sanctioned / Required</th>
                  <th className="py-3 px-4 text-center">Available Today</th>
                  <th className="py-3 px-4 text-center">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {categories.map((cat, idx) => {
                  const hasDeficit = cat.availableToday < cat.required;
                  const pct = cat.required > 0 ? Math.round((cat.availableToday / cat.required) * 100) : 100;
                  return (
                    <tr key={cat.category} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                        <span>{cat.category}</span>
                        {hasDeficit && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            -{cat.required - cat.availableToday}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <input
                          type="number"
                          min={0}
                          value={cat.required}
                          onChange={(e) =>
                            handleValueChange(idx, 'required', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-20 text-center py-1.5 px-2 rounded-lg border border-slate-200 font-mono text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <input
                          type="number"
                          min={0}
                          value={cat.availableToday}
                          onChange={(e) =>
                            handleValueChange(idx, 'availableToday', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-20 text-center py-1.5 px-2 rounded-lg border border-slate-200 font-mono text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-slate-900"
                        />
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span
                          className={`font-bold ${
                            pct < 70
                              ? 'text-rose-600'
                              : pct < 90
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="submit"
            id="btn-save-staff"
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
          >
            {justSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>STAFF ATTENDANCE SAVED</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE STAFF ATTENDANCE</span>
              </>
            )}
          </button>
        </form>

        {/* AI Staff Availability Analysis (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              STAFF AVAILABILITY % (AUTOMATICALLY CALCULATED)
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span
                className={`text-3xl sm:text-4xl font-black font-mono ${
                  metrics.availabilityPercent < 70
                    ? 'text-rose-600'
                    : metrics.availabilityPercent < 85
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                {metrics.availabilityPercent}%
              </span>
              <span className="text-xs text-slate-600 font-semibold">
                ({metrics.totalAvailable} of {metrics.totalRequired} present)
              </span>
            </div>

            {/* Availability Status Badge */}
            <div className="mb-3">
              {metrics.alertLevel === 'CRITICAL' ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>🔴 Critical shortages (&lt;70%)</span>
                </div>
              ) : metrics.alertLevel === 'HIGH_WORKLOAD' ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>🟠 High workload (70-84%)</span>
                </div>
              ) : metrics.alertLevel === 'MONITOR' ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-100 text-yellow-900 border border-yellow-300">
                  <span>🟡 Monitor (85-94%)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <span>🟢 Optimal staffing (&ge;95%)</span>
                </div>
              )}
            </div>

            {/* Shortages breakdown */}
            <div className="pt-3 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-2">Shortages Identified:</div>
              {metrics.shortageList.length === 0 ? (
                <p className="text-xs text-emerald-700 font-medium">All clinical posts fully staffed.</p>
              ) : (
                <ul className="space-y-1 text-xs">
                  {metrics.shortageList.map((s) => (
                    <li key={s.role} className="flex items-center justify-between text-slate-700">
                      <span>{s.role}</span>
                      <span className="font-bold text-rose-600 font-mono">-{s.deficit} shortage</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
