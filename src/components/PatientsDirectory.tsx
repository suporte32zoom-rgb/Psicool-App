import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  FileText, 
  Video, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Pill, 
  UserCheck, 
  Activity,
  ChevronRight,
  Brain,
  UserPlus,
  Clock,
  AlertTriangle,
  TrendingUp,
  ClipboardList,
  CheckCircle2,
  CalendarPlus,
  Stethoscope,
  BadgeAlert,
  ArrowUpRight,
  BarChart3,
  ExternalLink,
  ShieldAlert,
  Edit3,
  X,
  FileCheck
} from 'lucide-react';
import { 
  Patient, 
  ClinicalEvolution, 
  ProfessionalProfile, 
  Appointment, 
  ScaleAssessment, 
  ClinicalDocument,
  NavigationTab
} from '../types';

interface PatientsDirectoryProps {
  patients: Patient[];
  profile: ProfessionalProfile;
  appointments?: Appointment[];
  scaleAssessments?: ScaleAssessment[];
  documents?: ClinicalDocument[];
  onSelectPatientForChat: (patientId: string) => void;
  onStartTelemedicine: (patientId: string) => void;
  onAddPatient: (patient: Patient) => void;
  onAddAppointment?: (appointment: Appointment) => void;
  onNavigateToTab?: (tab: NavigationTab, subAction?: string) => void;
  onUpdatePatient?: (patient: Patient) => void;
}

