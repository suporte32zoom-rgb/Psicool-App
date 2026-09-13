import React, { useState } from 'react';
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
  Brain
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
  const [selectedPatient, setSelectedPatient] = useState<Patient>(patients[0] || null);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'crise' | 'retorno'>('todos');
  const [showAddModal, setShowAddModal] = useState(false);

  // New patient state
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState(30);
  const [newPhone, setNewPhone] = useState('(11) 9');
  const [newDiagnosis, setNewDiagnosis] = useState('Transtorno de Ansiedade Generalizada');
  const [newMeds, setNewMeds] = useState('Sertralina 50mg');

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
      name: newName,
      age: Number(newAge),
      phone: newPhone,
      email: `${newName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      profileType: profile,
      diagnosisHypothesis: newDiagnosis,
      medications: newMeds ? newMeds.split(',').map((s) => s.trim()) : [],
      status: 'ativo',
      lastSessionDate: 'Hoje',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      evolutions: [],
    };

    onAddPatient(newPat);
    setSelectedPatient(newPat);
    setShowAddModal(false);
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
            Histórico completo de atendimentos, laudos gerados pela Alegra AI e telemedicina em 1 clique.
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
          <div className="space-y-2.5 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
            {filteredPatients.map((p) => {
              const isSelected = selectedPatient?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#180e2e] border-[#bf5af2] shadow-[0_0_15px_rgba(191,90,242,0.2)]'
                      : 'bg-[#120b24] border-[#2a1b4e] hover:border-[#bf5af2]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover border border-[#2a1b4e]"
                    />
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

        </div>

        {/* Right Column: Complete Clinical Record (7 cols) */}
        <div className="lg:col-span-7">
          {selectedPatient ? (
            <div className="rounded-3xl bg-[#120b24] border border-[#2a1b4e] p-5 sm:p-6 space-y-6 shadow-xl">
              
              {/* Patient Profile Header & Quick CTAs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#2a1b4e]">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedPatient.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                    alt={selectedPatient.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#bf5af2] shadow-[0_0_15px_rgba(191,90,242,0.3)]"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      {selectedPatient.name}
                      <span className="text-xs text-purple-300 font-normal">
                        ({selectedPatient.age} anos)
                      </span>
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-purple-300/70 mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#bf5af2]" />
                        {selectedPatient.phone}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#ff007f]" />
                        {selectedPatient.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    id="patient-telemed-btn"
                    onClick={() => onStartTelemedicine(selectedPatient.id)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-[0_0_12px_rgba(255,0,127,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Iniciar Telemedicina</span>
                  </button>

                  <button
                    id="patient-chat-btn"
                    onClick={() => onSelectPatientForChat(selectedPatient.id)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#180e2e] hover:bg-[#25154c] border border-[#bf5af2]/50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Brain className="w-3.5 h-3.5 text-[#bf5af2]" />
                    <span>Alegra AI</span>
                  </button>
                </div>
              </div>

              {/* Clinical Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#0b0616] border border-[#2a1b4e]">
                  <span className="text-purple-400/80 font-bold block mb-1">
                    Hipótese Diagnóstica (DSM-5 / CID-11)
                  </span>
                  <div className="text-white font-semibold">{selectedPatient.diagnosisHypothesis}</div>
                  {selectedPatient.cid11 && (
                    <div className="text-[11px] text-purple-300 mt-1">
                      CID-11: {selectedPatient.cid11} | DSM-5: {selectedPatient.dsm5}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0b0616] border border-[#2a1b4e]">
                  <span className="text-purple-400/80 font-bold block mb-1 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-[#ff007f]" />
                    Psicofármacos em Uso
                  </span>
                  <div className="text-slate-200">
                    {selectedPatient.medications && selectedPatient.medications.length > 0 
                      ? selectedPatient.medications.join(', ') 
                      : 'Nenhuma medicação psicotrópica registrada.'}
                  </div>
                </div>
              </div>

              {/* Clinical Evolutions (Evoluções CFP / CRM) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#bf5af2]" />
                    Evoluções Clínicas Registradas (Padrão Oficial)
                  </h3>
                  <span className="text-[11px] text-purple-400/60">
                    {selectedPatient.evolutions.length} registro(s)
                  </span>
                </div>

                {selectedPatient.evolutions.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {selectedPatient.evolutions.map((evo) => (
                      <div key={evo.id} className="p-4 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] text-xs space-y-2">
                        <div className="flex items-center justify-between text-purple-300 pb-2 border-b border-[#2a1b4e]">
                          <span className="font-bold text-white">{evo.title}</span>
                          <span className="text-[10px]">{evo.date} às {evo.time}</span>
                        </div>
                        <div className="text-slate-200 whitespace-pre-wrap leading-relaxed text-[11px]">
                          {evo.content}
                        </div>
                        <div className="text-[10px] text-purple-400/70 pt-1 flex items-center justify-between">
                          <span>{evo.professionalName} • {evo.councilId}</span>
                          <span className="text-emerald-400 font-mono">Assinatura Digital Valida</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#0b0616] border border-dashed border-[#2a1b4e] text-center text-xs text-purple-300/60">
                    Nenhuma evolução salva ainda para este paciente. Use o chat da Alegra AI ou a Telemedicina para gerar o prontuário.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-purple-300/60">
              Selecione um paciente para ver o prontuário.
            </div>
          )}
        </div>

      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#120b24] border border-[#bf5af2] p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Cadastrar Novo Paciente</h3>
            
            <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
              <div>
                <label className="text-purple-300 font-semibold block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome do paciente"
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Idade</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-purple-300 font-semibold block mb-1">Hipótese Diagnóstica / Queixa</label>
                <input
                  type="text"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-purple-300 font-semibold block mb-1">Psicofármacos em Uso (opcional)</label>
                <input
                  type="text"
                  value={newMeds}
                  onChange={(e) => setNewMeds(e.target.value)}
                  placeholder="ex: Sertralina 50mg, Zolpidem 10mg"
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
