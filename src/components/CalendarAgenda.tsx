import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  MapPin, 
  Plus, 
  CheckCircle, 
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  Activity,
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Users,
  Search,
  ExternalLink,
  Filter,
  Check,
  X
} from 'lucide-react';
import { Appointment, Patient } from '../types';

interface CalendarAgendaProps {
  appointments: Appointment[];
  patients: Patient[];
  onStartTelemedicine: (patientId: string) => void;
  onAddAppointment: (appointment: Appointment) => void;
  onUpdateAppointmentStatus?: (appointmentId: string, newStatus: Appointment['status']) => void;
}

export const CalendarAgenda: React.FC<CalendarAgendaProps> = ({
  appointments,
  patients,
  onStartTelemedicine,
  onAddAppointment,
  onUpdateAppointmentStatus,
}) => {
  const [selectedDate, setSelectedDate] = useState<'Hoje' | 'Amanhã' | 'Semana'>('Hoje');
  const [filterModality, setFilterModality] = useState<'todos' | 'telemedicina' | 'presencial'>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'confirmado' | 'pendente' | 'cancelado'>('todos');
  const [showNewModal, setShowNewModal] = useState(false);

  // New appointment form state
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [dateStr, setDateStr] = useState('Hoje');
  const [timeStr, setTimeStr] = useState('14:00');
  const [modality, setModality] = useState<'telemedicina' | 'presencial'>('telemedicina');
  const [status, setStatus] = useState<Appointment['status']>('confirmado');
  const [sessionValue, setSessionValue] = useState(280);

  // Count metrics for the selected date
  const dateAppointments = appointments.filter((apt) => {
    if (selectedDate !== 'Semana' && apt.date !== selectedDate) return false;
    return true;
  });

  const countTotal = dateAppointments.length;
  const countConfirmados = dateAppointments.filter(
    (a) => a.status === 'confirmado' || a.status === 'em_andamento' || a.status === 'concluido'
  ).length;
  const countPendentes = dateAppointments.filter((a) => a.status === 'pendente').length;
  const countCancelados = dateAppointments.filter((a) => a.status === 'cancelado').length;

  const filteredAppointments = appointments.filter((apt) => {
    if (selectedDate !== 'Semana' && apt.date !== selectedDate) return false;
    if (filterModality !== 'todos' && apt.modality !== filterModality) return false;
    if (filterStatus !== 'todos') {
      if (filterStatus === 'confirmado') {
        if (apt.status !== 'confirmado' && apt.status !== 'em_andamento' && apt.status !== 'concluido') return false;
      } else {
        if (apt.status !== filterStatus) return false;
      }
    }
    return true;
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      date: dateStr,
      time: timeStr,
      durationMinutes: 50,
      modality,
      status,
      value: Number(sessionValue),
    };

    onAddAppointment(newApt);
    setShowNewModal(false);
  };

  const getStatusBadge = (aptStatus: Appointment['status']) => {
    switch (aptStatus) {
      case 'confirmado':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmado</span>
          </span>
        );
      case 'pendente':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-800">
            <Clock3 className="w-3 h-3" />
            <span>Pendente</span>
          </span>
        );
      case 'cancelado':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 text-rose-400 border border-rose-800">
            <XCircle className="w-3 h-3" />
            <span>Cancelado</span>
          </span>
        );
      case 'em_andamento':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#bf5af2]/20 text-[#bf5af2] border border-[#bf5af2]/50">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>Em Andamento</span>
          </span>
        );
      case 'concluido':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-950/80 text-blue-400 border border-blue-800">
            <Check className="w-3 h-3" />
            <span>Concluído</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-[#120b24] border border-[#2a1b4e]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#bf5af2] uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Gestão de Consultas & Telemedicina</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Agenda Clínica do Profissional
          </h1>
          <p className="text-xs text-purple-300/70">
            Horários sincronizados, links de telemedicina em alta resolução e filtros em tempo real.
          </p>
        </div>

        <button
          id="new-appointment-btn"
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,0,127,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Date & Modality & Status Filters Bar */}
      <div className="flex flex-col gap-3 bg-[#0b0616] p-3 rounded-2xl border border-[#2a1b4e]">
        
        {/* Top Row: Date Selector & Modality */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date Selector */}
          <div className="flex items-center gap-1.5">
            {(['Hoje', 'Amanhã', 'Semana'] as const).map((d) => (
              <button
                key={d}
                id={`filter-date-${d.toLowerCase()}`}
                onClick={() => setSelectedDate(d)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDate === d
                    ? 'bg-[#180e2e] text-white border border-[#bf5af2] shadow-[0_0_10px_rgba(191,90,242,0.3)]'
                    : 'text-purple-300/70 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Modality Filter */}
          <div className="flex items-center gap-1 text-xs bg-[#120b24] p-1 rounded-xl border border-[#2a1b4e]">
            <button
              id="filter-modality-todos"
              onClick={() => setFilterModality('todos')}
              className={`px-2.5 py-1 rounded-lg transition-all ${filterModality === 'todos' ? 'bg-[#bf5af2]/20 text-white font-bold' : 'text-purple-300/70 hover:text-white'}`}
            >
              Todas Modalidades
            </button>
            <button
              id="filter-modality-telemedicina"
              onClick={() => setFilterModality('telemedicina')}
              className={`px-2.5 py-1 rounded-lg transition-all ${filterModality === 'telemedicina' ? 'bg-[#ff007f]/20 text-[#ff007f] font-bold' : 'text-purple-300/70 hover:text-white'}`}
            >
              Telemedicina HD
            </button>
            <button
              id="filter-modality-presencial"
              onClick={() => setFilterModality('presencial')}
              className={`px-2.5 py-1 rounded-lg transition-all ${filterModality === 'presencial' ? 'bg-purple-900/40 text-purple-300 font-bold' : 'text-purple-300/70 hover:text-white'}`}
            >
              Presencial
            </button>
          </div>
        </div>

        {/* Bottom Row: Status Filters (Confirmado, Pendente, Cancelado, Todos) */}
        <div className="pt-2 border-t border-[#2a1b4e]/70 flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-1.5 text-xs text-purple-300/80 font-semibold">
            <Filter className="w-3.5 h-3.5 text-[#bf5af2]" />
            <span>Filtrar por Status:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Todos Status */}
            <button
              id="filter-status-todos"
              onClick={() => setFilterStatus('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                filterStatus === 'todos'
                  ? 'bg-[#bf5af2] text-white border-[#bf5af2] shadow-[0_0_12px_rgba(191,90,242,0.35)]'
                  : 'bg-[#120b24] text-purple-300/70 border-[#2a1b4e] hover:text-white hover:border-purple-400/40'
              }`}
            >
              <span>Todos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterStatus === 'todos' ? 'bg-black/30 text-white' : 'bg-[#1c1236] text-purple-300'
              }`}>
                {countTotal}
              </span>
            </button>

            {/* Confirmados */}
            <button
              id="filter-status-confirmado"
              onClick={() => setFilterStatus('confirmado')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                filterStatus === 'confirmado'
                  ? 'bg-emerald-900/90 text-emerald-200 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                  : 'bg-[#120b24] text-emerald-400/80 border-[#2a1b4e] hover:text-emerald-300 hover:border-emerald-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Confirmados</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterStatus === 'confirmado' ? 'bg-emerald-950 text-emerald-200' : 'bg-emerald-950/60 text-emerald-400'
              }`}>
                {countConfirmados}
              </span>
            </button>

            {/* Pendentes */}
            <button
              id="filter-status-pendente"
              onClick={() => setFilterStatus('pendente')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                filterStatus === 'pendente'
                  ? 'bg-amber-900/90 text-amber-200 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                  : 'bg-[#120b24] text-amber-400/80 border-[#2a1b4e] hover:text-amber-300 hover:border-amber-800'
              }`}
            >
              <Clock3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Pendentes</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterStatus === 'pendente' ? 'bg-amber-950 text-amber-200' : 'bg-amber-950/60 text-amber-400'
              }`}>
                {countPendentes}
              </span>
            </button>

            {/* Cancelados */}
            <button
              id="filter-status-cancelado"
              onClick={() => setFilterStatus('cancelado')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                filterStatus === 'cancelado'
                  ? 'bg-rose-900/90 text-rose-200 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                  : 'bg-[#120b24] text-rose-400/80 border-[#2a1b4e] hover:text-rose-300 hover:border-rose-800'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Cancelados</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterStatus === 'cancelado' ? 'bg-rose-950 text-rose-200' : 'bg-rose-950/60 text-rose-400'
              }`}>
                {countCancelados}
              </span>
            </button>
          </div>

        </div>

      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => {
            const isTelemed = apt.modality === 'telemedicina';
            const isCanceled = apt.status === 'cancelado';

            return (
              <div
                key={apt.id}
                id={`appointment-card-${apt.id}`}
                className={`flex flex-col justify-between p-5 rounded-2xl bg-[#120b24] border transition-all shadow-md group ${
                  isCanceled 
                    ? 'border-rose-950/80 opacity-75 hover:opacity-100' 
                    : 'border-[#2a1b4e] hover:border-[#bf5af2]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0b0616] text-purple-200 border border-[#2a1b4e]">
                      <Clock className="w-3.5 h-3.5 text-[#bf5af2]" />
                      {apt.time} ({apt.durationMinutes} min)
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Status Badge */}
                      {getStatusBadge(apt.status)}

                      {/* Modality Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isTelemed
                          ? 'bg-[#ff007f]/20 text-[#ff007f] border border-[#ff007f]/40'
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}>
                        {isTelemed ? 'Telemedicina HD' : 'Consultório'}
                      </span>
                    </div>
                  </div>

                  <h3 className={`text-base font-bold mb-1 transition-colors ${
                    isCanceled ? 'text-slate-400 line-through' : 'text-white group-hover:text-purple-200'
                  }`}>
                    {apt.patientName}
                  </h3>
                  
                  <div className="text-xs text-purple-300/70 mb-3 flex items-center gap-3">
                    <span>Honorários: R$ {apt.value.toFixed(2)}</span>
                    <span>•</span>
                    <span>{apt.patientPhone}</span>
                  </div>

                  {/* Status Actions Bar */}
                  {onUpdateAppointmentStatus && (
                    <div className="flex items-center gap-1 mb-3 pt-2 border-t border-[#2a1b4e]/50 text-[11px]">
                      <span className="text-purple-400/60 mr-1">Status:</span>
                      
                      {apt.status !== 'confirmado' && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'confirmado')}
                          className="px-2 py-0.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 text-[10px] font-semibold transition-all"
                          title="Marcar como Confirmado"
                        >
                          Confirmar
                        </button>
                      )}

                      {apt.status !== 'pendente' && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'pendente')}
                          className="px-2 py-0.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-400 border border-amber-800 text-[10px] font-semibold transition-all"
                          title="Marcar como Pendente"
                        >
                          Pendente
                        </button>
                      )}

                      {apt.status !== 'cancelado' && (
                        <button
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'cancelado')}
                          className="px-2 py-0.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800 text-[10px] font-semibold transition-all"
                          title="Cancelar Consulta"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-[#2a1b4e] flex items-center justify-between gap-2 flex-wrap">
                  <a
                    href={`https://wa.me/55${apt.patientPhone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(apt.patientName)},%20confirmamos%20sua%20consulta%20no%20Psicool%20às%20${apt.time}.`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0b0616] hover:bg-[#1a0f35] border border-[#2a1b4e] text-xs text-emerald-400 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Lembrete WhatsApp</span>
                  </a>

                  {isTelemed && !isCanceled && (
                    <button
                      id={`start-call-${apt.id}`}
                      onClick={() => onStartTelemedicine(apt.patientId)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-[0_0_12px_rgba(255,0,127,0.4)] hover:brightness-110 active:scale-95 transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Entrar na Sala HD</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12 text-purple-300/60 p-6 rounded-2xl bg-[#120b24] border border-[#2a1b4e]">
            <CalendarIcon className="w-10 h-10 text-[#bf5af2]/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white mb-1">
              Nenhuma consulta encontrada com os filtros atuais.
            </p>
            <p className="text-xs text-purple-300/60">
              Tente alterar o filtro de status ({filterStatus !== 'todos' ? filterStatus : 'todos'}) ou a data selecionada ({selectedDate}).
            </p>
          </div>
        )}
      </div>

      {/* New Appointment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#120b24] border border-[#bf5af2] p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Agendar Nova Consulta</h3>
            
            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              <div>
                <label className="text-purple-300 font-semibold block mb-1">Paciente</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#bf5af2]"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#120b24]">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Data</label>
                  <input
                    type="text"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    placeholder="Hoje ou DD/MM"
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Horário</label>
                  <input
                    type="text"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    placeholder="14:00"
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Modalidade</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as any)}
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  >
                    <option value="telemedicina" className="bg-[#120b24]">Telemedicina HD</option>
                    <option value="presencial" className="bg-[#120b24]">Presencial</option>
                  </select>
                </div>

                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Status Inicial</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  >
                    <option value="confirmado" className="bg-[#120b24]">Confirmado</option>
                    <option value="pendente" className="bg-[#120b24]">Pendente</option>
                    <option value="cancelado" className="bg-[#120b24]">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-purple-300 font-semibold block mb-1">Valor da Consulta (R$)</label>
                <input
                  type="number"
                  value={sessionValue}
                  onChange={(e) => setSessionValue(Number(e.target.value))}
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1a0f35] text-purple-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white font-bold shadow-lg"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
