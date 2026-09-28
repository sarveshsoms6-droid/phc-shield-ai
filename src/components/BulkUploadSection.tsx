import { useState } from 'react';
import { BulkDataQualityReport } from '../types';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Check, ArrowRight } from 'lucide-react';
import { validateBulkUpload } from '../utils/phcCalculations';

interface Props {
  onConfirmBulkData: (report: BulkDataQualityReport) => void;
}

const SAMPLE_CSV = `Date,Medicine,Stock,Consumption,Patient Count,Disease Cases,Bed Occupancy,Staff Availability
2026-08-20,Paracetamol 500mg,3400,320,88,14,64,88
2026-08-21,ORS Packs,950,140,92,16,68,92
2026-08-22,Amoxicillin 500mg,1900,80,85,12,60,90
2026-08-23,Paracetamol 500mg,3080,330,95,19,72,85
2026-08-24,ORS Packs,810,145,102,22,76,82
2026-08-25,Ciprofloxacin Drops,120,15,90,14,68,88
2026-08-26,Paracetamol 500mg,2750,340,99,25,75,81
2026-08-27,ORS Packs,665,150,105,31,80,78`;

export function BulkUploadSection({ onConfirmBulkData }: Props) {
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [qualityReport, setQualityReport] = useState<BulkDataQualityReport | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handleValidate = () => {
    const report = validateBulkUpload(csvText);
    setQualityReport(report);
    setHasConfirmed(false);
  };

  const handleConfirm = () => {
    if (!qualityReport) return;
    onConfirmBulkData(qualityReport);
    setHasConfirmed(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">
                Bulk Data Upload & Quality Validation
              </h2>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold tracking-wider uppercase">
                Historical Batch
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ingest historical registers via CSV/Excel, audit integrity, detect anomalies, and update models
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CSV Textarea / File Drag Area (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              CSV / Excel Data Input
            </label>
            <button
              type="button"
              onClick={() => setCsvText(SAMPLE_CSV)}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Load Sample 500-Record Template
            </button>
          </div>

          <textarea
            rows={10}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste CSV rows here: Date,Medicine,Stock,Consumption,Patient Count,Disease Cases,Bed Occupancy,Staff Availability..."
            className="w-full p-3 rounded-lg border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 leading-relaxed text-slate-800"
          />

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500">
              Supported columns: Date, Medicine, Stock, Consumption, Patients, Disease, Beds, Staff
            </span>
            <button
              type="button"
              id="btn-validate-bulk"
              onClick={handleValidate}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              VALIDATE DATASET
            </button>
          </div>
        </div>

        {/* Validation & Data Quality Report (6 cols) */}
        <div className="lg:col-span-6">
          {!qualityReport ? (
            <div className="h-full min-h-[220px] rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center text-slate-400 bg-slate-50/50">
              <FileText className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No Dataset Validated Yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Paste historical logs or click &quot;Validate Dataset&quot; to compute the automated Data Quality Report.
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">DATA QUALITY REPORT</h3>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    qualityReport.dataQualityPercent >= 90
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : qualityReport.dataQualityPercent >= 70
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  Quality Score: {qualityReport.dataQualityPercent}%
                </span>
              </div>

              {/* 4 Key Metric Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Records Uploaded</div>
                  <div className="text-xl font-bold font-mono text-slate-800 mt-0.5">
                    {qualityReport.totalRecords}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-emerald-600">Valid</div>
                  <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                    {qualityReport.validRecords}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-amber-600">Missing Data</div>
                  <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">
                    {qualityReport.missingDataRecords}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-rose-600">Invalid</div>
                  <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">
                    {qualityReport.invalidRecords}
                  </div>
                </div>
              </div>

              {/* Issues detected */}
              {qualityReport.detectedIssues.length > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <div className="font-bold flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Issues Flagged by AI:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                    {qualityReport.detectedIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Confirmation CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  id="btn-confirm-bulk-store"
                  onClick={handleConfirm}
                  disabled={hasConfirmed}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
                    hasConfirmed
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  }`}
                >
                  {hasConfirmed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>DATA CONFIRMED & INGESTED INTO PREDICTION MODELS</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>CONFIRM & UPDATE PREDICTION MODELS</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
