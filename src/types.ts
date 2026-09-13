export type ProfessionalProfile = 'psicologo' | 'psiquiatra';

export type NavigationTab = 
  | 'consultorio' 
  | 'agenda' 
  | 'pacientes' 
  | 'telemedicina' 
  | 'documentos' 
  | 'escalas' 
  | 'financeiro' 
  | 'consultorios' 
  | 'planos';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'alegra';
  text: string;
  timestamp: string;
  profile: ProfessionalProfile;
  patientName?: string;
  isStructuredNote?: boolean;
  category?: 'evolucao' | 'farmaco' | 'psicodiagnostico' | 'gestao' | 'laudo' | 'risco_crise';
}

export interface Patient {
  id: string;
  name: string;
  cpf?: string;
  birthDate?: string;
  age: number;
  phone: string;
  email: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  profileType: ProfessionalProfile;
  diagnosisHypothesis: string;
  cid11?: string;
  dsm5?: string;
  medications?: string[];
  allergies?: string[];
  notesCRP?: string;
  riskAlert?: 'baixo' | 'moderado' | 'alto_risco' | 'estavel';
  status: 'ativo' | 'crise' | 'retorno' | 'alta';
  lastSessionDate: string;
  nextSessionDate?: string;
  photoUrl?: string;
  evolutions: ClinicalEvolution[];
  documents?: ClinicalDocument[];
  scaleAssessments?: ScaleAssessment[];
  consentSigned?: boolean;
}

export interface ClinicalEvolution {
  id: string;
  date: string;
  time: string;
  profile: ProfessionalProfile;
  title: string;
  content: string;
  professionalName: string;
  councilId: string; // CRP 06/148.920 ou CRM 152.480-SP
  sessionModality?: 'telemedicina' | 'presencial';
}

export type DocumentType = 
  | 'receita_controle_especial' // C1 Branca 2 vias (Antidepressivos, Antipsicóticos, Estabilizadores)
  | 'receita_b' // Notificação B Azul (Benzodiazepínicos)
  | 'receita_a' // Notificação A Amarela (Estimulantes/Metilfenidato/Lisdexanfetamina)
  | 'receita_simples'
  | 'atestado_medico'
  | 'atestado_psicologico'
  | 'relatorio_psicologico'
  | 'laudo_psicologico'
  | 'declaracao_comparecimento'
  | 'encaminhamento';

export interface PrescribedMedication {
  name: string;
  dosage: string;
  posology: string; // ex: 1 comprimido pela manhã após café
  quantity: string; // ex: 2 caixas (60 comprimidos)
  instructions?: string;
}

export interface ClinicalDocument {
  id: string;
  patientId: string;
  patientName: string;
  patientCpf?: string;
  type: DocumentType;
  title: string;
  date: string;
  content: string;
  medications?: PrescribedMedication[];
  cid11?: string;
  daysOfRest?: number;
  professionalName: string;
  councilNumber: string;
  rqe?: string;
  verificationHash: string;
  status: 'emitido' | 'rascunho' | 'arquivado';
}

export type ScaleType = 'phq9' | 'gad7' | 'asrs18' | 'bdi2' | 'bai' | 'meem';

export interface ScaleAssessment {
  id: string;
  patientId: string;
  patientName: string;
  scaleType: ScaleType;
  date: string;
  score: number;
  maxScore: number;
  severityClassification: string;
  answers: Record<number, number>;
  aiClinicalInterpretation: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string; // Hoje, Amanhã, DD/MM/YYYY
  time: string; // HH:MM
  durationMinutes: number;
  modality: 'telemedicina' | 'presencial';
  locationName?: string; // ex: "Consultório Bela Vista - Sala 4" ou "Telemedicina HD E2EE"
  status: 'confirmado' | 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  value: number;
  googleEventId?: string;
  syncedToGoogleCalendar?: boolean;
}

export interface FinancialRecord {
  id: string;
  patientName: string;
  patientCpf?: string;
  date: string;
  amount: number;
  status: 'pago' | 'pendente';
  method: 'pix' | 'cartao' | 'convenio' | 'dinheiro';
  receiptNumber: string;
  description: string;
  deductibleIRPF?: boolean;
}

export interface OfficeSpace {
  id: string;
  name: string;
  type: 'fisico' | 'virtual';
  address: string;
  roomNumber?: string;
  hourlyRentalCost?: number;
  secretaryPhone?: string;
  wifiPassword?: string;
  operatingHours: string;
}

export interface ProfessionalData {
  name: string;
  role: 'Psicólogo Clínico' | 'Médico Psiquiatra';
  council: 'CRP' | 'CRM';
  councilNumber: string;
  rqe?: string;
  email: string;
  phone: string;
  clinicName: string;
  clinicAddress: string;
  pixKey: string;
}
