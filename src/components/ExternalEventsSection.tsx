import { useState, type FormEvent } from 'react';
import { ExternalEvent } from '../types';
import { CloudRain, Plus, Check, Calendar, AlertCircle, X } from 'lucide-react';

interface Props {
  events: ExternalEvent[];
  onAddEvent: (event: ExternalEvent) => void;
  onToggleActive: (id: string) => void;
}

export function ExternalEventsSection({ events, onAddEvent, onToggleActive }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<'weather' | 'festival' | 'outbreak' | 'infrastructure'>('weather');
  const [severity, setSeverity] = useState<'low' | 'moderate' | 'high'>('high');
  const [impactDescription, setImpactDescription] = useState('');

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !impactDescription) return;
    const newEvent: ExternalEvent = {
      id: `evt-${Date.now()}`,
      title,
      date,
      type,
      severity,
      impactDescription,
      active: true,
    };
    onAddEvent(newEvent);
    setTitle('');
    setImpactDescription('');
    setShowAdd(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                External Events & Environmental Surge Drivers
              </h2>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold tracking-wider uppercase">
                Active Drivers
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Monsoon advisories, mass pilgrimage festivals, vector breeding alerts, and environmental factors
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showAdd ? 'Cancel' : 'LOG EXTERNAL EVENT'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            New External Context Alert
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Event Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Northeast Monsoon Red Alert"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="weather">🌧️ Weather / Monsoon Alert</option>
                <option value="festival">🎪 Public Gathering / Festival</option>
                <option value="outbreak">🦠 Localized Cluster Warning</option>
                <option value="infrastructure">⚡ Infrastructure Disruption</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Severity Impact</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="high">🔴 High Surge Impact</option>
                <option value="moderate">🟡 Moderate Surge Impact</option>
                <option value="low">🟢 Minor Impact</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Clinical / Epidemiological Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Waterlogging in low-lying wards leading to anticipated 30% rise in vector cases"
                value={impactDescription}
                onChange={(e) => setImpactDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs transition-colors"
              >
                Save Event Driver
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Events List */}
      <div className="space-y-2.5">
        {events.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No external events recorded.</p>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                evt.active
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">{evt.title}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      evt.severity === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : evt.severity === 'moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {evt.severity} impact
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{evt.date}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{evt.impactDescription}</p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleActive(evt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    evt.active
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {evt.active ? 'Active in Model' : 'Inactive'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
