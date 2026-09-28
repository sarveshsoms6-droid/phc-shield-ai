import {
  MedicineItem,
  StockClassification,
  BedStatus,
  StaffAvailabilityData,
  DiseaseSurveillanceEntry,
  EmergencyReadiness,
  FreshnessLevel,
  PatientDailyEntry,
  AIIntelligenceReport,
  BulkUploadRow,
  BulkDataQualityReport,
  ActionRecommendation,
} from '../types';

export function calculateStockDays(stock: number, dailyConsumption: number): number {
  if (dailyConsumption <= 0) return 999;
  return Number((stock / dailyConsumption).toFixed(1));
}

export function classifyStock(daysRemaining: number): {
  category: StockClassification;
  label: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
} {
  if (daysRemaining < 4) {
    return {
      category: 'CRITICAL',
      label: '🔴 CRITICAL (< 4 days)',
      color: 'text-red-700',
      badgeBg: 'bg-red-50',
      badgeBorder: 'border-red-200',
      badgeText: 'text-red-700',
    };
  }
  if (daysRemaining <= 7) {
    return {
      category: 'HIGH_RISK',
      label: '🟠 HIGH RISK (4–7 days)',
      color: 'text-amber-700',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-200',
      badgeText: 'text-amber-700',
    };
  }
  if (daysRemaining <= 15) {
    return {
      category: 'MONITOR',
      label: '🟡 MONITOR (8–15 days)',
      color: 'text-yellow-700',
      badgeBg: 'bg-yellow-50',
      badgeBorder: 'border-yellow-200',
      badgeText: 'text-yellow-800',
    };
  }
  return {
    category: 'SAFE',
    label: '🟢 SAFE (> 15 days)',
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-700',
  };
}

export function generateMedicineRecommendation(item: MedicineItem): string {
  const days = calculateStockDays(item.currentStock, item.dailyAvgConsumption);
  if (days < 4) {
    return `${item.name} stock is expected to become critical within ${days} days. Based on current consumption (${item.dailyAvgConsumption} ${item.unit}/day), immediate replenishment or district redistribution is recommended.`;
  }
  if (days <= 7) {
    return `${item.name} is at high stockout risk (${days} days remaining). Supplier lead time is ${item.supplierLeadTimeDays} days; place indent order now to prevent rupture.`;
  }
  if (days <= 15) {
    return `${item.name} has ${days} days supply remaining. Current buffer is within monitor threshold. Review weekly consumption.`;
  }
  return `${item.name} buffer is optimal with ${days} days of operational coverage.`;
}

export function calculateBedOccupancy(bed: BedStatus): {
  occupancyPercent: number;
  availableBeds: number;
  statusText: string;
} {
  const total = Math.max(1, bed.totalBeds);
  const occupied = Math.min(total, Math.max(0, bed.occupiedBeds));
  const available = Math.max(0, total - occupied);
  const pct = Math.round((occupied / total) * 100);
  let statusText = 'Normal Capacity';
  if (pct >= 90) statusText = 'Critical Overcrowding';
  else if (pct >= 80) statusText = 'High Occupancy Pressure';
  else if (pct >= 60) statusText = 'Moderate Inpatient Flow';

  return {
    occupancyPercent: pct,
    availableBeds: available,
    statusText,
  };
}

export function calculateStaffMetrics(staffData: StaffAvailabilityData): {
  totalRequired: number;
  totalAvailable: number;
  availabilityPercent: number;
  shortageList: Array<{ role: string; deficit: number }>;
  alertLevel: 'CRITICAL' | 'HIGH_WORKLOAD' | 'MONITOR' | 'OPTIMAL';
} {
  let req = 0;
  let avail = 0;
  const shortages: Array<{ role: string; deficit: number }> = [];

  for (const cat of staffData.categories) {
    req += cat.required;
    avail += cat.availableToday;
    if (cat.availableToday < cat.required) {
      shortages.push({
        role: cat.category,
        deficit: cat.required - cat.availableToday,
      });
    }
  }

  const pct = req > 0 ? Math.round((avail / req) * 100) : 100;
  let alertLevel: 'CRITICAL' | 'HIGH_WORKLOAD' | 'MONITOR' | 'OPTIMAL' = 'OPTIMAL';
  if (pct < 70) alertLevel = 'CRITICAL';
  else if (pct < 80) alertLevel = 'HIGH_WORKLOAD';
  else if (pct < 90) alertLevel = 'MONITOR';

  return {
    totalRequired: req,
    totalAvailable: avail,
    availabilityPercent: pct,
    shortageList: shortages,
    alertLevel,
  };
}

