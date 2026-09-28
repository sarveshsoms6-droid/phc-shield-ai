import { useState, useEffect } from 'react';
import {
  PHCAppState,
  AppMode,
  MedicineItem,
  PatientDailyEntry,
  BedStatus,
  StaffAvailabilityData,
  DiseaseSurveillanceEntry,
  EquipmentItem,
  EmergencyReadiness,
  ExternalEvent,
  BulkDataQualityReport,
  AICopilotMessage,
  AIIntelligenceReport,
  PHCBasicInfo,
} from './types';
import {
  getInitialDemoState,
  getInitialLiveState,
  DEMO_REDISTRIBUTION_PROPOSALS,
} from './data/phcData';
import { generateHeuristicIntelligenceReport } from './utils/phcCalculations';

// Components
import { PrivacyBanner } from './components/PrivacyBanner';
import { Header } from './components/Header';
import { WorkflowStepsBar } from './components/WorkflowStepsBar';
import { BasicInfoSection } from './components/BasicInfoSection';
import { MedicineSection } from './components/MedicineSection';
import { PatientSection } from './components/PatientSection';
import { BedSection } from './components/BedSection';
import { StaffSection } from './components/StaffSection';
import { DiseaseSection } from './components/DiseaseSection';
import { EquipmentSection } from './components/EquipmentSection';
import { EmergencySection } from './components/EmergencySection';
import { BulkUploadSection } from './components/BulkUploadSection';
import { ExternalEventsSection } from './components/ExternalEventsSection';
import { AIAnalysisDashboard } from './components/AIAnalysisDashboard';
import { CopilotChat } from './components/CopilotChat';

import {
  Inbox,
  Sparkles,
  MessageSquare,
  Building2,
  Pill,
  Users,
  Bed,
  UserCheck,
  Bug,
  Wrench,
  ShieldAlert,
  UploadCloud,
  CloudRain,
  CheckCircle2,
  Shield,
} from 'lucide-react';

type ActiveTab = 'input' | 'analysis' | 'copilot';
type InputCategory =
  | 'basic'
  | 'medicines'
  | 'patients'
  | 'beds'
  | 'staff'
  | 'diseases'
  | 'equipment'
  | 'emergency'
  | 'bulk'
  | 'events';

