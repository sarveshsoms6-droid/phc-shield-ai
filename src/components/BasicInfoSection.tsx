import { useState, type FormEvent } from 'react';
import { PHCBasicInfo, District, PHCType } from '../types';
import { Building, Save, Check, Clock, Users, Bed, MapPin } from 'lucide-react';
import { evaluateFreshness } from '../utils/phcCalculations';

interface Props {
  info: PHCBasicInfo;
  onSave?: (updated: PHCBasicInfo) => void;
  onUpdateBasicInfo?: (updated: PHCBasicInfo) => void;
}

const DISTRICT_OPTIONS: District[] = [
  'Chennai',
  'Chengalpattu',
  'Kanchipuram',
  'Tiruvallur',
  'Vellore',
  'Other',
];

const PHC_TYPES: PHCType[] = [
  'Rural PHC',
  'Urban PHC',
  '24x7 PHC',
  'Block PHC',
];

export function BasicInfoSection({ info, onSave, onUpdateBasicInfo }: Props) {
  const [formData, setFormData] = useState<PHCBasicInfo>(info);
  const [justSaved, setJustSaved] = useState(false);

  const freshness = evaluateFreshness(info.lastUpdated);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const updated: PHCBasicInfo = {
      ...formData,
      lastUpdated: new Date().toISOString(),
    };
    if (onUpdateBasicInfo) onUpdateBasicInfo(updated);
    else if (onSave) onSave(updated);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">1. PHC Basic Information</h2>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold tracking-wider uppercase">
                Facility Profile
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Facility profile, jurisdictional population, and clinical bed quota
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${freshness.badgeClass}`}>
            {freshness.label} • {freshness.ageText}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PHC Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              PHC Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="input-phc-name"
              required
              placeholder="e.g. Poonamallee Primary Health Centre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all font-medium text-slate-800"
            />
          </div>

          {/* District Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              District (Tamil Nadu) <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-district"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value as District })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-800"
            >
              {DISTRICT_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} District
                </option>
              ))}
            </select>
          </div>

          {/* State (Tamil Nadu fixed) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              State
            </label>
            <input
              type="text"
              id="input-state"
              disabled
              value="Tamil Nadu"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-slate-100 text-slate-500 font-semibold cursor-not-allowed"
            />
          </div>

          {/* PHC Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              PHC Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-phc-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PHCType })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-800"
            >
              {PHC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Total Bed Capacity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-slate-400" />
              Total Bed Capacity
            </label>
            <input
              type="number"
              id="input-bed-capacity"
              min={1}
              max={200}
              required
              value={formData.bedCapacity || ''}
              onChange={(e) =>
                setFormData({ ...formData, bedCapacity: parseInt(e.target.value, 10) || 0 })
              }
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all font-medium text-slate-800"
            />
          </div>

          {/* Population Covered */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Population Covered
            </label>
            <input
              type="number"
              id="input-population"
              min={100}
              step={100}
              required
              value={formData.populationCovered || ''}
              onChange={(e) =>
                setFormData({ ...formData, populationCovered: parseInt(e.target.value, 10) || 0 })
              }
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Action Button & Timestamp */}
        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Last Updated Timestamp:{' '}
              <strong className="text-slate-700 font-mono">
                {new Date(info.lastUpdated).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </span>
          </div>

          <button
            type="submit"
            id="btn-save-phc-info"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
          >
            {justSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>SAVED SUCCESSFULLY</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE PHC INFORMATION</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