export function calculateEmergencyReadinessScore(emergency: EmergencyReadiness): {
  score: number;
  breakdown: Record<string, { points: number; max: number; status: string }>;
  grade: 'READY' | 'MODERATE' | 'VULNERABLE';
} {
  let score = 0;
  const breakdown: Record<string, { points: number; max: number; status: string }> = {};

  // Oxygen cylinders (25 max)
  let oxyPts = 0;
  if (emergency.oxygenCylinders >= 8) oxyPts = 25;
  else if (emergency.oxygenCylinders >= 5) oxyPts = 18;
  else if (emergency.oxygenCylinders >= 2) oxyPts = 10;
  else oxyPts = 0;
  score += oxyPts;
  breakdown['Medical Oxygen'] = {
    points: oxyPts,
    max: 25,
    status: `${emergency.oxygenCylinders} cylinders on site`,
  };

  // Ambulance (20 max)
  const ambPts = emergency.ambulanceAvailable ? 20 : 0;
  score += ambPts;
  breakdown['108 / PHC Ambulance'] = {
    points: ambPts,
    max: 20,
    status: emergency.ambulanceAvailable ? 'Operational & Stationed' : 'Not Available / En-route',
  };

  // Emergency Beds (15 max)
  let bedPts = 0;
  if (emergency.emergencyBeds >= 5) bedPts = 15;
  else if (emergency.emergencyBeds >= 3) bedPts = 10;
  else if (emergency.emergencyBeds >= 1) bedPts = 5;
  score += bedPts;
  breakdown['Triage / Emergency Beds'] = {
    points: bedPts,
    max: 15,
    status: `${emergency.emergencyBeds} designated acute beds`,
  };

  // Emergency Medicine Kit (20 max)
  let kitPts = 0;
  if (emergency.emergencyMedicineKit === 'available') kitPts = 20;
  else if (emergency.emergencyMedicineKit === 'low') kitPts = 10;
  else kitPts = 2;
  score += kitPts;
  breakdown['Crash Cart / Emergency Kit'] = {
    points: kitPts,
    max: 20,
    status: emergency.emergencyMedicineKit.toUpperCase(),
  };

  // Backup Power (20 max)
  const pwrPts = emergency.backupPower ? 20 : 0;
  score += pwrPts;
  breakdown['Generator / Solar Backup'] = {
    points: pwrPts,
    max: 20,
    status: emergency.backupPower ? 'Grid failover ready' : 'No operational backup',
  };

  let grade: 'READY' | 'MODERATE' | 'VULNERABLE' = 'READY';
  if (score < 60) grade = 'VULNERABLE';
  else if (score < 80) grade = 'MODERATE';

  return { score, breakdown, grade };
}