export const PatientsDirectory: React.FC<PatientsDirectoryProps> = ({
  patients,
  profile,
  appointments = [],
  scaleAssessments = [],
  documents = [],
  onSelectPatientForChat,
  onStartTelemedicine,
  onAddPatient,
  onAddAppointment,
  onNavigateToTab,
  onUpdatePatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'crise' | 'retorno' | 'alta'>('todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuickAptModal, setShowQuickAptModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'evolutions' | 'scales' | 'documents' | 'records'>('overview');

  // New patient state (clean initial inputs)
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState<number | ''>('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCpf, setNewCpf] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newCid11, setNewCid11] = useState('');
  const [newMeds, setNewMeds] = useState('');
  const [newEmergencyName, setNewEmergencyName] = useState('');
  const [newEmergencyPhone, setNewEmergencyPhone] = useState('');
  const [newRiskAlert, setNewRiskAlert] = useState<'baixo' | 'moderado' | 'alto_risco' | 'estavel'>('estavel');

  // Quick Appointment state
  const [aptDate, setAptDate] = useState('Hoje');
  const [aptTime, setAptTime] = useState('14:00');
  const [aptModality, setAptModality] = useState<'telemedicina' | 'presencial'>('telemedicina');
  const [aptValue, setAptValue] = useState(280);

  // Keep selected patient in sync with available patients
  useEffect(() => {
    if (patients.length > 0 && !patients.some((p) => p.id === selectedPatientId)) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

  // Filtered lists for the selected patient
  const patientAppointments = appointments.filter((apt) => 
    selectedPatient && (
      apt.patientId === selectedPatient.id || 
      apt.patientName.toLowerCase().trim() === selectedPatient.name.toLowerCase().trim()
    )
  );

  const patientScales = scaleAssessments.filter((sc) => 
    selectedPatient && (
      sc.patientId === selectedPatient.id || 
      sc.patientName.toLowerCase().trim() === selectedPatient.name.toLowerCase().trim()
    )
  );

  const patientDocuments = documents.filter((doc) => 
    selectedPatient && (
      doc.patientId === selectedPatient.id || 
      doc.patientName.toLowerCase().trim() === selectedPatient.name.toLowerCase().trim()
    )
  );

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.diagnosisHypothesis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.cid11 && p.cid11.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPat: Patient = {
      id: `p-${Date.now()}`,
      name: newName.trim(),
      cpf: newCpf.trim() || undefined,
      age: Number(newAge) || 30,
      phone: newPhone.trim() || '(11) 90000-0000',
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      profileType: profile,
      diagnosisHypothesis: newDiagnosis.trim() || 'Em avaliação clínica inicial',
      cid11: newCid11.trim() || undefined,
      medications: newMeds ? newMeds.split(',').map((s) => s.trim()).filter(Boolean) : [],
      riskAlert: newRiskAlert,
      emergencyContact: newEmergencyName ? {
        name: newEmergencyName.trim(),
        relationship: 'Familiar / Contato',
        phone: newEmergencyPhone.trim() || '(11) 99999-9999'
      } : undefined,
      status: 'ativo',
      lastSessionDate: 'Hoje',
      evolutions: [],
    };

    onAddPatient(newPat);
    setSelectedPatientId(newPat.id);
    setShowAddModal(false);

    // Reset fields
    setNewName('');
    setNewAge('');
    setNewPhone('');
    setNewEmail('');
    setNewCpf('');
    setNewDiagnosis('');
    setNewCid11('');
    setNewMeds('');
    setNewEmergencyName('');
    setNewEmergencyPhone('');
    setNewRiskAlert('estavel');
  };

  const handleQuickCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientPhone: selectedPatient.phone,
      date: aptDate,
      time: aptTime,
      durationMinutes: 50,
      modality: aptModality,
      status: 'confirmado',
      value: Number(aptValue),
    };

    if (onAddAppointment) {
      onAddAppointment(newApt);
    }
    setShowQuickAptModal(false);
  };

  const handleUpdateStatus = (newStatus: Patient['status']) => {
    if (!selectedPatient || !onUpdatePatient) return;
    const updated = { ...selectedPatient, status: newStatus };
    onUpdatePatient(updated);
  };

  const handleUpdateRisk = (newRisk: Patient['riskAlert']) => {
    if (!selectedPatient || !onUpdatePatient) return;
    const updated = { ...selectedPatient, riskAlert: newRisk };
    onUpdatePatient(updated);
  };

  const getRiskBadge = (risk?: Patient['riskAlert']) => {
    switch (risk) {
      case 'alto_risco':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-700 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Alto Risco / Atenção
          </span>
        );
      case 'moderado':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-700">
            <Activity className="w-3 h-3" />
            Risco Moderado
          </span>
        );
      case 'baixo':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700">
            <ShieldCheck className="w-3 h-3" />
            Baixo Risco
          </span>
        );
      case 'estavel':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/60">
            <CheckCircle2 className="w-3 h-3 text-[#bf5af2]" />
            Quadro Estável
          </span>
        );
    }
  };

  const getStatusBadge = (status: Patient['status']) => {
    switch (status) {
      case 'crise':
        return (
          <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-rose-950 text-rose-400 border border-rose-800 animate-pulse">
            Em Crise
          </span>
        );
      case 'retorno':
        return (
          <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
            Retorno
          </span>
        );
      case 'alta':
        return (
          <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
            Alta Clínica
          </span>
        );
      case 'ativo':
      default:
        return (
          <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800">
            Ativo
          </span>
        );
    }
  };

  const getScaleColor = (severity: string) => {
    const s = severity.toLowerCase();
    if (s.includes('grave') || s.includes('sever') || s.includes('alta probabilidade') || s.includes('declínio')) {
      return 'text-rose-400 bg-rose-950/70 border-rose-800';
    }
    if (s.includes('moderada') || s.includes('moderado')) {
      return 'text-amber-400 bg-amber-950/70 border-amber-800';
    }
    if (s.includes('leve') || s.includes('mínim') || s.includes('sem indício') || s.includes('preservada')) {
      return 'text-emerald-400 bg-emerald-950/70 border-emerald-800';
    }
    return 'text-[#bf5af2] bg-purple-950/70 border-purple-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-[#120b24] border border-[#2a1b4e] shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#bf5af2] uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Prontuário Eletrônico & Gestão Clínica (CFP / CFM)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Meus Pacientes & Fichas Clínicas
          </h1>
          <p className="text-xs text-purple-300/70">
            Visão Geral integrada 360°, histórico clínico, agendamentos e escalas psicométricas em um único painel.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,0,127,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Paciente</span>
        </button>
      </div>

      {/* Main Split View: Left Patient List, Right Detailed Record with Patient Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Search & Patient List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, queixa ou CID-11..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#120b24] border border-[#2a1b4e] focus:border-[#bf5af2] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-purple-400/50 focus:outline-none"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
            {(['todos', 'ativo', 'crise', 'retorno', 'alta'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl capitalize font-semibold transition-all shrink-0 ${
                  statusFilter === st
                    ? 'bg-[#bf5af2] text-white shadow-[0_0_10px_rgba(191,90,242,0.4)]'
                    : 'bg-[#120b24] text-purple-300/70 hover:text-white border border-[#2a1b4e]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Patient Cards List */}
          {filteredPatients.length > 0 ? (
            <div className="space-y-2.5 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
              {filteredPatients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                const initials = p.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
                const patApts = appointments.filter((a) => a.patientId === p.id || a.patientName.toLowerCase() === p.name.toLowerCase());
                const patScales = scaleAssessments.filter((s) => s.patientId === p.id || s.patientName.toLowerCase() === p.name.toLowerCase());

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#180e2e] border-[#bf5af2] shadow-[0_0_15px_rgba(191,90,242,0.2)]'
                        : 'bg-[#120b24] border-[#2a1b4e] hover:border-[#bf5af2]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {p.photoUrl ? (
                        <img
                          src={p.photoUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#2a1b4e]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#2a1b4e] border border-[#bf5af2]/40 text-[#bf5af2] font-bold text-xs flex items-center justify-center shrink-0">
                          {initials || 'P'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="truncate">{p.name}</span>
                          {getStatusBadge(p.status)}
                        </div>
                        <div className="text-[11px] text-purple-300/70 truncate max-w-[170px] mt-0.5">
                          {p.diagnosisHypothesis}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-purple-400/60 font-medium">
                          <span>{p.evolutions?.length || 0} evoluções</span>
                          {patApts.length > 0 && <span>• {patApts.length} consultas</span>}
                          {patScales.length > 0 && <span>• {patScales.length} escalas</span>}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#ff007f]' : 'text-purple-400/40'}`} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#120b24] border border-[#2a1b4e] text-center space-y-3">
              <Users className="w-10 h-10 text-purple-400/40 mx-auto" />
              <div>
                <p className="text-sm font-bold text-white">Nenhum paciente encontrado</p>
                <p className="text-xs text-purple-300/60 mt-1">
                  {searchTerm ? 'Tente buscar com outro termo.' : 'Cadastre seus pacientes reais para gerenciar prontuários.'}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#bf5af2]/20 hover:bg-[#bf5af2]/30 border border-[#bf5af2]/50 text-[#bf5af2] text-xs font-semibold"
              >
                + Cadastrar Paciente
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Complete Clinical Record & 'Patient Overview' Panel (8 cols) */}
        <div className="lg:col-span-8">
          {selectedPatient ? (
            <div className="rounded-3xl bg-[#120b24] border border-[#2a1b4e] p-5 sm:p-6 space-y-6 shadow-xl">
              
              {/* Patient Profile Header & Quick CTAs */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-[#2a1b4e]">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#bf5af2] to-[#ff007f] p-0.5 shadow-[0_0_15px_rgba(191,90,242,0.3)] shrink-0">
                    <div className="w-full h-full rounded-[14px] bg-[#0b0616] flex items-center justify-center text-white font-bold text-lg">
                      {selectedPatient.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'P'}
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-white">
                        {selectedPatient.name}
                      </h2>
                      <span className="text-xs text-purple-300 font-normal">
                        ({selectedPatient.age} anos)
                      </span>
                      {getStatusBadge(selectedPatient.status)}
                      {getRiskBadge(selectedPatient.riskAlert)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-purple-300/70 mt-1">
                      <a 
                        href={`https://wa.me/55${selectedPatient.phone.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-[#25D366] transition-colors"
                      >
                        <Phone className="w-3 h-3 text-[#bf5af2]" />
                        {selectedPatient.phone}
                      </a>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#bf5af2]" />
                        {selectedPatient.email}
                      </span>
                      {selectedPatient.cid11 && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/50">
                            CID-11: {selectedPatient.cid11}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <button
                    onClick={() => setShowQuickAptModal(true)}
                    className="flex-1 lg:flex-none px-3 py-2 rounded-xl bg-[#0b0616] hover:bg-[#1a0f35] border border-[#2a1b4e] text-xs font-semibold text-purple-200 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[#bf5af2]" />
                    <span>Agendar</span>
                  </button>

                  <button
                    onClick={() => onSelectPatientForChat(selectedPatient.id)}
                    className="flex-1 lg:flex-none px-3 py-2 rounded-xl bg-[#0b0616] hover:bg-[#1a0f35] border border-[#2a1b4e] text-xs font-semibold text-purple-200 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Brain className="w-3.5 h-3.5 text-[#bf5af2]" />
                    <span>Alegra AI</span>
                  </button>

                  <button
                    onClick={() => onStartTelemedicine(selectedPatient.id)}
                    className="flex-1 lg:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-[0_0_12px_rgba(255,0,127,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Iniciar Sessão HD</span>
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-[#2a1b4e] pb-3 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveSubTab('overview')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    activeSubTab === 'overview'
                      ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-[0_0_10px_rgba(191,90,242,0.4)]'
                      : 'text-purple-300/70 hover:text-white bg-[#0b0616] border border-[#2a1b4e]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Visão Geral (Overview)</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('evolutions')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    activeSubTab === 'evolutions'
                      ? 'bg-[#bf5af2] text-white shadow-[0_0_10px_rgba(191,90,242,0.4)]'
                      : 'text-purple-300/70 hover:text-white bg-[#0b0616] border border-[#2a1b4e]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Evoluções ({selectedPatient.evolutions?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('scales')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    activeSubTab === 'scales'
                      ? 'bg-[#bf5af2] text-white shadow-[0_0_10px_rgba(191,90,242,0.4)]'
                      : 'text-purple-300/70 hover:text-white bg-[#0b0616] border border-[#2a1b4e]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Escalas ({patientScales.length})</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('documents')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    activeSubTab === 'documents'
                      ? 'bg-[#bf5af2] text-white shadow-[0_0_10px_rgba(191,90,242,0.4)]'
                      : 'text-purple-300/70 hover:text-white bg-[#0b0616] border border-[#2a1b4e]'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Documentos ({patientDocuments.length})</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('records')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    activeSubTab === 'records'
                      ? 'bg-[#bf5af2] text-white shadow-[0_0_10px_rgba(191,90,242,0.4)]'
                      : 'text-purple-300/70 hover:text-white bg-[#0b0616] border border-[#2a1b4e]'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Ficha Cadastral</span>
                </button>
              </div>

              {/* TAB 1: PATIENT OVERVIEW PANEL (Snapshot: Clinical History, Upcoming Appointments, Recent Psychometrics) */}
              {activeSubTab === 'overview' && (
                <div className="space-y-6">
                  
                  {/* Row 1: Clinical Snapshot Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Diagnostic Hypothesis Card */}
                    <div className="p-4 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-[#bf5af2]" />
                          Hipótese Diagnóstica
                        </span>
                        {selectedPatient.cid11 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-[#bf5af2] border border-purple-800">
                            {selectedPatient.cid11}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white leading-relaxed">
                        {selectedPatient.diagnosisHypothesis || 'Em avaliação clínica inicial'}
                      </p>
                      {selectedPatient.dsm5 && (
                        <p className="text-[11px] text-purple-300/70 font-mono">
                          DSM-5: {selectedPatient.dsm5}
                        </p>
                      )}
                    </div>

                    {/* Medications Card */}
                    <div className="p-4 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] space-y-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 flex items-center gap-1">
                        <Pill className="w-3 h-3 text-[#ff007f]" />
                        Psicofármacos em Uso
                      </span>
                      {selectedPatient.medications && selectedPatient.medications.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPatient.medications.map((med, idx) => (
                            <span 
                              key={idx} 
                              className="text-[11px] px-2 py-0.5 rounded-lg bg-[#1a0f35] text-purple-200 border border-[#3b2370] font-medium"
                            >
                              {med}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-purple-300/50 italic">
                          Nenhuma medicação informada.
                        </p>
                      )}
                    </div>

                    {/* Risk & Alerts Card with Quick Selector */}
                    <div className="p-4 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] space-y-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-400" />
                        Risco Clínico & Alertas
                      </span>
                      <div>
                        {getRiskBadge(selectedPatient.riskAlert)}
                      </div>
                      {selectedPatient.emergencyContact && (
                        <p className="text-[11px] text-purple-300/80">
                          <strong className="text-white">Emergência:</strong> {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.phone})
                        </p>
                      )}
                      {onUpdatePatient && (
                        <div className="pt-1 flex items-center gap-1 text-[10px]">
                          <span className="text-purple-400/60">Alterar risco:</span>
                          <select
                            value={selectedPatient.riskAlert || 'estavel'}
                            onChange={(e) => handleUpdateRisk(e.target.value as Patient['riskAlert'])}
                            className="bg-[#120b24] border border-[#2a1b4e] rounded px-1.5 py-0.5 text-purple-200 text-[10px]"
                          >
                            <option value="estavel">Estável</option>
                            <option value="baixo">Baixo</option>
                            <option value="moderado">Moderado</option>
                            <option value="alto_risco">Alto Risco</option>
                          </select>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Row 2: Upcoming Appointments Section */}
                  <div className="p-4 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#bf5af2]" />
                        <span>Próximos Agendamentos ({patientAppointments.length})</span>
                      </h3>
                      <button
                        onClick={() => setShowQuickAptModal(true)}
                        className="text-xs font-semibold text-[#bf5af2] hover:underline flex items-center gap-1"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>+ Agendar Consulta</span>
                      </button>
                    </div>

                    {patientAppointments.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {patientAppointments.map((apt) => {
                          const isTelemed = apt.modality === 'telemedicina';
                          return (
                            <div
                              key={apt.id}
                              className="p-3 rounded-xl bg-[#120b24] border border-[#2a1b4e] flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-[#bf5af2]" />
                                    {apt.date} às {apt.time}
                                  </span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                    apt.status === 'confirmado' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300'
                                  }`}>
                                    {apt.status}
                                  </span>
                                </div>
                                <div className="text-[11px] text-purple-300/70 flex items-center gap-2">
                                  <span>{isTelemed ? 'Telemedicina HD' : 'Presencial'}</span>
                                  <span>•</span>
                                  <span>R$ {apt.value?.toFixed(2)}</span>
                                </div>
                              </div>

                              {isTelemed && (
                                <button
                                  onClick={() => onStartTelemedicine(selectedPatient.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-[11px] font-bold shadow-md hover:brightness-110 flex items-center gap-1"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>Entrar</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-[#120b24] border border-[#2a1b4e]/60 text-center space-y-1.5">
                        <Calendar className="w-5 h-5 text-purple-400/40 mx-auto" />
                        <p className="text-xs text-purple-300/70">
                          Nenhum agendamento futuro registrado para este paciente.
                        </p>
                        <button
                          onClick={() => setShowQuickAptModal(true)}
                          className="text-xs font-semibold text-[#bf5af2] hover:underline"
                        >
                          Clique aqui para agendar uma consulta
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Recent Psychometric Test Results Section */}
                  <div className="p-4 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-[#bf5af2]" />
                        <span>Resultados de Escalas Psicométricas ({patientScales.length})</span>
                      </h3>
                      {onNavigateToTab && (
                        <button
                          onClick={() => onNavigateToTab('escalas')}
                          className="text-xs font-semibold text-[#bf5af2] hover:underline flex items-center gap-1"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>+ Aplicar Nova Escala</span>
                        </button>
                      )}
                    </div>

                    {patientScales.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {patientScales.map((sc) => (
                          <div
                            key={sc.id}
                            className="p-3.5 rounded-xl bg-[#120b24] border border-[#2a1b4e] space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white uppercase font-mono px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-[10px]">
                                  {sc.scaleType.toUpperCase()}
                                </span>
                                <span className="text-[11px] text-purple-300/70">{sc.date}</span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getScaleColor(sc.severityClassification)}`}>
                                {sc.severityClassification}
                              </span>
                            </div>

                            {/* Score progress indicator */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-purple-300/80">Escore Total:</span>
                                <span className="font-bold text-white">{sc.score} / {sc.maxScore} pontos</span>
                              </div>
                              <div className="w-full bg-[#0b0616] h-1.5 rounded-full overflow-hidden border border-[#2a1b4e]">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#bf5af2] to-[#ff007f] rounded-full"
                                  style={{ width: `${Math.min(100, Math.round((sc.score / sc.maxScore) * 100))}%` }}
                                />
                              </div>
                            </div>

                            {sc.aiClinicalInterpretation && (
                              <p className="text-[11px] text-purple-200/80 leading-relaxed bg-[#0b0616] p-2 rounded-lg border border-[#2a1b4e]/50 line-clamp-2">
                                <span className="font-semibold text-purple-400">Interpretação: </span>
                                {sc.aiClinicalInterpretation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-[#120b24] border border-[#2a1b4e]/60 text-center space-y-1.5">
                        <BarChart3 className="w-5 h-5 text-purple-400/40 mx-auto" />
                        <p className="text-xs text-purple-300/70">
                          Nenhuma avaliação psicométrica (PHQ-9, GAD-7, ASRS-18, etc.) registrada para este paciente.
                        </p>
                        {onNavigateToTab && (
                          <button
                            onClick={() => onNavigateToTab('escalas')}
                            className="text-xs font-semibold text-[#bf5af2] hover:underline"
                          >
                            Ir para o módulo de Escalas Psicométricas
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Row 4: Clinical History Snapshot (Recent Evolutions) */}
                  <div className="p-4 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#bf5af2]" />
                        <span>Histórico Clínico Recente ({selectedPatient.evolutions?.length || 0} evoluções)</span>
                      </h3>
                      <button
                        onClick={() => setActiveSubTab('evolutions')}
                        className="text-xs font-semibold text-[#bf5af2] hover:underline"
                      >
                        Ver todas as evoluções →
                      </button>
                    </div>

                    {selectedPatient.evolutions && selectedPatient.evolutions.length > 0 ? (
                      <div className="space-y-2.5">
                        {selectedPatient.evolutions.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className="p-3.5 rounded-xl bg-[#120b24] border border-[#2a1b4e] space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between text-purple-300/80 pb-1.5 border-b border-[#2a1b4e]/50">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#bf5af2]" />
                                {ev.date} {ev.time && `às ${ev.time}`}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#180e2e] text-[#bf5af2] border border-[#bf5af2]/30">
                                {ev.sessionModality === 'telemedicina' ? 'Telemedicina HD' : 'Presencial'} • CFP/CFM
                              </span>
                            </div>
                            <p className="text-slate-200 leading-relaxed text-[11px] line-clamp-3 whitespace-pre-line">
                              {ev.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-[#120b24] border border-[#2a1b4e]/60 text-center space-y-1.5">
                        <FileText className="w-5 h-5 text-purple-400/40 mx-auto" />
                        <p className="text-xs text-purple-300/70">
                          Nenhuma evolução clínica registrada ainda.
                        </p>
                        <button
                          onClick={() => onSelectPatientForChat(selectedPatient.id)}
                          className="text-xs font-semibold text-[#bf5af2] hover:underline"
                        >
                          Estruturar primeira evolução com a Alegra AI
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 2: DETAILED CLINICAL EVOLUTIONS */}
              {activeSubTab === 'evolutions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#bf5af2]" />
                      <span>Evoluções de Sessão ({selectedPatient.evolutions?.length || 0})</span>
                    </h3>
                    <button
                      onClick={() => onSelectPatientForChat(selectedPatient.id)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-md hover:brightness-110 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nova Evolução com Alegra AI</span>
                    </button>
                  </div>

                  {selectedPatient.evolutions && selectedPatient.evolutions.length > 0 ? (
                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                      {selectedPatient.evolutions.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-4 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between text-purple-300/80 pb-2 border-b border-[#2a1b4e]/50">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#bf5af2]" />
                              {ev.date} {ev.time && `às ${ev.time}`}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#180e2e] text-[#bf5af2] border border-[#bf5af2]/30">
                              {ev.sessionModality === 'telemedicina' ? 'Telemedicina HD' : 'Presencial'} • Padrão CFP/CFM
                            </span>
                          </div>
                          <p className="text-slate-200 leading-relaxed whitespace-pre-line text-xs">
                            {ev.content}
                          </p>
                          <div className="text-[10px] text-purple-400/70 pt-2 border-t border-[#2a1b4e]/30 flex items-center justify-between">
                            <span>Profissional: {ev.professionalName || 'Profissional Responsável'}</span>
                            <span>{ev.councilId || (profile === 'psicologo' ? 'CRP' : 'CRM')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] text-center space-y-2">
                      <FileText className="w-8 h-8 text-purple-400/40 mx-auto" />
                      <p className="text-xs text-purple-300/70">
                        Nenhuma evolução registrada para este paciente ainda.
                      </p>
                      <button
                        onClick={() => onSelectPatientForChat(selectedPatient.id)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-md"
                      >
                        Estruturar Primeira Evolução
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PSYCHOMETRIC SCALES */}
              {activeSubTab === 'scales' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-[#bf5af2]" />
                      <span>Avaliações e Testes Psicométricos ({patientScales.length})</span>
                    </h3>
                    {onNavigateToTab && (
                      <button
                        onClick={() => onNavigateToTab('escalas')}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-md hover:brightness-110 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Aplicar Nova Escala</span>
                      </button>
                    )}
                  </div>

                  {patientScales.length > 0 ? (
                    <div className="space-y-3">
                      {patientScales.map((sc) => (
                        <div
                          key={sc.id}
                          className="p-4 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white font-mono uppercase text-xs px-2 py-0.5 rounded bg-purple-950 border border-purple-800">
                                  {sc.scaleType.toUpperCase()}
                                </span>
                                <span className="font-semibold text-white">
                                  {sc.scaleType === 'phq9' && 'Questionário de Saúde do Paciente (Depressão)'}
                                  {sc.scaleType === 'gad7' && 'Escala de Ansiedade Generalizada'}
                                  {sc.scaleType === 'asrs18' && 'Escala de TDAH em Adultos'}
                                  {sc.scaleType === 'bdi2' && 'Inventário de Depressão de Beck'}
                                  {sc.scaleType === 'bai' && 'Inventário de Ansiedade de Beck'}
                                  {sc.scaleType === 'meem' && 'Mini Exame do Estado Mental'}
                                </span>
                              </div>
                              <span className="text-[11px] text-purple-300/70 mt-1 block">
                                Aplicado em: {sc.date}
                              </span>
                            </div>

                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getScaleColor(sc.severityClassification)}`}>
                              {sc.severityClassification}
                            </span>
                          </div>

                          <div className="bg-[#120b24] p-3 rounded-xl border border-[#2a1b4e] space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-purple-300">Pontuação Obtida:</span>
                              <span className="font-bold text-white">{sc.score} de {sc.maxScore} pontos</span>
                            </div>
                            <div className="w-full bg-[#0b0616] h-2 rounded-full overflow-hidden border border-[#2a1b4e]">
                              <div 
                                className="h-full bg-gradient-to-r from-[#bf5af2] to-[#ff007f] rounded-full"
                                style={{ width: `${Math.min(100, Math.round((sc.score / sc.maxScore) * 100))}%` }}
                              />
                            </div>
                          </div>

                          {sc.aiClinicalInterpretation && (
                            <div className="p-3 bg-[#120b24] rounded-xl border border-[#2a1b4e] space-y-1">
                              <span className="text-[10px] font-bold uppercase text-[#bf5af2]">
                                Síntese e Interpretação Clínica da IA:
                              </span>
                              <p className="text-slate-200 text-xs leading-relaxed">
                                {sc.aiClinicalInterpretation}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] text-center space-y-2">
                      <BarChart3 className="w-8 h-8 text-purple-400/40 mx-auto" />
                      <p className="text-xs text-purple-300/70">
                        Nenhuma avaliação psicométrica realizada para este paciente.
                      </p>
                      {onNavigateToTab && (
                        <button
                          onClick={() => onNavigateToTab('escalas')}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-md"
                        >
                          Ir para Escalas Psicométricas
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CLINICAL DOCUMENTS */}
              {activeSubTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-[#bf5af2]" />
                      <span>Documentos & Receitas Emitidos ({patientDocuments.length})</span>
                    </h3>
                    {onNavigateToTab && (
                      <button
                        onClick={() => onNavigateToTab('documentos')}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-md hover:brightness-110 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Novo Documento</span>
                      </button>
                    )}
                  </div>

                  {patientDocuments.length > 0 ? (
                    <div className="space-y-3">
                      {patientDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-white text-sm">{doc.title}</h4>
                              <p className="text-[11px] text-purple-300/70">Emitido em {doc.date}</p>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-[#bf5af2] border border-purple-800">
                              {doc.type}
                            </span>
                          </div>
                          <p className="text-slate-200 text-xs line-clamp-2">
                            {doc.content}
                          </p>
                          <div className="pt-2 border-t border-[#2a1b4e]/40 flex justify-between items-center text-[10px] text-purple-400/70 font-mono">
                            <span>Hash: {doc.verificationHash}</span>
                            <span>Assinatura Digital Válida</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] text-center space-y-2">
                      <Stethoscope className="w-8 h-8 text-purple-400/40 mx-auto" />
                      <p className="text-xs text-purple-300/70">
                        Nenhum documento ou receita emitido para este paciente ainda.
                      </p>
                      {onNavigateToTab && (
                        <button
                          onClick={() => onNavigateToTab('documentos')}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-md"
                        >
                          Emitir Documento Clínico
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: REGISTRATION & ANAMNESIS RECORD */}
              {activeSubTab === 'records' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#bf5af2]" />
                    <span>Ficha Cadastral Completa & Dados Pessoais</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#0b0616] rounded-xl border border-[#2a1b4e] space-y-1">
                      <span className="text-purple-400 font-bold uppercase text-[10px]">Nome Completo</span>
                      <p className="font-semibold text-white">{selectedPatient.name}</p>
                    </div>

                    <div className="p-3 bg-[#0b0616] rounded-xl border border-[#2a1b4e] space-y-1">
                      <span className="text-purple-400 font-bold uppercase text-[10px]">Idade</span>
                      <p className="font-semibold text-white">{selectedPatient.age} anos</p>
                    </div>

                    <div className="p-3 bg-[#0b0616] rounded-xl border border-[#2a1b4e] space-y-1">
                      <span className="text-purple-400 font-bold uppercase text-[10px]">WhatsApp / Telefone</span>
                      <p className="font-semibold text-white">{selectedPatient.phone}</p>
                    </div>

                    <div className="p-3 bg-[#0b0616] rounded-xl border border-[#2a1b4e] space-y-1">
                      <span className="text-purple-400 font-bold uppercase text-[10px]">E-mail</span>
                      <p className="font-semibold text-white">{selectedPatient.email}</p>
                    </div>

                    <div className="p-3 bg-[#0b0616] rounded-xl border border-[#2a1b4e] space-y-1">
                      <span className="text-purple-400 font-bold uppercase text-[10px]">Status do Tratamento</span>
                      <div className="pt-1">{getStatusBadge(selectedPatient.status)}</div>
                    </div>

                    <div className="p-3 bg-[#0b0616] rounded-xl border border-[#2a1b4e] space-y-1">
                      <span className="text-purple-400 font-bold uppercase text-[10px]">Classificação de Risco</span>
                      <div className="pt-1">{getRiskBadge(selectedPatient.riskAlert)}</div>
                    </div>

                    <div className="p-3 bg-[#0b0616] rounded-xl border border-[#2a1b4e] space-y-1 sm:col-span-2">
                      <span className="text-purple-400 font-bold uppercase text-[10px]">Contato de Emergência</span>
                      <p className="font-semibold text-white">
                        {selectedPatient.emergencyContact 
                          ? `${selectedPatient.emergencyContact.name} (${selectedPatient.emergencyContact.phone}) - ${selectedPatient.emergencyContact.relationship}`
                          : 'Não cadastrado'}
                      </p>
                    </div>

                    <div className="p-3 bg-[#0b0616] rounded-xl border border-[#2a1b4e] space-y-1 sm:col-span-2">
                      <span className="text-purple-400 font-bold uppercase text-[10px]">Notas de Sigilo / Observações</span>
                      <p className="text-slate-200 text-xs leading-relaxed">
                        {selectedPatient.notesCRP || 'Prontuário sob sigilo ético estrito conforme normas do Conselho Federal de Psicologia (CFP) e Medicina (CFM).'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="rounded-3xl bg-[#120b24] border border-[#2a1b4e] p-12 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#bf5af2]/20 to-[#ff007f]/20 border border-[#bf5af2]/40 flex items-center justify-center mx-auto text-[#bf5af2]">
                <UserPlus className="w-8 h-8" />
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="text-base font-bold text-white">Nenhum Paciente Selecionado</h3>
                <p className="text-xs text-purple-300/70 mt-1">
                  Cadastre seus pacientes reais para abrir o prontuário eletrônico seguro, emitir documentos, registrar evoluções e aplicar escalas.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,0,127,0.4)] hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Primeiro Paciente</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Quick Appointment Modal */}
      {showQuickAptModal && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#120b24] border border-[#bf5af2] p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-[#bf5af2]" />
                <span>Agendar para {selectedPatient.name}</span>
              </h3>
              <button 
                onClick={() => setShowQuickAptModal(false)}
                className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-[#1a0f35]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickCreateAppointment} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Data</label>
                  <input
                    type="text"
                    required
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    placeholder="Hoje ou DD/MM"
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#bf5af2]"
                  />
                </div>
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Horário</label>
                  <input
                    type="text"
                    required
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    placeholder="14:00"
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#bf5af2]"
                  />
                </div>
              </div>

              <div>
                <label className="text-purple-300 font-semibold block mb-1">Modalidade</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAptModality('telemedicina')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      aptModality === 'telemedicina'
                        ? 'bg-[#bf5af2] text-white border-[#bf5af2]'
                        : 'bg-[#0b0616] text-purple-300 border-[#2a1b4e]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    Telemedicina HD
                  </button>
                  <button
                    type="button"
                    onClick={() => setAptModality('presencial')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      aptModality === 'presencial'
                        ? 'bg-[#bf5af2] text-white border-[#bf5af2]'
                        : 'bg-[#0b0616] text-purple-300 border-[#2a1b4e]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Presencial
                  </button>
                </div>
              </div>

              <div>
                <label className="text-purple-300 font-semibold block mb-1">Valor da Sessão (R$)</label>
                <input
                  type="number"
                  value={aptValue}
                  onChange={(e) => setAptValue(Number(e.target.value))}
                  placeholder="280"
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#bf5af2]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAptModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1a0f35] text-purple-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white font-bold shadow-lg"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#120b24] border border-[#bf5af2] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Cadastrar Novo Paciente</h3>
            
            <form onSubmit={handleCreatePatient} className="space-y-3.5 text-xs">
              <div>
                <label className="text-purple-300 font-semibold block mb-1">Nome Completo do Paciente *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome do paciente"
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#bf5af2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Idade</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ex: 32"
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="(11) 98888-8888"
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-purple-300 font-semibold block mb-1">E-mail</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="paciente@email.com"
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Hipótese Diagnóstica</label>
                  <input
                    type="text"
                    value={newDiagnosis}
                    onChange={(e) => setNewDiagnosis(e.target.value)}
                    placeholder="Ex: Ansiedade, TDAH..."
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Código CID-11</label>
                  <input
                    type="text"
                    value={newCid11}
                    onChange={(e) => setNewCid11(e.target.value)}
                    placeholder="Ex: 6B00 / 6A70"
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-purple-300 font-semibold block mb-1">Psicofármacos em Uso (se houver)</label>
                <input
                  type="text"
                  value={newMeds}
                  onChange={(e) => setNewMeds(e.target.value)}
                  placeholder="Ex: Sertralina 50mg, Zolpidem 10mg..."
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-purple-300 font-semibold block mb-1">Classificação de Risco Inicial</label>
                <select
                  value={newRiskAlert}
                  onChange={(e) => setNewRiskAlert(e.target.value as any)}
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                >
                  <option value="estavel">Quadro Estável</option>
                  <option value="baixo">Baixo Risco</option>
                  <option value="moderado">Risco Moderado</option>
                  <option value="alto_risco">Alto Risco / Crise</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Contato de Emergência</label>
                  <input
                    type="text"
                    value={newEmergencyName}
                    onChange={(e) => setNewEmergencyName(e.target.value)}
                    placeholder="Nome do contato"
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Tel. Emergência</label>
                  <input
                    type="text"
                    value={newEmergencyPhone}
                    onChange={(e) => setNewEmergencyPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1a0f35] text-purple-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white font-bold shadow-lg"
                >
                  Salvar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
