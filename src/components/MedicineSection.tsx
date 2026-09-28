import { useState, type FormEvent } from 'react';
import { MedicineItem, MedicineUnit } from '../types';
import {
  Pill,
  Plus,
  Trash2,
  Edit2,
  History,
  TrendingDown,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  Check,
  X,
} from 'lucide-react';
import {
  calculateStockDays,
  classifyStock,
  generateMedicineRecommendation,
  evaluateFreshness,
} from '../utils/phcCalculations';

interface Props {
  medicines: MedicineItem[];
  onAddMedicine: (item: MedicineItem) => void;
  onUpdateMedicine: (item: MedicineItem) => void;
  onDeleteMedicine: (id: string) => void;
}

const UNIT_OPTIONS: MedicineUnit[] = ['Tablets', 'Bottles', 'Vials', 'Packs'];

export function MedicineSection({
  medicines,
  onAddMedicine,
  onUpdateMedicine,
  onDeleteMedicine,
}: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMed, setEditingMed] = useState<MedicineItem | null>(null);
  const [historyMed, setHistoryMed] = useState<MedicineItem | null>(null);
  const [quickStockUpdateMed, setQuickStockUpdateMed] = useState<MedicineItem | null>(null);
  const [newStockVal, setNewStockVal] = useState('');
  const [stockReason, setStockReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Form State
  const [name, setName] = useState('');
  const [currentStock, setCurrentStock] = useState<number | ''>('');
  const [unit, setUnit] = useState<MedicineUnit>('Tablets');
  const [dailyAvgConsumption, setDailyAvgConsumption] = useState<number | ''>('');
  const [minSafetyStock, setMinSafetyStock] = useState<number | ''>('');
  const [expiryDate, setExpiryDate] = useState('2027-06-30');
  const [supplierLeadTimeDays, setSupplierLeadTimeDays] = useState<number | ''>(3);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!name || currentStock === '' || dailyAvgConsumption === '') return;

    const newItem: MedicineItem = {
      id: `med-${Date.now()}`,
      name,
      currentStock: Number(currentStock),
      unit,
      dailyAvgConsumption: Number(dailyAvgConsumption),
      minSafetyStock: Number(minSafetyStock) || 500,
      expiryDate,
      supplierLeadTimeDays: Number(supplierLeadTimeDays) || 3,
      lastUpdated: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          previousStock: 0,
          newStock: Number(currentStock),
          changeReason: 'Initial Stock Entry',
        },
      ],
    };

    onAddMedicine(newItem);
    // Reset
    setName('');
    setCurrentStock('');
    setDailyAvgConsumption('');
    setMinSafetyStock('');
    setShowAddForm(false);
  };

  const handleEditSave = (e: FormEvent) => {
    e.preventDefault();
    if (!editingMed) return;
    onUpdateMedicine({
      ...editingMed,
      lastUpdated: new Date().toISOString(),
    });
    setEditingMed(null);
  };

  const handleStockUpdateSave = (e: FormEvent) => {
    e.preventDefault();
    if (!quickStockUpdateMed || newStockVal === '') return;
    const oldStock = quickStockUpdateMed.currentStock;
    const updatedStock = Number(newStockVal);

    const historyEntry = {
      timestamp: new Date().toISOString(),
      previousStock: oldStock,
      newStock: updatedStock,
      changeReason: stockReason || 'Manual physical stock audit',
    };

    onUpdateMedicine({
      ...quickStockUpdateMed,
      currentStock: updatedStock,
      lastUpdated: new Date().toISOString(),
      history: [historyEntry, ...(quickStockUpdateMed.history || [])],
    });

    setQuickStockUpdateMed(null);
    setNewStockVal('');
    setStockReason('');
  };

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                Medicine Stock Entry & Inventory
              </h2>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold tracking-wider uppercase">
                Verified Data
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Stock management, consumption tracking, and proactive shortage alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-toggle-add-medicine"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
          >
            {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showAddForm ? 'Close Entry Form' : 'ADD MEDICINE'}</span>
          </button>
        </div>
      </div>

      {/* Add Medicine Form (Expandable) */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-600" />
              <span>MEDICINE STOCK ENTRY</span>
            </h3>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Manual PHC Input
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Medicine Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Medicine Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                id="input-med-name"
                placeholder="e.g. Paracetamol"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Current Stock */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Current Stock <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                id="input-med-stock"
                placeholder="e.g. 2500"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Unit Dropdown */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Unit
              </label>
              <select
                value={unit}
                id="select-med-unit"
                onChange={(e) => setUnit(e.target.value as MedicineUnit)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Daily Average Consumption */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Daily Avg Consumption <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                id="input-med-consumption"
                placeholder="e.g. 350"
                value={dailyAvgConsumption}
                onChange={(e) =>
                  setDailyAvgConsumption(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Minimum Safety Stock */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Min Safety Stock
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 1000"
                value={minSafetyStock}
                onChange={(e) =>
                  setMinSafetyStock(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Supplier Lead Time */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Supplier Lead Time (Days)
              </label>
              <input
                type="number"
                min={1}
                placeholder="e.g. 3 days"
                value={supplierLeadTimeDays}
                onChange={(e) =>
                  setSupplierLeadTimeDays(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                id="btn-submit-add-medicine"
                className="w-full py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
              >
                ADD MEDICINE
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search & Filter Toolbar */}
      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicine by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
          <span className="font-semibold text-slate-700">Stock Risk:</span>
          <span className="inline-flex items-center gap-1 text-emerald-700">🟢 &gt;15d (Safe)</span>
          <span className="inline-flex items-center gap-1 text-yellow-700">🟡 8-15d (Monitor)</span>
          <span className="inline-flex items-center gap-1 text-amber-700">🟠 4-7d (High)</span>
          <span className="inline-flex items-center gap-1 text-red-700 font-bold">🔴 &lt;4d (Critical)</span>
        </div>
      </div>

      {/* Medicine Cards List */}
      {filteredMedicines.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
          <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No medicines found</p>
          <p className="text-xs text-slate-400 mt-1">
            Click &quot;[ + ADD MEDICINE ]&quot; to enter your facility&apos;s stock items.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMedicines.map((med) => {
            const daysRemaining = calculateStockDays(med.currentStock, med.dailyAvgConsumption);
            const classification = classifyStock(daysRemaining);
            const recommendation = generateMedicineRecommendation(med);
            const freshness = evaluateFreshness(med.lastUpdated);

            return (
              <div
                key={med.id}
                className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-xs transition-all bg-white"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Medicine Title & Tags */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{med.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${classification.badgeBg} ${classification.badgeBorder} ${classification.badgeText}`}>
                        {classification.label}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        Unit: {med.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span>
                        Current Stock: <strong className="text-slate-800 font-mono">{med.currentStock.toLocaleString()}</strong> {med.unit}
                      </span>
                      <span>•</span>
                      <span>
                        Daily Consumption: <strong className="text-slate-800 font-mono">{med.dailyAvgConsumption}</strong> /day
                      </span>
                      <span>•</span>
                      <span>
                        Min Safety Stock: <strong className="text-slate-700 font-mono">{med.minSafetyStock.toLocaleString()}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Expiry: <strong className="text-slate-700">{med.expiryDate}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {freshness.ageText}
                      </span>
                    </div>
                  </div>

                  {/* Calculations & Quick Controls */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        DAYS OF STOCK REMAINING
                      </div>
                      <div className={`text-xl font-black font-mono ${classification.color}`}>
                        {daysRemaining} Days
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Formula: {med.currentStock} ÷ {med.dailyAvgConsumption}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setQuickStockUpdateMed(med);
                          setNewStockVal(String(med.currentStock));
                        }}
                        title="Update Stock & Record Reason"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        Update Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => setHistoryMed(med)}
                        title="View stock history"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMed(med)}
                        title="Edit medicine details"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteMedicine(med.id)}
                        title="Delete medicine"
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation Banner */}
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-start gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-indigo-900">AI RECOMMENDATION: </span>
                    <span className="text-slate-700 leading-relaxed">{recommendation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Stock Update Modal */}
      {quickStockUpdateMed && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Update Stock: {quickStockUpdateMed.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter current physical verification count and log the dispensation or delivery cause.
            </p>

            <form onSubmit={handleStockUpdateSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Physical Stock ({quickStockUpdateMed.unit})
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Audit Reason / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. TNMSC delivery received, or OP clinic surge"
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickStockUpdateMed(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                >
                  Update & Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {historyMed && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Stock History: {historyMed.name}
                </h3>
                <p className="text-xs text-slate-500">Audit trail of stock adjustments and dispensations</p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryMed(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto space-y-2 flex-1">
              {(!historyMed.history || historyMed.history.length === 0) ? (
                <p className="text-xs text-slate-400 text-center py-6">No previous adjustments logged.</p>
              ) : (
                historyMed.history.map((h, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="font-mono">
                        {new Date(h.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="font-bold text-slate-800">
                        {h.previousStock} → {h.newStock} {historyMed.unit}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">{h.changeReason}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setHistoryMed(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Edit Medicine Modal */}
      {editingMed && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">Edit Medicine Details</h3>
            <form onSubmit={handleEditSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={editingMed.name}
                    onChange={(e) => setEditingMed({ ...editingMed, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                  <select
                    value={editingMed.unit}
                    onChange={(e) =>
                      setEditingMed({ ...editingMed, unit: e.target.value as MedicineUnit })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={editingMed.currentStock}
                    onChange={(e) =>
                      setEditingMed({ ...editingMed, currentStock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daily Avg Consumption
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingMed.dailyAvgConsumption}
                    onChange={(e) =>
                      setEditingMed({ ...editingMed, dailyAvgConsumption: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Safety Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={editingMed.minSafetyStock}
                    onChange={(e) =>
                      setEditingMed({ ...editingMed, minSafetyStock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editingMed.expiryDate}
                    onChange={(e) => setEditingMed({ ...editingMed, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMed(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