export function evaluateFreshness(isoString?: string): {
  level: FreshnessLevel;
  label: string;
  badgeClass: string;
  dotClass: string;
  ageText: string;
} {
  if (!isoString) {
    return {
      level: 'stale',
      label: 'MISSING DATA',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
      dotClass: 'bg-slate-400',
      ageText: 'Never updated',
    };
  }

  const then = new Date(isoString).getTime();
  const now = Date.now();
  const diffHours = (now - then) / (1000 * 60 * 60);

  if (diffHours < 24) {
    const mins = Math.max(1, Math.round(diffHours * 60));
    const ageText = mins < 60 ? `${mins} min${mins === 1 ? '' : 's'} ago` : `${Math.round(diffHours)} hours ago`;
    return {
      level: 'fresh',
      label: '🟢 FRESH',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
      ageText,
    };
  }

  if (diffHours <= 72) {
    const days = Math.floor(diffHours / 24);
    return {
      level: 'aging',
      label: '🟡 AGING',
      badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      dotClass: 'bg-yellow-500',
      ageText: days === 1 ? 'Updated yesterday' : `Updated ${days} days ago`,
    };
  }

  const days = Math.floor(diffHours / 24);
  return {
    level: 'stale',
    label: '🔴 STALE',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
    ageText: `Updated ${days} days ago`,
  };
}

export function analyzeDiseaseSurveillance(entries: DiseaseSurveillanceEntry[]) {
  if (!entries || entries.length === 0) {
    return {
      hasSurge: false,
      feverPercentChange: 0,
      currentFever: 0,
      prevFever: 0,
      dengueRisk: 'Low' as const,
      riskLevel: 'LOW' as const,
      explanation: 'No disease surveillance records recorded yet.',
      recommendation: 'Enter daily disease surveillance data for cluster analysis.',
    };
  }

  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const current = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : sorted[0];

  const prevFever = previous.feverCases || 24;
  const currFever = current.feverCases || 0;
  const feverChangePct = prevFever > 0 ? Math.round(((currFever - prevFever) / prevFever) * 100) : 0;

  const totalDengue = (current.dengueSuspected || 0) + (current.dengueConfirmed || 0) * 2;
  let dengueRisk: 'Low' | 'Moderate' | 'High' = 'Low';
  if (totalDengue >= 8 || current.dengueConfirmed >= 2) dengueRisk = 'High';
  else if (totalDengue >= 4) dengueRisk = 'Moderate';

  const isSurge = feverChangePct >= 50 || dengueRisk === 'High';
  const riskLevel = feverChangePct >= 50 || dengueRisk === 'High' ? 'HIGH' : feverChangePct >= 25 ? 'MODERATE' : 'LOW';

  const explanation = `Fever cases have increased by ${feverChangePct}% compared with the previous recorded period (${prevFever} → ${currFever} cases). Dengue suspected: ${current.dengueSuspected}, Confirmed: ${current.dengueConfirmed}.`;
  const recommendation = 'Increase vector control surveillance, distribute fever medication kits, and alert district health surveillance officers.';

  return {
    hasSurge: isSurge,
    feverPercentChange: feverChangePct,
    currentFever: currFever,
    prevFever: prevFever,
    dengueRisk,
    riskLevel,
    explanation,
    recommendation,
  };
}

