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
  UserPlus
} from 'lucide-react';
import { Patient, ClinicalEvolution, ProfessionalProfile } from '../types';

interface PatientsDirectoryProps {
  patients: Patient[];
  profile: ProfessionalProfile;
  onSelectPatientForChat: (patientId: string) => void;
  onStartTelemedicine: (patientId: string) => void;
  onAddPatient: (patient: Patient) => void;
}

export const PatientsDirectory: React.FC<PatientsDirectoryProps> = ({
  patients,
  profile,
  onSelectPatientForChat,
  onStartTelemedicine,
  onAddPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'crise' | 'retorno'>('todos');
  const [showAddModal, setShowAddModal] = useState(false);

  // New patient state (clean initial inputs)
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState<number | ''>('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newMeds, setNewMeds] = useState('');

  // Keep selected patient in sync with available patients
  useEffect(() => {
    if (patients.length > 0 && !patients.some((p) => p.id === selectedPatientId)) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.diagnosisHypothesis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPat: Patient = {
      id: `p-${Date.now()}`,
      name: newName.trim(),
      age: Number(newAge) || 30,
      phone: newPhone.trim() || '(11) 90000-0000',
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      profileType: profile,
      diagnosisHypothesis: newDiagnosis.trim() || 'Em avaliação clínica inicial',
      medications: newMeds ? newMeds.split(',').map((s) => s.trim()).filter(Boolean) : [],
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
    setNewDiagnosis('');
    setNewMeds('');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-[#120b24] border border-[#2a1b4e]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#bf5af2] uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Prontuário Eletrônico Criptografado (CFP / CFM)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Meus Pacientes & Fichas Clínicas
          </h1>
          <p className="text-xs text-purple-300/70">
            Histórico completo de atendimentos, evoluções com inteligência clínica e telemedicina em 1 clique.
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

      {/* Main Split View: Left Patient List, Right Detailed Electronic Record */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Search & Patient List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou hipótese diagnóstica..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#120b24] border border-[#2a1b4e] focus:border-[#bf5af2] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-purple-400/50 focus:outline-none"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
            {(['todos', 'ativo', 'crise', 'retorno'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl capitalize font-semibold transition-all ${
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
                        <div className="w-10 h-10 rounded-xl bg-[#2a1b4e] border border-[#bf5af2]/40 text-[#bf5af2] font-bold text-xs flex items-center justify-center">
                          {initials || 'P'}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{p.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            p.status === 'crise' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-purple-950 text-purple-300'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-purple-300/70 truncate max-w-[200px]">
                          {p.diagnosisHypothesis}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#ff007f]' : 'text-purple-400/40'}`} />
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

        {/* Right Column: Complete Clinical Record (7 cols) */}
        <div className="lg:col-span-7">
          {selectedPatient ? (
            <div className="rounded-3xl bg-[#120b24] border border-[#2a1b4e] p-5 sm:p-6 space-y-6 shadow-xl">
              
              {/* Patient Profile Header & Quick CTAs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#2a1b4e]">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#bf5af2] to-[#ff007f] p-0.5 shadow-[0_0_15px_rgba(191,90,242,0.3)]">
                    <div className="w-full h-full rounded-[14px] bg-[#0b0616] flex items-center justify-center text-white font-bold text-lg">
                      {selectedPatient.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'P'}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      {selectedPatient.name}
                      <span className="text-xs text-purple-300 font-normal">
                        ({selectedPatient.age} anos)
                      </span>
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-purple-300/70 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#bf5af2]" />
                        {selectedPatient.phone}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#bf5af2]" />
                        {selectedPatient.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectPatientForChat(selectedPatient.id)}
                    className="px-3.5 py-2 rounded-xl bg-[#0b0616] hover:bg-[#1a0f35] border border-[#2a1b4e] text-xs font-semibold text-purple-200 flex items-center gap-1.5 transition-all"
                  >
                    <Brain className="w-3.5 h-3.5 text-[#bf5af2]" />
                    <span>Alegra AI</span>
                  </button>
                  <button
                    onClick={() => onStartTelemedicine(selectedPatient.id)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-[0_0_12px_rgba(255,0,127,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Iniciar Sessão HD</span>
                  </button>
                </div>
              </div>

              {/* Clinical Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400">
                    Hipótese Diagnóstica / Queixa
                  </span>
                  <p className="text-xs font-semibold text-white">
                    {selectedPatient.diagnosisHypothesis}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400">
                    Psicofármacos em Uso
                  </span>
                  <p className="text-xs font-semibold text-slate-200">
                    {selectedPatient.medications.length > 0
                      ? selectedPatient.medications.join(', ')
                      : 'Nenhuma medicação informada'}
                  </p>
                </div>
              </div>

              {/* Evolutions History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#bf5af2]" />
                    <span>Evoluções de Sessão ({selectedPatient.evolutions.length})</span>
                  </h3>
                  <button
                    onClick={() => onSelectPatientForChat(selectedPatient.id)}
                    className="text-xs font-semibold text-[#bf5af2] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nova Evolução com Alegra AI</span>
                  </button>
                </div>

                {selectedPatient.evolutions.length > 0 ? (
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {selectedPatient.evolutions.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-4 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between text-purple-300/80 pb-2 border-b border-[#2a1b4e]/50">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#bf5af2]" />
                            {ev.date}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#180e2e] text-[#bf5af2] border border-[#bf5af2]/30">
                            Padrão CFP/CFM
                          </span>
                        </div>
                        <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                          {ev.content}
                        </p>
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

            </div>
          ) : (
            <div className="rounded-3xl bg-[#120b24] border border-[#2a1b4e] p-12 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#bf5af2]/20 to-[#ff007f]/20 border border-[#bf5af2]/40 flex items-center justify-center mx-auto text-[#bf5af2]">
                <UserPlus className="w-8 h-8" />
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="text-base font-bold text-white">Nenhum Paciente Cadastrado</h3>
                <p className="text-xs text-purple-300/70 mt-1">
                  Comece cadastrando seu primeiro paciente para abrir o prontuário eletrônico seguro, emitir documentos e realizar atendimentos.
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

      {/* New Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#120b24] border border-[#bf5af2] p-6 shadow-2xl relative">
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

              <div>
                <label className="text-purple-300 font-semibold block mb-1">Hipótese Diagnóstica / Queixa Principal</label>
                <input
                  type="text"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  placeholder="Ex: Transtorno de Ansiedade Generalizada, TDAH, Depressão..."
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                />
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
