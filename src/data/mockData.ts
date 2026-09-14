import { 
  Patient, 
  Appointment, 
  FinancialRecord, 
  ClinicalDocument, 
  ScaleAssessment, 
  OfficeSpace, 
  ProfessionalData 
} from '../types';

/**
 * Clean production initial state without fictional or dummy records.
 * Real data is created by the healthcare professional and persisted in local storage.
 */

export const INITIAL_PROFESSIONAL: ProfessionalData = {
  name: '',
  role: 'Psicólogo Clínico',
  council: 'CRP',
  councilNumber: '',
  rqe: '',
  email: '',
  phone: '',
  clinicName: '',
  clinicAddress: '',
  pixKey: ''
};

export const INITIAL_OFFICES: OfficeSpace[] = [];

export const INITIAL_DOCUMENTS: ClinicalDocument[] = [];

export const INITIAL_SCALE_ASSESSMENTS: ScaleAssessment[] = [];

export const INITIAL_PATIENTS: Patient[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_FINANCIAL: FinancialRecord[] = [];