export default function App() {
  // Initialize state with demo data
  const [state, setState] = useState<PHCAppState>(() => {
    const saved = localStorage.getItem('phc_shield_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state, using demo', e);
      }
    }
    return getInitialDemoState();
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('input');
  const [activeInputCategory, setActiveInputCategory] = useState<InputCategory>('basic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Copilot messages state
  const [copilotMessages, setCopilotMessages] = useState<AICopilotMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Vanakkam! I am your PHC-SHIELD AI Operational Copilot for Primary Health Centres in Tamil Nadu.

I monitor inventory burn rates, bed occupancy forecasts, syndromic fever clusters, and emergency readiness. Ask me questions like:
• "How many days of Paracetamol stock do I have?"
• "Which disease cases are rising?"
• "What is my bed occupancy?"
• "What should I do today?"`,
      timestamp: new Date().toISOString(),
      groundingDataPoints: ['Live PHC Operational Register', 'Tamil Nadu District Health Hub'],
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem('phc_shield_state', JSON.stringify(state));
  }, [state]);

  // Handle Mode Toggle
  const handleModeToggle = (newMode: AppMode) => {
    if (newMode === state.mode) return;
    if (newMode === 'demo') {
      setState(getInitialDemoState());
    } else {
      // Check if there is saved live state
      setState(getInitialLiveState());
    }
    setActiveStep(1);
  };

  const handleResetData = () => {
    if (state.mode === 'demo') {
      setState(getInitialDemoState());
    } else {
      setState(getInitialLiveState());
    }
    setActiveStep(1);
  };

  // AI Analysis Trigger
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setActiveStep(4); // AI Analyze step

    try {
      const response = await fetch('/api/analyze-phc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phcData: state }),
      });

      const json = await response.json();
      let report: AIIntelligenceReport;

      if (!json.fallback && json.report && json.report.overallStatus) {
        report = {
          ...json.report,
          generatedAt: new Date().toISOString(),
        };
      } else {
        // Run heuristic analytical engine
        report = generateHeuristicIntelligenceReport(
          state.medicines,
          state.patientEntries,
          state.bedStatus,
          state.staff,
          state.diseaseSurveillance,
          state.emergency
        );
      }

      setState((prev) => ({
        ...prev,
        latestReport: report,
        historyOfReports: [report, ...(prev.historyOfReports || [])],
        redistributionProposals:
          prev.redistributionProposals.length > 0
            ? prev.redistributionProposals
            : DEMO_REDISTRIBUTION_PROPOSALS,
      }));

      setActiveTab('analysis');
      setActiveStep(8); // Recommend step
    } catch (err) {
      console.error('Analysis error, fallback triggered:', err);
      const fallbackReport = generateHeuristicIntelligenceReport(
        state.medicines,
        state.patientEntries,
        state.bedStatus,
        state.staff,
        state.diseaseSurveillance,
        state.emergency
      );
      setState((prev) => ({
        ...prev,
        latestReport: fallbackReport,
        historyOfReports: [fallbackReport, ...(prev.historyOfReports || [])],
      }));
      setActiveTab('analysis');
      setActiveStep(8);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copilot Message Sender
  const handleSendCopilotMessage = async (query: string) => {
    const userMsg: AICopilotMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setCopilotMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          phcData: state,
          conversationHistory: copilotMessages.slice(-4),
        }),
      });

      const data = await res.json();
      const aiReply: AICopilotMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || 'I have reviewed the operational registers for your facility.',
        timestamp: new Date().toISOString(),
        groundingDataPoints: data.groundedIn || ['PHC Operational State'],
      };
      setCopilotMessages((prev) => [...prev, aiReply]);
    } catch (e) {
      // Offline / Heuristic reply fallback
      const aiReply: AICopilotMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `Based on your live PHC data:
• Current bed occupancy is ${Math.round(
          (state.bedStatus.occupiedBeds / Math.max(1, state.bedStatus.totalBeds)) * 100
        )}% (${state.bedStatus.occupiedBeds}/${state.bedStatus.totalBeds} beds).
• Medicine reserves: ${state.medicines.length} tracked items.
• Staff availability: ${Math.round(
          (state.staff.categories.reduce((a, b) => a + b.availableToday, 0) /
            Math.max(1, state.staff.categories.reduce((a, b) => a + b.required, 0))) *
            100
        )}%.
Operational advice: Prioritize inventory replenishment for items under 4 days reserve and monitor fever cases.`,
        timestamp: new Date().toISOString(),
        groundingDataPoints: ['Local Facility Register Cache'],
      };
      setCopilotMessages((prev) => [...prev, aiReply]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // State Updaters for Data Input Sections
  const handleUpdateBasicInfo = (info: PHCBasicInfo) => {
    setState((prev) => ({ ...prev, basicInfo: info }));
    setActiveStep(3); // Save step
  };

  const handleAddMedicine = (item: MedicineItem) => {
    setState((prev) => ({ ...prev, medicines: [item, ...prev.medicines] }));
    setActiveStep(3);
  };

  const handleUpdateMedicine = (item: MedicineItem) => {
    setState((prev) => ({
      ...prev,
      medicines: prev.medicines.map((m) => (m.id === item.id ? item : m)),
    }));
    setActiveStep(3);
  };

  const handleDeleteMedicine = (id: string) => {
    setState((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((m) => m.id !== id),
    }));
  };

  const handleSaveDailyPatient = (entry: PatientDailyEntry) => {
    setState((prev) => ({
      ...prev,
      patientEntries: [...prev.patientEntries, entry],
    }));
    setActiveStep(3);
  };

  const handleUpdateBedStatus = (bedStatus: BedStatus) => {
    setState((prev) => ({ ...prev, bedStatus }));
    setActiveStep(3);
  };

  const handleUpdateStaff = (staff: StaffAvailabilityData) => {
    setState((prev) => ({ ...prev, staff }));
    setActiveStep(3);
  };

  const handleSubmitDiseaseData = (entry: DiseaseSurveillanceEntry) => {
    setState((prev) => ({
      ...prev,
      diseaseSurveillance: [...prev.diseaseSurveillance, entry],
    }));
    setActiveStep(3);
  };

  const handleAddEquipment = (eq: EquipmentItem) => {
    setState((prev) => ({ ...prev, equipments: [...prev.equipments, eq] }));
    setActiveStep(3);
  };

  const handleUpdateEquipment = (eq: EquipmentItem) => {
    setState((prev) => ({
      ...prev,
      equipments: prev.equipments.map((e) => (e.id === eq.id ? eq : e)),
    }));
  };

  const handleDeleteEquipment = (id: string) => {
    setState((prev) => ({
      ...prev,
      equipments: prev.equipments.filter((e) => e.id !== id),
    }));
  };

  const handleUpdateEmergency = (emergency: EmergencyReadiness) => {
    setState((prev) => ({ ...prev, emergency }));
    setActiveStep(3);
  };

  const handleConfirmBulkData = (report: BulkDataQualityReport) => {
    // Process sample rows if available
    setActiveStep(3);
  };

  const handleAddExternalEvent = (event: ExternalEvent) => {
    setState((prev) => ({ ...prev, externalEvents: [event, ...prev.externalEvents] }));
    setActiveStep(3);
  };

  const handleToggleExternalEvent = (id: string) => {
    setState((prev) => ({
      ...prev,
      externalEvents: prev.externalEvents.map((e) =>
        e.id === id ? { ...e, active: !e.active } : e
      ),
    }));
  };

  // Human Approval Workflow for Proposals
  const handleApproveProposal = (id: string) => {
    setState((prev) => ({
      ...prev,
      redistributionProposals: prev.redistributionProposals.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'approved',
              decidedAt: new Date().toISOString(),
              decisionNotes: 'Approved by Medical Officer on Duty',
            }
          : p
      ),
    }));
    setActiveStep(10); // Record Decision step
  };

  const handleModifyProposal = (id: string, qty: number) => {
    setState((prev) => ({
      ...prev,
      redistributionProposals: prev.redistributionProposals.map((p) =>
        p.id === id
          ? {
              ...p,
              quantity: qty,
              status: 'modified',
              decidedAt: new Date().toISOString(),
              decisionNotes: `Modified transfer dispatch quantity to ${qty} units`,
            }
          : p
      ),
    }));
    setActiveStep(10);
  };

  const handleRejectProposal = (id: string, reason: string) => {
    setState((prev) => ({
      ...prev,
      redistributionProposals: prev.redistributionProposals.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'rejected',
              decidedAt: new Date().toISOString(),
              decisionNotes: reason,
            }
          : p
      ),
    }));
    setActiveStep(10);
  };

  // Action item approvals
  const handleApproveAction = (id: string) => {
    if (!state.latestReport) return;
    const updatedActions = state.latestReport.recommendedActions.map((a) =>
      a.id === id ? { ...a, status: 'approved' as const, decidedAt: new Date().toISOString() } : a
    );
    setState((prev) => ({
      ...prev,
      latestReport: prev.latestReport
        ? { ...prev.latestReport, recommendedActions: updatedActions }
        : null,
    }));
    setActiveStep(10);
  };

  const handleRejectAction = (id: string) => {
    if (!state.latestReport) return;
    const updatedActions = state.latestReport.recommendedActions.map((a) =>
      a.id === id ? { ...a, status: 'rejected' as const, decidedAt: new Date().toISOString() } : a
    );
    setState((prev) => ({
      ...prev,
      latestReport: prev.latestReport
        ? { ...prev.latestReport, recommendedActions: updatedActions }
        : null,
    }));
    setActiveStep(10);
  };

  const categoriesConfig: Array<{ id: InputCategory; label: string; icon: any }> = [
    { id: 'basic', label: '1. Basic Info', icon: Building2 },
    { id: 'medicines', label: '2. Medicine Stock', icon: Pill },
    { id: 'patients', label: '3. Patient Entry', icon: Users },
    { id: 'beds', label: '4. Bed Availability', icon: Bed },
    { id: 'staff', label: '5. Staff Attendance', icon: UserCheck },
    { id: 'diseases', label: '6. Disease Surveillance', icon: Bug },
    { id: 'equipment', label: '7. Medical Equipment', icon: Wrench },
    { id: 'emergency', label: '8. Emergency Readiness', icon: ShieldAlert },
    { id: 'bulk', label: '9. Bulk Upload', icon: UploadCloud },
    { id: 'events', label: '10. External Events', icon: CloudRain },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Privacy First Disclaimer Notice */}
      <PrivacyBanner />

      {/* Main App Header with Mode Switcher & Analysis Trigger */}
      <Header
        state={state}
        onModeToggle={handleModeToggle}
        onAnalyzeClick={handleRunAnalysis}
        onOpenChat={() => setActiveTab('copilot')}
        onResetData={handleResetData}
        isAnalyzing={isAnalyzing}
      />

      {/* 10-Step Operational Protocol Workflow Bar */}
      <WorkflowStepsBar
        currentStep={activeStep}
        onStepClick={(step) => {
          setActiveStep(step);
          if (step <= 3) setActiveTab('input');
          else if (step <= 8) {
            if (!state.latestReport) handleRunAnalysis();
            else setActiveTab('analysis');
          } else {
            setActiveTab('analysis');
          }
        }}
      />

      {/* Primary Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 sticky top-[73px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-2.5">
            <button
              type="button"
              id="tab-data-input"
              onClick={() => {
                setActiveTab('input');
                setActiveStep(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'input'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>📥 PHC DATA INPUT CENTRE</span>
            </button>

            <button
              type="button"
              id="tab-ai-analysis"
              onClick={() => {
                if (!state.latestReport) {
                  handleRunAnalysis();
                } else {
                  setActiveTab('analysis');
                  setActiveStep(7);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'analysis'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>🤖 AI OPERATIONAL DIAGNOSTIC</span>
              {state.latestReport && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>

            <button
              type="button"
              id="tab-copilot-chat"
              onClick={() => setActiveTab('copilot')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'copilot'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>💬 AI COPILOT INTERACTION</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* VIEW 1: DATA INPUT CENTRE */}
        {activeTab === 'input' && (
          <div className="space-y-6">
            {/* Horizontal Subcategory Selector Pills */}
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto">
              {categoriesConfig.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeInputCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveInputCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Input Module Content */}
            {activeInputCategory === 'basic' && (
              <BasicInfoSection
                info={state.basicInfo}
                onUpdateBasicInfo={handleUpdateBasicInfo}
              />
            )}

            {activeInputCategory === 'medicines' && (
              <MedicineSection
                medicines={state.medicines}
                onAddMedicine={handleAddMedicine}
                onUpdateMedicine={handleUpdateMedicine}
                onDeleteMedicine={handleDeleteMedicine}
              />
            )}

            {activeInputCategory === 'patients' && (
              <PatientSection
                entries={state.patientEntries}
                onSaveDailyEntry={handleSaveDailyPatient}
              />
            )}

            {activeInputCategory === 'beds' && (
              <BedSection
                bedStatus={state.bedStatus}
                onUpdateBedStatus={handleUpdateBedStatus}
              />
            )}

            {activeInputCategory === 'staff' && (
              <StaffSection staffData={state.staff} onUpdateStaff={handleUpdateStaff} />
            )}

            {activeInputCategory === 'diseases' && (
              <DiseaseSection
                surveillanceEntries={state.diseaseSurveillance}
                onSubmitDiseaseData={handleSubmitDiseaseData}
              />
            )}

            {activeInputCategory === 'equipment' && (
              <EquipmentSection
                equipments={state.equipments}
                onAddEquipment={handleAddEquipment}
                onUpdateEquipment={handleUpdateEquipment}
                onDeleteEquipment={handleDeleteEquipment}
              />
            )}

            {activeInputCategory === 'emergency' && (
              <EmergencySection
                emergency={state.emergency}
                onUpdateEmergency={handleUpdateEmergency}
              />
            )}

            {activeInputCategory === 'bulk' && (
              <BulkUploadSection onConfirmBulkData={handleConfirmBulkData} />
            )}

            {activeInputCategory === 'events' && (
              <ExternalEventsSection
                events={state.externalEvents}
                onAddEvent={handleAddExternalEvent}
                onToggleActive={handleToggleExternalEvent}
              />
            )}

            {/* Quick Next Module / Run Analysis Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>
                  Finished entering data? The AI Copilot can analyze current stock, disease surge, and staffing.
                </span>
              </div>
              <button
                type="button"
                id="btn-analyze-bottom"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>{isAnalyzing ? 'Analyzing Registers...' : 'ANALYZE MY PHC'}</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: AI OPERATIONAL DIAGNOSTIC & DECISION SUPPORT */}
        {activeTab === 'analysis' && (
          <div>
            {!state.latestReport ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-4 shadow-xs">
                <Sparkles className="w-12 h-12 text-blue-600 mx-auto animate-pulse" />
                <h3 className="text-lg font-bold text-slate-900">
                  Ready to Synthesize Operational Records
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Click below to evaluate stockout risks, disease trajectory momentum, bed saturation, and generate inter-PHC redistribution proposals.
                </p>
                <button
                  type="button"
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-2.5 rounded-lg font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 cursor-pointer transition-all"
                >
                  {isAnalyzing ? 'Analyzing PHC Data...' : 'ANALYZE MY PHC'}
                </button>
              </div>
            ) : (
              <AIAnalysisDashboard
                report={state.latestReport}
                phcState={state}
                isAnalyzing={isAnalyzing}
                onReAnalyze={handleRunAnalysis}
                onApproveProposal={handleApproveProposal}
                onModifyProposal={handleModifyProposal}
                onRejectProposal={handleRejectProposal}
                onApproveAction={handleApproveAction}
                onRejectAction={handleRejectAction}
              />
            )}
          </div>
        )}

        {/* VIEW 3: AI COPILOT CHAT */}
        {activeTab === 'copilot' && (
          <CopilotChat
            data={state}
            messages={copilotMessages}
            onSendMessage={handleSendCopilotMessage}
            isLoading={isChatLoading}
          />
        )}
      </main>

      {/* Footer matching Professional Polish theme */}
      <footer className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-[11px] font-bold text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Shield className="w-3.5 h-3.5 text-blue-600" /> Privacy-First Healthcare AI
            </span>
            <span>District: {state.basicInfo.district}</span>
            <span>User: Medical Officer (PHC Admin)</span>
          </div>
          <div className="flex gap-2 items-center uppercase tracking-wider text-[10px]">
            <span className="text-blue-600 font-bold">AI PREDICTIONS ARE OPERATIONAL ESTIMATES</span>
            <span className="text-slate-300">|</span>
            <span>v1.0.4-SHIELD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
