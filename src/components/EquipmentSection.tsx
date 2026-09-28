import { useState, type FormEvent } from 'react';
import { EquipmentItem, EquipmentStatus } from '../types';
import { Wrench, Plus, Trash2, Edit2, AlertCircle, CheckCircle2, Clock, X } from 'lucide-react';
import { evaluateFreshness } from '../utils/phcCalculations';

interface Props {
  equipments: EquipmentItem[];
  onAddEquipment: (item: EquipmentItem) => void;
  onUpdateEquipment: (item: EquipmentItem) => void;
  onDeleteEquipment: (id: string) => void;
}

export function EquipmentSection({
  equipments,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<EquipmentStatus>('operational');
  const [lastMaintenance, setLastMaintenance] = useState(new Date().toISOString().slice(0, 10));
  const [nextMaintenance, setNextMaintenance] = useState(
    new Date(Date.now() + 86400000 * 90).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const item: EquipmentItem = {
      id: `eq-${Date.now()}`,
      name,
      status,
      lastMaintenance,
      nextMaintenance,
      notes,
      lastUpdated: new Date().toISOString(),
    };
    onAddEquipment(item);
    setName('');
    setNotes('');
    setShowAdd(false);
  };

  const handleStatusToggle = (item: EquipmentItem, newStatus: EquipmentStatus) => {
    onUpdateEquipment({
      ...item,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                Medical Equipment Status & Maintenance Lifecycle
              </h2>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold tracking-wider uppercase">
                Verified Data
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Biomedical devices, cold chain integrity, calibration cycles, and breakdown logs
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showAdd ? 'Cancel' : 'ADD EQUIPMENT'}</span>
        </button>
      </div>

      {/* Add Equipment Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            New Biomedical Equipment Entry
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Equipment Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Oxygen Concentrator"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="operational">🟢 Operational</option>
                <option value="maintenance_due">🟡 Maintenance Due</option>
                <option value="not_working">🔴 Not Working</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Last Maintenance</label>
              <input
                type="date"
                value={lastMaintenance}
                onChange={(e) => setLastMaintenance(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Next Maintenance</label>
              <input
                type="date"
                value={nextMaintenance}
                onChange={(e) => setNextMaintenance(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Notes / Biomedical Work Order</label>
              <input
                type="text"
                placeholder="e.g. Filter replaced, or biomedical engineer scheduled"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs transition-colors"
              >
                Save Equipment
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Equipment Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Equipment</th>
              <th className="py-3 px-4">Operating Status</th>
              <th className="py-3 px-4">Last Maintenance</th>
              <th className="py-3 px-4">Next Maintenance</th>
              <th className="py-3 px-4">Diagnostic Notes</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {equipments.map((eq) => {
              return (
                <tr key={eq.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{eq.name}</td>
                  <td className="py-3 px-4">
                    <select
                      value={eq.status}
                      onChange={(e) => handleStatusToggle(eq, e.target.value as EquipmentStatus)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        eq.status === 'operational'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : eq.status === 'maintenance_due'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <option value="operational">🟢 Operational</option>
                      <option value="maintenance_due">🟡 Maintenance Due</option>
                      <option value="not_working">🔴 Not Working</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{eq.lastMaintenance}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{eq.nextMaintenance}</td>
                  <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                    {eq.notes || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteEquipment(eq.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete equipment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
