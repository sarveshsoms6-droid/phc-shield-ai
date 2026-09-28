export type AppMode = 'demo' | 'live';

export type District =
  | 'Chennai'
  | 'Chengalpattu'
  | 'Kanchipuram'
  | 'Tiruvallur'
  | 'Vellore'
  | 'Other';

export type PHCType = 'Rural PHC' | 'Urban PHC' | '24x7 PHC' | 'Block PHC';

export type MedicineUnit = 'Tablets' | 'Bottles' | 'Vials' | 'Packs';

export type StockClassification = 'SAFE' | 'MONITOR' | 'HIGH_RISK' | 'CRITICAL';

export type EquipmentStatus = 'operational' | 'maintenance_due' | 'not_working';

export type KitStatus = 'available' | 'low' | 'critical';

export type FreshnessLevel = 'fresh' | 'aging' | 'stale';

export type DataLabel = 'VERIFIED DATA' | 'ESTIMATED DATA' | 'AI PREDICTION' | 'MISSING DATA';

export type DecisionStatus = 'pending' | 'approved' | 'modified' | 'rejected';

export interface PHCBasicInfo {
  name: string;
  district: District;
  state: string; // 'Tamil Nadu'
  type: PHCType;
  bedCapacity: number;
  populationCovered: number;
  lastUpdated: string;
}

export interface StockHistoryItem {
  timestamp: string;
  previousStock: number;
  newStock: number;
  changeReason: string;
}

export interface MedicineItem {
  id: string;
  name: string;
  currentStock: number;
  unit: MedicineUnit;
  dailyAvgConsumption: number;
  minSafetyStock: number;
  expiryDate: string;
  supplierLeadTimeDays: number;
  lastUpdated: string;
  history?: StockHistoryItem[];
}

export interface PatientDailyEntry {
  id: string;
  date: string;
  opPatients: number;
  emergencyPatients: number;
  inpatients: number;
  feverCases: number;
  respiratoryCases: number;
  diarrheaCases: number;
  otherCases: number;
  totalPatients: number;
  lastUpdated: string;
}

export interface BedStatus {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  emergencyBeds: number;
  icuBeds: number;
  isolationBeds: number;
  expectedDischarges: number;
  lastUpdated: string;
}

export interface StaffCategory {
  category: string;
  required: number;
  availableToday: number;
}

export interface StaffAvailabilityData {
  categories: StaffCategory[];
  lastUpdated: string;
}

export interface DiseaseSurveillanceEntry {
  id: string;
  date: string;
  feverCases: number;
  dengueSuspected: number;
  dengueConfirmed: number;
  malariaCases: number;
  diarrheaCases: number;
  respiratoryCases: number;
  influenzaCases: number;
  otherCases: number;
  lastUpdated: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  status: EquipmentStatus;
  lastMaintenance: string;
  nextMaintenance: string;
  notes?: string;
  lastUpdated: string;
}

export interface EmergencyReadiness {
  oxygenCylinders: number;
  ambulanceAvailable: boolean;
  emergencyBeds: number;
  emergencyMedicineKit: KitStatus;
  backupPower: boolean;
  lastUpdated: string;
}

export interface ExternalEvent {
  id: string;
  title: string;
  date: string;
  type: 'weather' | 'festival' | 'outbreak' | 'infrastructure';
  severity: 'low' | 'moderate' | 'high';
  impactDescription: string;
  active: boolean;
}

export interface ActionRecommendation {
  id: string;
  priority: number;
  title: string;
  description: string;
  rationale: string;
  category: 'medicine' | 'disease' | 'bed' | 'staff' | 'emergency';
  status: DecisionStatus;
  actionTakenNotes?: string;
  decidedAt?: string;
  decisionOfficer?: string;
}

export interface AIIntelligenceReport {
  phcSummary: string;
  overallStatus: 'STABLE' | 'ATTENTION' | 'CRITICAL_RISK';
  confidenceScore: number;
  freshnessGrade: 'High' | 'Moderate' | 'Low';
  topRisks: Array<{
    title: string;
    level: 'CRITICAL' | 'HIGH_RISK' | 'WARNING';
    description: string;
    metrics: string;
  }>;
  predictions: {
    medicineRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
    patientFootfallTomorrow: number;
    patientFootfallNext7Days: number;
    patientFootfallNext30Days: number;
    bedOccupancyTomorrowPercent: number;
    diseaseRisk: 'Low' | 'Moderate' | 'High';
    diseaseHighlight: string;
  };
  recommendedActions: ActionRecommendation[];
  generatedAt: string;
}

export interface NeighborPHC {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  medicineStock: { [medName: string]: number };
  predictedDemand: { [medName: string]: number };
  minReserve: { [medName: string]: number };
}

export interface RedistributionProposal {
  id: string;
  fromPhc: string;
  toPhc: string;
  medicineName: string;
  quantity: number;
  unit: string;
  reason: string;
  distanceKm: number;
  status: DecisionStatus;
  decisionNotes?: string;
  decidedAt?: string;
}

export interface BulkUploadRow {
  date: string;
  medicine?: string;
  stock?: number;
  consumption?: number;
  patientCount?: number;
  diseaseCases?: number;
  bedOccupancy?: number;
  staffAvailability?: number;
  raw?: Record<string, string>;
  isValid: boolean;
  errors: string[];
}

export interface BulkDataQualityReport {
  totalRecords: number;
  validRecords: number;
  missingDataRecords: number;
  invalidRecords: number;
  dataQualityPercent: number;
  detectedIssues: string[];
  sampleRows: BulkUploadRow[];
}

export interface PHCAppState {
  mode: AppMode;
  basicInfo: PHCBasicInfo;
  medicines: MedicineItem[];
  patientEntries: PatientDailyEntry[];
  bedStatus: BedStatus;
  staff: StaffAvailabilityData;
  diseaseSurveillance: DiseaseSurveillanceEntry[];
  equipments: EquipmentItem[];
  emergency: EmergencyReadiness;
  externalEvents: ExternalEvent[];
  neighborPhcs: NeighborPHC[];
  redistributionProposals: RedistributionProposal[];
  latestReport: AIIntelligenceReport | null;
  historyOfReports: AIIntelligenceReport[];
}

export interface AICopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  groundingDataPoints?: string[];
}

export type PHCOperationalData = PHCAppState;