export function forecastPatientFootfall(entries: PatientDailyEntry[]): {
  tomorrowForecast: number;
  next7DaysForecast: number;
  next30DaysForecast: number;
  confidencePercent: number;
  trend: Array<{ date: string; actual?: number; predicted?: number; label: string }>;
} {
  if (!entries || entries.length === 0) {
    return {
      tomorrowForecast: 85,
      next7DaysForecast: 600,
      next30DaysForecast: 2500,
      confidencePercent: 55,
      trend: [],
    };
  }

  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const recentDays = sorted.slice(-7);
  const avg = recentDays.reduce((acc, c) => acc + c.totalPatients, 0) / Math.max(1, recentDays.length);
  const lastTotal = sorted[sorted.length - 1].totalPatients;

  // Linear momentum calculation
  const momentum = lastTotal > avg ? 1.08 : 0.98;
  const tomorrowForecast = Math.round(lastTotal * momentum);
  const next7DaysForecast = Math.round(tomorrowForecast * 7 * 0.96);
  const next30DaysForecast = Math.round(tomorrowForecast * 30 * 0.92);

  // Confidence formula based on sample size
  const confidencePercent = Math.min(94, Math.max(65, 70 + sorted.length * 2));

  const trend: Array<{ date: string; actual?: number; predicted?: number; label: string }> = [];

  sorted.slice(-7).forEach((entry) => {
    trend.push({
      date: entry.date,
      actual: entry.totalPatients,
      label: new Date(entry.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
    });
  });

  // Add tomorrow projection
  const lastDate = new Date(sorted[sorted.length - 1].date);
  const tomorrowDate = new Date(lastDate.getTime() + 86400000);
  const tomorrowDateStr = tomorrowDate.toISOString().slice(0, 10);
  trend.push({
    date: tomorrowDateStr,
    predicted: tomorrowForecast,
    label: 'Tomorrow (AI)',
  });

  return {
    tomorrowForecast,
    next7DaysForecast,
    next30DaysForecast,
    confidencePercent,
    trend,
  };
}

export function validateBulkUpload(rawCsvText: string): BulkDataQualityReport {
  const lines = rawCsvText.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    return {
      totalRecords: 0,
      validRecords: 0,
      missingDataRecords: 0,
      invalidRecords: 0,
      dataQualityPercent: 0,
      detectedIssues: ['No data rows found in CSV.'],
      sampleRows: [],
    };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/[\s_]/g, ''));
  const dataLines = lines.slice(1);
  const rows: BulkUploadRow[] = [];
  let validCount = 0;
  let missingCount = 0;
  let invalidCount = 0;
  const issuesSet = new Set<string>();

  dataLines.forEach((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const rowErrors: string[] = [];
    let isRowMissing = false;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cols[idx] || '';
    });

    const dateVal = rowObj['date'] || cols[0] || '';
    if (!dateVal || isNaN(Date.parse(dateVal))) {
      rowErrors.push('Invalid or missing Date');
      isRowMissing = true;
    }

    const patientCount = parseInt(rowObj['patientcount'] || rowObj['patients'] || cols[4] || '0', 10);
    if (isNaN(patientCount) || patientCount < 0) {
      rowErrors.push('Patient count must be a non-negative number');
    }

    const stock = parseInt(rowObj['stock'] || cols[2] || '0', 10);
    const consumption = parseInt(rowObj['consumption'] || cols[3] || '0', 10);
    if (isNaN(stock)) rowErrors.push('Stock is non-numeric');
    if (isNaN(consumption)) rowErrors.push('Consumption is non-numeric');

    const isValid = rowErrors.length === 0;
    if (isValid) validCount++;
    else if (isRowMissing) {
      missingCount++;
      issuesSet.add('Incomplete records with missing date or required fields');
    } else {
      invalidCount++;
      issuesSet.add('Out of range or non-numeric formatting');
    }

    rows.push({
      date: dateVal || 'N/A',
      medicine: rowObj['medicine'] || cols[1] || 'Generic item',
      stock: isNaN(stock) ? 0 : stock,
      consumption: isNaN(consumption) ? 0 : consumption,
      patientCount: isNaN(patientCount) ? 0 : patientCount,
      diseaseCases: parseInt(rowObj['diseasecases'] || cols[5] || '0', 10) || 0,
      bedOccupancy: parseInt(rowObj['bedoccupancy'] || cols[6] || '0', 10) || 0,
      staffAvailability: parseInt(rowObj['staffavailability'] || cols[7] || '0', 10) || 0,
      raw: rowObj,
      isValid,
      errors: rowErrors,
    });
  });

  const total = rows.length;
  const quality = total > 0 ? Math.round((validCount / total) * 100) : 0;

  return {
    totalRecords: total,
    validRecords: validCount,
    missingDataRecords: missingCount,
    invalidRecords: invalidCount,
    dataQualityPercent: quality,
    detectedIssues: Array.from(issuesSet),
    sampleRows: rows.slice(0, 8),
  };
}

