import { useState, type FormEvent } from 'react';
import { EmergencyReadiness, KitStatus } from '../types';
import { ShieldAlert, Save, Check, BatteryCharging, Truck, Flame, Activity } from 'lucide-react';
import { calculateEmergencyReadinessScore, evaluateFreshness } from '../utils/phcCalculations';

interface Props {
  emergency: EmergencyReadiness;
  onUpdateEmergency: (updated: EmergencyReadiness) => void;
}

export function EmergencySection({ emergency, onUpdateEmergency }: Props) {
  const [formData, setFormData] = useState<EmergencyReadiness>(emergency);
  const [justSaved, setJustSaved] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const updated: EmergencyReadiness = {
      ...formData,
      oxygenCylinders: Number(formData.oxygenCylinders) || 0,
      emergencyBeds: Number(formData.emergencyBeds) || 0,
      lastUpdated: new Date().toISOString(),
    };
    onUpdateEmergency(updated);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const readiness = calculateEmergencyReadinessScore(formData);
  const freshness = evaluateFreshness(emergency.lastUpdated);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                Emergency Readiness & Critical Surge Preparedness
              </h2>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold tracking-wider uppercase">
                Verified Data
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Oxygen logistics, 108 ambulance standby, crash cart status, and standby electrical failover
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
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Oxygen Cylinders */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                Oxygen Availability (Cylinders)
              </label>
              <input
                type="number"
                min={0}
                required
                id="input-oxygen-cylinders"
                placeholder="e.g. 8 cylinders"
                value={formData.oxygenCylinders}
                onChange={(e) =>
                  setFormData({ ...formData, oxygenCylinders: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Ambulance Availability */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                Ambulance Availability (108 / PHC)
              </label>
              <select
                value={formData.ambulanceAvailable ? 'yes' : 'no'}
                id="select-ambulance-available"
                onChange={(e) =>
                  setFormData({ ...formData, ambulanceAvailable: e.target.value === 'yes' })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="yes">Available On-Site</option>
                <option value="no">Not Available / En-route</option>
              </select>
            </div>

            {/* Emergency Beds */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Designated Emergency Beds
              </label>
              <input
                type="number"
                min={0}
                required
                id="input-readiness-emergency-beds"
                placeholder="e.g. 5"
                value={formData.emergencyBeds}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyBeds: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Emergency Medicine Kit */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Emergency Medicine Kit (Crash Cart)
              </label>
              <select
                value={formData.emergencyMedicineKit}
                id="select-medicine-kit"
                onChange={(e) =>
                  setFormData({ ...formData, emergencyMedicineKit: e.target.value as KitStatus })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="available">🟢 Available (Fully Stocked)</option>
                <option value="low">🟡 Low (Partial ampoules depleted)</option>
                <option value="critical">🔴 Critical (Missing essential resuscitants)</option>
              </select>
            </div>

            {/* Backup Power */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <BatteryCharging className="w-3.5 h-3.5 text-amber-500" />
                Backup Power (Generator / Solar UPS)
              </label>
              <select
                value={formData.backupPower ? 'yes' : 'no'}
                id="select-backup-power"
                onChange={(e) =>
                  setFormData({ ...formData, backupPower: e.target.value === 'yes' })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="yes">Available & Fueled (Auto-cutover active)</option>
                <option value="no">Not Available (Grid dependent)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            id="btn-update-emergency-readiness"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
          >
            {justSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>READINESS DATA UPDATED</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>UPDATE EMERGENCY READINESS</span>
              </>
            )}
          </button>
        </form>

        {/* AI Readiness Score Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-linear-to-br from-slate-900 to-slate-800 text-white shadow-md">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              AI EMERGENCY READINESS SCORE
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span
                className={`text-4xl sm:text-5xl font-black font-mono ${
                  readiness.score >= 80
                    ? 'text-emerald-400'
                    : readiness.score >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {readiness.score}
              </span>
              <span className="text-xl font-bold text-slate-400 font-mono">/ 100</span>
              <span
                className={`ml-auto text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  readiness.grade === 'READY'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : readiness.grade === 'MODERATE'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {readiness.grade}
              </span>
            </div>

            {/* Breakdown item list */}
            <div className="space-y-2 text-xs border-t border-white/10 pt-3">
              {Object.entries(readiness.breakdown).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between text-slate-300">
                  <span>{key}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{val.status}</span>
                    <span className="font-mono font-bold text-white bg-white/10 px-1.5 py-0.5 rounded text-[11px]">
                      {val.points}/{val.max}
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
