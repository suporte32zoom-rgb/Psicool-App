import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AlegraChat } from './components/AlegraChat';
import { TelemedicineVideo } from './components/TelemedicineVideo';
import { PlansAndPricing } from './components/PlansAndPricing';
import { CalendarAgenda } from './components/CalendarAgenda';
import { PatientsDirectory } from './components/PatientsDirectory';
import { FinancialDashboard } from './components/FinancialDashboard';
import { ClinicalDocuments } from './components/ClinicalDocuments';
import { PsychometricScales } from './components/PsychometricScales';
import { OfficeManager } from './components/OfficeManager';
import { 
  NavigationTab, 
  ProfessionalProfile, 
  Patient, 
  Appointment, 
  FinancialRecord, 
  ClinicalEvolution,
  ClinicalDocument,
  ScaleAssessment,
  OfficeSpace,
  ProfessionalData
} from './types';
import { 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_FINANCIAL,
  INITIAL_DOCUMENTS,
  INITIAL_SCALE_ASSESSMENTS,
  INITIAL_OFFICES,
  INITIAL_PROFESSIONAL
} from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('consultorio');
  const [profile, setProfile] = useState<ProfessionalProfile>(() => {
    const saved = localStorage.getItem('psicool_profile_type');
    return (saved as ProfessionalProfile) || 'psicologo';
  });

  // Commercial Free Usage Lock State (0 / 30 mensagens)
  const MAX_FREE_MESSAGES = 30;
  const [messageCount, setMessageCount] = useState<number>(() => {
    const saved = localStorage.getItem('psicool_message_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Clinical Workspace Entities with Real LocalStorage Persistence
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('psicool_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('psicool_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('psicool_financial');
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL;
  });

  const [documents, setDocuments] = useState<ClinicalDocument[]>(() => {
    const saved = localStorage.getItem('psicool_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [scaleAssessments, setScaleAssessments] = useState<ScaleAssessment[]>(() => {
    const saved = localStorage.getItem('psicool_scale_assessments');
    return saved ? JSON.parse(saved) : INITIAL_SCALE_ASSESSMENTS;
  });

  const [offices, setOffices] = useState<OfficeSpace[]>(() => {
    const saved = localStorage.getItem('psicool_offices');
    return saved ? JSON.parse(saved) : INITIAL_OFFICES;
  });

  const [professionalData, setProfessionalData] = useState<ProfessionalData>(() => {
    const saved = localStorage.getItem('psicool_professional_data');
    return saved ? JSON.parse(saved) : INITIAL_PROFESSIONAL;
  });

  // Persist all real user changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('psicool_profile_type', profile);
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('psicool_message_count', messageCount.toString());
  }, [messageCount]);

  useEffect(() => {
    localStorage.setItem('psicool_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('psicool_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('psicool_financial', JSON.stringify(financialRecords));
  }, [financialRecords]);

  useEffect(() => {
    localStorage.setItem('psicool_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('psicool_scale_assessments', JSON.stringify(scaleAssessments));
  }, [scaleAssessments]);

  useEffect(() => {
    localStorage.setItem('psicool_offices', JSON.stringify(offices));
  }, [offices]);

  useEffect(() => {
    localStorage.setItem('psicool_professional_data', JSON.stringify(professionalData));
  }, [professionalData]);

  // Cross-component prompt bridge
  const [bridgedPrompt, setBridgedPrompt] = useState<string>('');

  // Deep Navigation Triggers for Direct Menu Clicks
  const [targetDocType, setTargetDocType] = useState<ClinicalDocument['type'] | null>(null);
  const [triggerNewDoc, setTriggerNewDoc] = useState(false);

  const [targetScaleType, setTargetScaleType] = useState<ScaleAssessment['scaleType'] | null>(null);
  const [triggerNewScale, setTriggerNewScale] = useState(false);

  const [targetOfficeTab, setTargetOfficeTab] = useState<'locais' | 'tcle_contratos' | 'dados_profissional' | null>(null);
  const [triggerNewFinancialRecord, setTriggerNewFinancialRecord] = useState(false);

  const incrementMessageCount = () => {
    setMessageCount((prev) => Math.min(MAX_FREE_MESSAGES, prev + 1));
  };

  const handleSelectSubAction = (category: NavigationTab, subAction?: string) => {
    setActiveTab(category);

    if (category === 'documentos') {
      if (subAction && (subAction.startsWith('receita_') || subAction === 'atestado_medico' || subAction === 'laudo_psicologico' || subAction === 'declaracao_comparecimento')) {
        setTargetDocType(subAction as ClinicalDocument['type']);
        setTriggerNewDoc(true);
      }
    } else if (category === 'escalas') {
      if (subAction && ['phq9', 'gad7', 'asrs18', 'bdi2', 'bai', 'meem'].includes(subAction)) {
        setTargetScaleType(subAction as ScaleAssessment['scaleType']);
        setTriggerNewScale(true);
      }
    } else if (category === 'consultorios') {
      if (subAction === 'locais') setTargetOfficeTab('locais');
      else if (subAction === 'tcle' || subAction === 'contrato') setTargetOfficeTab('tcle_contratos');
      else if (subAction === 'dados') setTargetOfficeTab('dados_profissional');
    } else if (category === 'financeiro') {
      if (subAction === 'novo_recibo') {
        setTriggerNewFinancialRecord(true);
      }
    } else if (category === 'consultorio') {
      if (subAction === 'risco') {
        setBridgedPrompt('Por favor, me ajude a conduzir uma avaliação de Risco Autolítico segundo a Escala Columbia (C-SSRS) e estruturar o Plano de Segurança.');
      } else if (subAction === 'farmaco') {
        setBridgedPrompt('Gostaria de avaliar uma conduta psicofarmacológica: titulação, interações medicamentosas e monitoramento laboratorial.');
      } else if (subAction === 'ditado') {
        setBridgedPrompt('Por favor, formate as seguintes anotações clínicas no padrão oficial de Evolução do CFP 01/2009 / CFM: ');
      }
    }
  };

  const handleSaveEvolutionToPatient = (patientId: string, evolution: ClinicalEvolution) => {
    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id === patientId) {
          return {
            ...pat,
            evolutions: [evolution, ...pat.evolutions],
            lastSessionDate: 'Hoje',
          };
        }
        return pat;
      })
    );
  };

  const handleStartTelemedicine = (patientId: string) => {
    setActiveTab('telemedicina');
  };

  const handleSelectPatientForChat = (patientId: string) => {
    setActiveTab('consultorio');
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
  };

  const handleAddAppointment = (newAppointment: Appointment) => {
    setAppointments((prev) => [newAppointment, ...prev]);
  };

  const handleUpdateAppointmentStatus = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt))
    );
  };

  const handleUpdateAppointment = (updatedApt: Appointment) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === updatedApt.id ? updatedApt : apt))
    );
  };

  const handleAddFinancialRecord = (newRecord: FinancialRecord) => {
    setFinancialRecords((prev) => [newRecord, ...prev]);
  };

  const handleAddDocument = (newDoc: ClinicalDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleSaveScaleAssessment = (newAssessment: ScaleAssessment) => {
    setScaleAssessments((prev) => [newAssessment, ...prev]);
  };

  const handleAddOffice = (newOffice: OfficeSpace) => {
    setOffices((prev) => [newOffice, ...prev]);
  };

  const handleUpdateProfessional = (data: ProfessionalData) => {
    setProfessionalData(data);
  };

  const handlePlanSelected = (plan: 'mensal' | 'anual') => {
    setMessageCount(0);
  };

  return (
    <div className="min-h-screen bg-[#0b0616] text-slate-100 flex flex-col selection:bg-[#ff007f] selection:text-white">
      
      {/* Responsive Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        setProfile={setProfile}
        messageCount={messageCount}
        maxMessages={MAX_FREE_MESSAGES}
        onSelectSubAction={handleSelectSubAction}
      />

      {/* Main Clinical Viewport */}
      <main className="flex-1 w-full relative">
        {activeTab === 'consultorio' && (
          <AlegraChat
            profile={profile}
            setProfile={setProfile}
            messageCount={messageCount}
            maxMessages={MAX_FREE_MESSAGES}
            incrementMessageCount={incrementMessageCount}
            onUpgradeClick={() => setActiveTab('planos')}
            patients={patients}
            onSaveEvolutionToPatient={handleSaveEvolutionToPatient}
            initialPrompt={bridgedPrompt}
            onInitialPromptConsumed={() => setBridgedPrompt('')}
          />
        )}

        {activeTab === 'telemedicina' && (
          <TelemedicineVideo
            patients={patients}
            profile={profile}
            onSaveEvolutionToPatient={handleSaveEvolutionToPatient}
            onNavigateToChatWithPrompt={(prompt) => {
              setBridgedPrompt(prompt);
              setActiveTab('consultorio');
            }}
          />
        )}

        {activeTab === 'agenda' && (
          <CalendarAgenda
            appointments={appointments}
            patients={patients}
            onStartTelemedicine={handleStartTelemedicine}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onUpdateAppointment={handleUpdateAppointment}
          />
        )}

        {activeTab === 'pacientes' && (
          <PatientsDirectory
            patients={patients}
            profile={profile}
            appointments={appointments}
            scaleAssessments={scaleAssessments}
            documents={documents}
            onSelectPatientForChat={handleSelectPatientForChat}
            onStartTelemedicine={handleStartTelemedicine}
            onAddPatient={handleAddPatient}
            onAddAppointment={handleAddAppointment}
            onNavigateToTab={(tab, subAction) => handleSelectSubAction(tab, subAction)}
            onUpdatePatient={(updatedPatient) => {
              setPatients((prev) => prev.map((p) => p.id === updatedPatient.id ? updatedPatient : p));
            }}
          />
        )}

        {activeTab === 'documentos' && (
          <ClinicalDocuments
            documents={documents}
            patients={patients}
            profile={profile}
            professional={professionalData}
            onAddDocument={handleAddDocument}
            initialDocType={targetDocType}
            triggerOpenNew={triggerNewDoc}
            onClearTrigger={() => {
              setTargetDocType(null);
              setTriggerNewDoc(false);
            }}
          />
        )}

        {activeTab === 'escalas' && (
          <PsychometricScales
            assessments={scaleAssessments}
            patients={patients}
            profile={profile}
            professional={professionalData}
            onSaveAssessment={handleSaveScaleAssessment}
            initialScaleType={targetScaleType}
            triggerOpenScale={triggerNewScale}
            onClearTrigger={() => {
              setTargetScaleType(null);
              setTriggerNewScale(false);
            }}
          />
        )}

        {activeTab === 'consultorios' && (
          <OfficeManager
            offices={offices}
            professional={professionalData}
            profile={profile}
            patients={patients}
            onUpdateProfessional={handleUpdateProfessional}
            onAddOffice={handleAddOffice}
            initialSubTab={targetOfficeTab}
            onClearTrigger={() => setTargetOfficeTab(null)}
          />
        )}

        {activeTab === 'financeiro' && (
          <FinancialDashboard
            records={financialRecords}
            patients={patients}
            profile={profile}
            professional={professionalData}
            onAddRecord={handleAddFinancialRecord}
            initialOpenNew={triggerNewFinancialRecord}
            onClearTrigger={() => setTriggerNewFinancialRecord(false)}
          />
        )}

        {activeTab === 'planos' && (
          <PlansAndPricing
            onPlanSelected={handlePlanSelected}
          />
        )}
      </main>

    </div>
  );
}