export function generateHeuristicIntelligenceReport(
  medicines: MedicineItem[],
  patients: PatientDailyEntry[],
  bed: BedStatus,
  staff: StaffAvailabilityData,
  diseases: DiseaseSurveillanceEntry[],
  emergency: EmergencyReadiness
): AIIntelligenceReport {
  const topRisks: Array<{
    title: string;
    level: 'CRITICAL' | 'HIGH_RISK' | 'WARNING';
    description: string;
    metrics: string;
  }> = [];

  // Medicine Risk Check
  let lowestDays = 999;
  let criticalMedName = 'Essential Medicines';
  medicines.forEach((m) => {
    const d = calculateStockDays(m.currentStock, m.dailyAvgConsumption);
    if (d < lowestDays) {
      lowestDays = d;
      criticalMedName = m.name;
    }
  });

  let medicineRisk: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
  if (lowestDays < 4) {
    medicineRisk = 'Critical';
    topRisks.push({
      title: `${criticalMedName} Shortage Predicted`,
      level: 'CRITICAL',
      description: `Stockout imminent in ~${lowestDays} days based on daily consumption rate.`,
      metrics: `Stock: ${lowestDays} days remaining`,
    });
  } else if (lowestDays <= 7) {
    medicineRisk = 'High';
    topRisks.push({
      title: `${criticalMedName} Buffer Depletion`,
      level: 'HIGH_RISK',
      description: `Low safety stock (${lowestDays} days coverage). Supplier replenishment lead time may exceed reserve.`,
      metrics: `Reserve: ${lowestDays} days`,
    });
  }

  // Disease Risk Check
  const diseaseAnalysis = analyzeDiseaseSurveillance(diseases);
  let diseaseRisk: 'Low' | 'Moderate' | 'High' = 'Low';
  if (diseaseAnalysis.hasSurge || diseaseAnalysis.feverPercentChange >= 50) {
    diseaseRisk = 'High';
    topRisks.push({
      title: 'Unusual Fever & Vector Surge Detected',
      level: 'HIGH_RISK',
      description: diseaseAnalysis.explanation,
      metrics: `+${diseaseAnalysis.feverPercentChange}% surge vs baseline`,
    });
  } else if (diseaseAnalysis.feverPercentChange >= 25) {
    diseaseRisk = 'Moderate';
  }

  // Staff Check
  const staffMetrics = calculateStaffMetrics(staff);
  if (staffMetrics.alertLevel === 'CRITICAL') {
    topRisks.push({
      title: 'Critical Clinical Staff Deficit',
      level: 'CRITICAL',
      description: `Overall availability is only ${staffMetrics.availabilityPercent}%. Immediate locum re-allocation required.`,
      metrics: `${staffMetrics.totalAvailable}/${staffMetrics.totalRequired} personnel on duty`,
    });
  } else if (staffMetrics.alertLevel === 'HIGH_WORKLOAD') {
    topRisks.push({
      title: 'High Clinical Workload Pressure',
      level: 'WARNING',
      description: `Staff availability at ${staffMetrics.availabilityPercent}%. Primary care wards operating near fatigue thresholds.`,
      metrics: `${staffMetrics.totalAvailable} of ${staffMetrics.totalRequired} present`,
    });
  }

  // Bed & Patient Forecast
  const bedMetrics = calculateBedOccupancy(bed);
  const patientForecast = forecastPatientFootfall(patients);

  // Tomorrow Bed Occupancy Projection
  const estimatedAdmissionsTomorrow = Math.round(patientForecast.tomorrowForecast * 0.12);
  const projectedOccupied = Math.min(bed.totalBeds, bed.occupiedBeds + estimatedAdmissionsTomorrow - bed.expectedDischarges);
  const projectedOccupancyPercent = Math.round((projectedOccupied / Math.max(1, bed.totalBeds)) * 100);

  if (projectedOccupancyPercent >= 90) {
    topRisks.push({
      title: 'Acute Inpatient Bed Saturation',
      level: 'HIGH_RISK',
      description: `Predicted bed occupancy may reach ${projectedOccupancyPercent}% tomorrow under current surge conditions.`,
      metrics: `${projectedOccupied}/${bed.totalBeds} beds (${projectedOccupancyPercent}%)`,
    });
  }

  // Recommended Actions
  const recommendedActions: ActionRecommendation[] = [];
  let priority = 1;

  if (medicineRisk === 'Critical' || medicineRisk === 'High') {
    recommendedActions.push({
      id: `act-${Date.now()}-1`,
      priority: priority++,
      title: `Emergency Replenishment & Redistribution: ${criticalMedName}`,
      description: `Initiate emergency indent via TNMSC portal and request 500 units inter-PHC redistribution from neighboring Block PHC.`,
      rationale: `Stock remaining is ${lowestDays} days; buffer is inadequate to withstand local monsoon surge.`,
      category: 'medicine',
      status: 'pending',
    });
  }

  if (diseaseRisk === 'High') {
    recommendedActions.push({
      id: `act-${Date.now()}-2`,
      priority: priority++,
      title: 'Intensify Ward Fever Surveillance & Vector Fogging',
      description: 'Mobilize village ASHA workers for fever cluster mapping in 3 wards and ensure RDT testing kits are pre-positioned.',
      rationale: `Fever case reports have spiked by ${diseaseAnalysis.feverPercentChange}% with ${diseaseAnalysis.currentFever} patients reported this week.`,
      category: 'disease',
      status: 'pending',
    });
  }

  if (projectedOccupancyPercent >= 80) {
    recommendedActions.push({
      id: `act-${Date.now()}-3`,
      priority: priority++,
      title: 'Expand Step-down Bed Capacity & Expedite Discharge',
      description: 'Prepare 4 auxiliary isolation beds and review stable recovering patients for step-down home monitoring.',
      rationale: `Forecast predicts ${projectedOccupancyPercent}% bed occupancy tomorrow with ${patientForecast.tomorrowForecast} incoming patients.`,
      category: 'bed',
      status: 'pending',
    });
  }

  if (staffMetrics.shortageList.length > 0) {
    recommendedActions.push({
      id: `act-${Date.now()}-4`,
      priority: priority++,
      title: `Roster Re-balancing for ${staffMetrics.shortageList.map((s) => s.role).join(', ')}`,
      description: 'Request district health office for temporary deputation or shift overlap during peak morning OPD (9 AM - 1 PM).',
      rationale: `Current staff coverage is ${staffMetrics.availabilityPercent}% with key clinical deficits.`,
      category: 'staff',
      status: 'pending',
    });
  }

  // Overall status
  let overallStatus: 'STABLE' | 'ATTENTION' | 'CRITICAL_RISK' = 'STABLE';
  if (topRisks.some((r) => r.level === 'CRITICAL')) overallStatus = 'CRITICAL_RISK';
  else if (topRisks.length > 0) overallStatus = 'ATTENTION';

  const phcSummary =
    overallStatus === 'CRITICAL_RISK'
      ? `Your PHC is operational but has urgent critical risks requiring immediate intervention: ${topRisks.map((r) => r.title).join(', ')}.`
      : overallStatus === 'ATTENTION'
      ? `Your PHC is operating with moderate vigilance alerts. Key priorities include ${topRisks[0]?.title || 'inventory monitoring'}.`
      : 'Your PHC operations, medicine reserves, and clinical staffing are currently within safe baseline parameters.';

  return {
    phcSummary,
    overallStatus,
    confidenceScore: patientForecast.confidencePercent,
    freshnessGrade: 'High',
    topRisks,
    predictions: {
      medicineRisk,
      patientFootfallTomorrow: patientForecast.tomorrowForecast,
      patientFootfallNext7Days: patientForecast.next7DaysForecast,
      patientFootfallNext30Days: patientForecast.next30DaysForecast,
      bedOccupancyTomorrowPercent: projectedOccupancyPercent,
      diseaseRisk,
      diseaseHighlight: `${diseaseAnalysis.currentFever} cases recorded (${diseaseAnalysis.feverPercentChange >= 0 ? '+' : ''}${diseaseAnalysis.feverPercentChange}%)`,
    },
    recommendedActions,
    generatedAt: new Date().toISOString(),
  };
}
