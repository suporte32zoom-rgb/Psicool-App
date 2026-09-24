import React, { useState, useEffect } from 'react';
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
  MessageCircle,
  ChevronLeft, 
  ChevronRight, 
  Users,
  Search,
  ExternalLink,
  Filter,
  Check,
  X,
  RefreshCw,
  LogOut,
  CalendarCheck,
  CalendarPlus,
  Trash2,
  Sparkles,
  Link2,
  Globe,
  Copy,
  ShieldAlert,
  Send,
  Smartphone,
  Info,
  CheckSquare,
  FileText
} from 'lucide-react';
import { Appointment, Patient, ProfessionalProfile, ProfessionalData } from '../types';
import { 
  googleSignIn, 
  logout, 
  initAuth, 
  listCalendarEvents, 
  createCalendarEvent, 
  deleteCalendarEvent,
  GoogleCalendarEvent 
} from '../services/googleCalendar';
import { User } from 'firebase/auth';

interface CalendarAgendaProps {
  appointments: Appointment[];
  patients: Patient[];
  profile?: ProfessionalProfile;
  professionalData?: ProfessionalData;
  onStartTelemedicine: (patientId: string) => void;
  onAddAppointment: (appointment: Appointment) => void;
  onUpdateAppointmentStatus?: (appointmentId: string, newStatus: Appointment['status']) => void;
  onUpdateAppointment?: (appointment: Appointment) => void;
}

export const CalendarAgenda: React.FC<CalendarAgendaProps> = ({
  appointments,
  patients,
  profile = 'psicologo',
  professionalData = {
    name: 'Dra. Gabriela Alegra',
    role: 'Psicólogo Clínico',
    council: 'CRP',
    councilNumber: '06/148.920',
    email: 'gabriela.alegra@psicool.med.br',
    phone: '(11) 98765-4321',
    clinicName: 'Consultório Integrado PSICOOL Paulista',
    clinicAddress: 'Av. Paulista, 1000 - Conj. 1204 - Bela Vista, São Paulo - SP',
    pixKey: 'gabriela.alegra@psicool.med.br',
  },
  onStartTelemedicine,
  onAddAppointment,
  onUpdateAppointmentStatus,
  onUpdateAppointment,
}) => {
  const [selectedDate, setSelectedDate] = useState<'Hoje' | 'Amanhã' | 'Semana'>('Hoje');
  const [filterModality, setFilterModality] = useState<'todos' | 'telemedicina' | 'presencial'>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'confirmado' | 'pendente' | 'cancelado'>('todos');
  const [showNewModal, setShowNewModal] = useState(false);

  // WhatsApp Reminder State
  const [whatsappModalApt, setWhatsappModalApt] = useState<Appointment | null>(null);
  const [reminderTemplate, setReminderTemplate] = useState<'telemedicina' | 'presencial' | 'confirmacao' | 'personalizado'>('telemedicina');
  const [customReminderText, setCustomReminderText] = useState('');
  const [customPatientPhone, setCustomPatientPhone] = useState('');
  const [copiedReminder, setCopiedReminder] = useState(false);
  const [showBatchReminderModal, setShowBatchReminderModal] = useState(false);
  const [sentReminders, setSentReminders] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('psicool_sent_whatsapp_reminders');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Google Calendar Integration State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [activeViewMode, setActiveViewMode] = useState<'consultas' | 'google_events' | 'visao_integrada'>('consultas');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Destructive Action Confirmation Modal for Workspace API
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [showDomainHelpModal, setShowDomainHelpModal] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // New appointment form state
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualPatientPhone, setManualPatientPhone] = useState('');
  const [dateStr, setDateStr] = useState('Hoje');
  const [timeStr, setTimeStr] = useState('14:00');
  const [modality, setModality] = useState<'telemedicina' | 'presencial'>('telemedicina');
  const [status, setStatus] = useState<Appointment['status']>('confirmado');
  const [sessionValue, setSessionValue] = useState(280);
  const [syncToGoogleCalendarOnCreate, setSyncToGoogleCalendarOnCreate] = useState(true);

  // Helper function to format phone number for WhatsApp wa.me link
  const formatPhoneForWhatsApp = (rawPhone: string): string => {
    const cleaned = rawPhone.replace(/\D/g, '');
    if (!cleaned) return '';
    // If length is 10 or 11 (standard BR DDD+number), add 55
    if (cleaned.length === 10 || cleaned.length === 11) {
      return `55${cleaned}`;
    }
    // If starts with 55 and has 12/13 digits, keep
    if (cleaned.startsWith('55') && (cleaned.length === 12 || cleaned.length === 13)) {
      return cleaned;
    }
    return cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  };

  // Helper function to construct full secure patient telemedicine room URL
  const getPatientRoomUrl = (apt: Appointment): string => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const cleanOrigin = origin + pathname;
    const roomCode = (apt.id || apt.patientId || 'sala-psicool').toLowerCase().replace(/[^a-z0-9-]/g, '');
    const patientNameParam = encodeURIComponent(apt.patientName || 'Paciente');
    return `${cleanOrigin}?sala=${roomCode}&paciente=${patientNameParam}`;
  };

  // Generate WhatsApp Message text according to template
  const generateWhatsAppMessage = (apt: Appointment, template: 'telemedicina' | 'presencial' | 'confirmacao' | 'personalizado'): string => {
    const isDoctor = profile === 'psiquiatra';
    const profTitle = isDoctor ? 'Dr(a).' : 'Psicólogo(a)';
    const roomUrl = getPatientRoomUrl(apt);
    const dateFormatted = apt.date === 'Hoje' ? 'hoje' : apt.date === 'Amanhã' ? 'amanhã' : `no dia ${apt.date}`;

    switch (template) {
      case 'telemedicina':
        return (
          `*Lembrete de Consulta Online - PSICOOL* 🩺\n\n` +
          `Olá, *${apt.patientName}*!\n\n` +
          `Passando para lembrar da sua sessão de telemedicina agendada para *${dateFormatted} às ${apt.time}* com ${profTitle} *${professionalData.name}* (${professionalData.council}: ${professionalData.councilNumber}).\n\n` +
          `🔗 *Link de Acesso Seguro da Sala Virtual:*\n${roomUrl}\n\n` +
          `*Recomendações importantes:*\n` +
          `• Conecte-se com 5 minutos de antecedência.\n` +
          `• Utilize fones de ouvido e garanta um ambiente privativo e silencioso.\n` +
          `• Verifique sua conexão com a internet.\n\n` +
          `Por favor, responda com *CONFIRMAR* para confirmar sua presença, ou avise-nos com antecedência caso necessite reagendar. ✨`
        );

      case 'presencial':
        return (
          `*Lembrete de Consulta Presencial - PSICOOL* 🏢\n\n` +
          `Olá, *${apt.patientName}*!\n\n` +
          `Confirmamos sua consulta presencial agendada para *${dateFormatted} às ${apt.time}* com ${profTitle} *${professionalData.name}* (${professionalData.council}: ${professionalData.councilNumber}).\n\n` +
          `📍 *Local:* ${professionalData.clinicName || 'Consultório PSICOOL'}\n` +
          `Endereço: ${professionalData.clinicAddress || 'Av. Paulista, 1000 - Conj. 1204 - São Paulo/SP'}\n\n` +
          `*Orientações:*\n` +
          `• Recomendamos chegar com 10 minutos de antecedência na recepção.\n` +
          `• Caso tenha exames anteriores ou receituários, traga-os consigo.\n\n` +
          `Por favor, responda esta mensagem com *CONFIRMAR* para assegurar seu horário.`
        );

      case 'confirmacao':
        return (
          `*Confirmação de Horário - PSICOOL* 📅\n\n` +
          `Olá, *${apt.patientName}*! Tudo bem?\n\n` +
          `Lembramos da sua consulta agendada para *${dateFormatted} às ${apt.time}* com ${profTitle} *${professionalData.name}*.\n\n` +
          `Podemos confirmar seu horário? Responda com *SIM* para confirmar ou nos avise caso precise remarcar. Obrigado!`
        );

      case 'personalizado':
        return customReminderText || (
          `Olá ${apt.patientName}, confirmamos sua consulta no PSICOOL para ${dateFormatted} às ${apt.time}. Link da sala: ${roomUrl}`
        );

      default:
        return '';
    }
  };

  // Open the Reminder Modal for a specific appointment
  const handleOpenWhatsAppModal = (apt: Appointment) => {
    setWhatsappModalApt(apt);
    const defaultTemplate = apt.modality === 'telemedicina' ? 'telemedicina' : 'presencial';
    setReminderTemplate(defaultTemplate);
    setCustomPatientPhone(apt.patientPhone || '');
    setCustomReminderText(generateWhatsAppMessage(apt, defaultTemplate));
    setCopiedReminder(false);
  };

  // Dispatch WhatsApp Reminder
  const handleDispatchWhatsApp = (apt: Appointment, customText?: string, phoneOverride?: string) => {
    const phoneToUse = phoneOverride || customPatientPhone || apt.patientPhone;
    const formattedPhone = formatPhoneForWhatsApp(phoneToUse);
    const textToSend = customText || customReminderText || generateWhatsAppMessage(apt, reminderTemplate);

    if (!formattedPhone) {
      alert('Por favor, preencha o número de WhatsApp válido do paciente antes de enviar.');
      return;
    }

    const encodedText = encodeURIComponent(textToSend);
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;

    // Mark as sent
    const newSentState = {
      ...sentReminders,
      [apt.id]: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setSentReminders(newSentState);
    try {
      localStorage.setItem('psicool_sent_whatsapp_reminders', JSON.stringify(newSentState));
    } catch {
      // ignore
    }

    // Open WhatsApp
    window.open(waUrl, '_blank');
  };

  // Copy Reminder Message to Clipboard
  const handleCopyReminderMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReminder(true);
    setTimeout(() => setCopiedReminder(false), 3000);
  };

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Fetch Google Calendar Events when authenticated
  const fetchGoogleEvents = async () => {
    if (!googleToken) return;
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      // Get events for the next 30 days
      const now = new Date();
      const in30Days = new Date();
      in30Days.setDate(now.getDate() + 30);

      const events = await listCalendarEvents(now.toISOString(), in30Days.toISOString());
      setGoogleEvents(events);
      setSyncFeedback(`Sincronizado com sucesso! ${events.length} eventos carregados do Google Calendar.`);
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch (err: any) {
      console.error('Error fetching Google Calendar events:', err);
      setSyncFeedback(`Erro ao sincronizar: ${err.message || 'Falha na conexão com o Google Agenda.'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (googleUser && googleToken) {
      fetchGoogleEvents();
    }
  }, [googleUser, googleToken]);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setSyncFeedback(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        setSyncFeedback(`Conectado como ${result.user.email}!`);
        setTimeout(() => setSyncFeedback(null), 4000);
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup-closed-by-user') ||
        err?.message?.includes('cancelled-popup-request')
      ) {
        // Ignored gracefully
        return;
      }
      if (
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('unauthorized-domain')
      ) {
        setShowDomainHelpModal(true);
      } else {
        setSyncFeedback(`Autenticação não concluída: ${err.message || 'Tente novamente.'}`);
        setTimeout(() => setSyncFeedback(null), 5000);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setGoogleUser(null);
      setGoogleToken(null);
      setGoogleEvents([]);
      setSyncFeedback('Desconectado do Google Calendar.');
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // Helper to parse date string into ISO Date
  const parseAppointmentDateTime = (dStr: string, tStr: string): { startISO: string; endISO: string } => {
    const baseDate = new Date();
    if (dStr.toLowerCase() === 'amanhã' || dStr.toLowerCase() === 'amanha') {
      baseDate.setDate(baseDate.getDate() + 1);
    } else if (dStr.toLowerCase() !== 'hoje') {
      // try parse DD/MM/YYYY or DD/MM
      const parts = dStr.split('/');
      if (parts.length >= 2) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parts[2] ? parseInt(parts[2], 10) : baseDate.getFullYear();
        baseDate.setFullYear(year, month, day);
      }
    }

    const [hours, minutes] = tStr.split(':').map((n) => parseInt(n, 10) || 0);
    baseDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(baseDate.getTime() + 50 * 60 * 1000); // 50 min session

    return {
      startISO: baseDate.toISOString(),
      endISO: endDate.toISOString(),
    };
  };

  // Sync single appointment to Google Calendar
  const handleSyncAppointmentToGoogle = async (apt: Appointment) => {
    if (!googleToken) {
      alert('Por favor, conecte sua conta Google Calendar primeiro.');
      return;
    }

    setIsSyncing(true);
    try {
      const { startISO, endISO } = parseAppointmentDateTime(apt.date, apt.time);
      const isTelemed = apt.modality === 'telemedicina';

      const summary = `Consulta Clínica: ${apt.patientName} (${isTelemed ? 'Telemedicina' : 'Presencial'})`;
      const description = `Agendamento clínico registrado na plataforma PSICOOL.\n\nPaciente: ${apt.patientName}\nTelefone: ${apt.patientPhone}\nModalidade: ${isTelemed ? 'Telemedicina HD E2EE' : 'Presencial'}\nHonorários: R$ ${apt.value.toFixed(2)}\nStatus: ${apt.status.toUpperCase()}`;
      const location = isTelemed ? 'Sala Virtual de Telemedicina PSICOOL' : 'Consultório Médico/Psicológico PSICOOL';

      const createdEvent = await createCalendarEvent({
        summary,
        description,
        startDateTime: startISO,
        endDateTime: endISO,
        location,
      });

      if (onUpdateAppointment) {
        onUpdateAppointment({
          ...apt,
          googleEventId: createdEvent.id,
          syncedToGoogleCalendar: true,
        });
      }

      setSyncFeedback(`Consulta de ${apt.patientName} adicionada ao seu Google Calendar!`);
      fetchGoogleEvents();
    } catch (err: any) {
      console.error('Sync error:', err);
      alert(`Erro ao sincronizar com o Google Calendar: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync all appointments to Google Calendar
  const handleSyncAllToGoogle = async () => {
    if (!googleToken) {
      alert('Conecte sua conta Google para sincronizar todos os horários.');
      return;
    }

    setIsSyncing(true);
    let successCount = 0;
    try {
      for (const apt of appointments) {
        if (apt.status === 'cancelado') continue;
        const { startISO, endISO } = parseAppointmentDateTime(apt.date, apt.time);
        const isTelemed = apt.modality === 'telemedicina';

        await createCalendarEvent({
          summary: `Consulta PSICOOL: ${apt.patientName}`,
          description: `Sessão clínica com ${apt.patientName} (${apt.patientPhone}). Modalidade: ${apt.modality}.`,
          startDateTime: startISO,
          endDateTime: endISO,
          location: isTelemed ? 'Telemedicina HD PSICOOL' : 'Consultório PSICOOL',
        });
        successCount++;
      }

      setSyncFeedback(`${successCount} consultas sincronizadas com o seu Google Calendar!`);
      fetchGoogleEvents();
    } catch (err: any) {
      console.error('Batch sync error:', err);
      alert(`Erro durante a sincronização em lote: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete event with required explicit user confirmation
  const handleConfirmDeleteGoogleEvent = async () => {
    if (!eventToDelete) return;
    setIsDeletingEvent(true);
    try {
      await deleteCalendarEvent(eventToDelete.id);
      setGoogleEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
      setSyncFeedback(`Evento "${eventToDelete.title}" removido com sucesso do Google Calendar.`);
      setEventToDelete(null);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Erro ao excluir evento do Google Calendar: ${err.message}`);
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    const pName = patient ? patient.name : manualPatientName.trim();
    const pPhone = patient ? patient.phone : manualPatientPhone.trim() || '(11) 99999-9999';

    if (!pName) return;

    let googleEventId: string | undefined = undefined;
    let isSynced = false;

    // Optional Auto-Sync on creation
    if (syncToGoogleCalendarOnCreate && googleToken) {
      try {
        const { startISO, endISO } = parseAppointmentDateTime(dateStr, timeStr);
        const isTelemed = modality === 'telemedicina';
        const createdEvent = await createCalendarEvent({
          summary: `Consulta Clínica: ${pName}`,
          description: `Agendamento registrado no PSICOOL.\nPaciente: ${pName}\nContato: ${pPhone}\nModalidade: ${isTelemed ? 'Telemedicina HD' : 'Presencial'}`,
          startDateTime: startISO,
          endDateTime: endISO,
          location: isTelemed ? 'Telemedicina HD PSICOOL' : 'Consultório PSICOOL',
        });
        googleEventId = createdEvent.id;
        isSynced = true;
        setSyncFeedback(`Consulta de ${pName} criada e sincronizada no Google Calendar!`);
      } catch (err) {
        console.warn('Could not auto-sync on create:', err);
      }
    }

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: patient ? patient.id : `p-${Date.now()}`,
      patientName: pName,
      patientPhone: pPhone,
      date: dateStr,
      time: timeStr,
      durationMinutes: 50,
      modality,
      status,
      value: Number(sessionValue),
      googleEventId,
      syncedToGoogleCalendar: isSynced,
    };

    onAddAppointment(newApt);
    setShowNewModal(false);
    setManualPatientName('');
    setManualPatientPhone('');
    if (googleToken) fetchGoogleEvents();
  };

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
      
      {/* Header & Main Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-[#120b24] border border-[#2a1b4e]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#bf5af2] uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Gestão de Consultas, Telemedicina & Google Agenda</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <span>Agenda Clínica do Profissional</span>
            {googleUser && (
              <span className="text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-400" />
                <span>Google Calendar Conectado</span>
              </span>
            )}
          </h1>
          <p className="text-xs text-purple-300/70">
            Horários sincronizados, integração oficial com Google Calendar e telemedicina em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Batch WhatsApp Reminders Button */}
          <button
            id="batch-whatsapp-reminders-btn"
            onClick={() => setShowBatchReminderModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)] flex items-center gap-2 transition-all active:scale-95"
            title="Disparar Lembretes Automáticos via WhatsApp para os pacientes do dia"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Lembretes WhatsApp ({dateAppointments.length})</span>
          </button>

          {googleUser && (
            <button
              onClick={handleSyncAllToGoogle}
              disabled={isSyncing}
              className="px-3.5 py-2.5 rounded-xl bg-[#1c1236] hover:bg-[#27194a] text-purple-200 hover:text-white text-xs font-bold border border-[#3d2466] flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              title="Sincronizar todas as consultas com o Google Calendar"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#bf5af2] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sincronizar Tudo no Google</span>
            </button>
          )}

          <button
            id="new-appointment-btn"
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,0,127,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Google Calendar Connection Banner / Status Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#150d2c] via-[#1a0f35] to-[#120b24] border border-[#3d2466] shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {/* Google Icon Badge */}
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center p-2 shadow-md shrink-0">
              <svg viewBox="0 0 48 48" className="w-7 h-7">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Google Calendar Integration</h3>
                {googleUser ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    Ativo & Conectado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 text-[10px] font-bold border border-amber-800">
                    Não conectado
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-300/70 mt-0.5">
                {googleUser 
                  ? `Conectado como ${googleUser.email || googleUser.displayName}. As consultas e reuniões são sincronizadas diretamente com o seu Google Agenda.`
                  : 'Conecte sua conta Google para sincronizar automaticamente horários clínicos, receber notificações no smartphone e evitar choque de agendas.'}
              </p>
            </div>
          </div>

          {/* Connection Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {googleUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchGoogleEvents}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-xl bg-[#0b0616] hover:bg-[#1f123b] border border-[#3d2466] text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#bf5af2]' : 'text-purple-400'}`} />
                  <span>Atualizar Eventos</span>
                </button>

                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#0b0616] hover:bg-[#1f123b] border border-[#3d2466] text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Abrir Google Agenda Web</span>
                </a>

                <button
                  onClick={handleGoogleLogout}
                  className="p-2 rounded-xl bg-[#0b0616] hover:bg-rose-950/50 border border-rose-900/40 text-rose-300 text-xs transition-all"
                  title="Desconectar do Google Calendar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Official Google Sign-In button */
              <button
                onClick={handleGoogleLogin}
                disabled={isAuthenticating}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2.5 shadow-md active:scale-95 transition-all"
              >
                <svg viewBox="0 0 48 48" className="w-4 h-4">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isAuthenticating ? 'Conectando...' : 'Conectar com Google Calendar'}</span>
              </button>
            )}
          </div>

        </div>

        {/* Sync Feedback Toast Alert */}
        {syncFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#0b0616] border border-[#bf5af2]/40 text-purple-200 text-xs flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#bf5af2]" />
              <span>{syncFeedback}</span>
            </div>
            <button onClick={() => setSyncFeedback(null)} className="text-purple-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Tabs / View Switcher (Consultas PSICOOL vs. Eventos Google Calendar) */}
      <div className="flex items-center gap-2 border-b border-[#2a1b4e] pb-2">
        <button
          onClick={() => setActiveViewMode('consultas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeViewMode === 'consultas'
              ? 'bg-[#bf5af2] text-white shadow-[0_0_12px_rgba(191,90,242,0.4)]'
              : 'bg-[#120b24] text-purple-300/70 hover:text-white border border-[#2a1b4e]'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Consultas da Clínica ({appointments.length})</span>
        </button>

        {googleUser && (
          <button
            onClick={() => setActiveViewMode('google_events')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeViewMode === 'google_events'
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'bg-[#120b24] text-purple-300/70 hover:text-white border border-[#2a1b4e]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Eventos no Google Calendar ({googleEvents.length})</span>
          </button>
        )}
      </div>

      {activeViewMode === 'consultas' ? (
        <>
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

            {/* Bottom Row: Status Filters */}
            <div className="pt-2 border-t border-[#2a1b4e]/70 flex flex-wrap items-center justify-between gap-2">
              
              <div className="flex items-center gap-1.5 text-xs text-purple-300/80 font-semibold">
                <Filter className="w-3.5 h-3.5 text-[#bf5af2]" />
                <span>Filtrar por Status:</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Todos */}
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
                          {/* Google Synced Indicator */}
                          {apt.syncedToGoogleCalendar && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1" title="Sincronizado com Google Calendar">
                              <Globe className="w-3 h-3 text-blue-400" />
                              <span>Google</span>
                            </span>
                          )}

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

                          {/* Quick Google Sync Button if not synced */}
                          {googleUser && !apt.syncedToGoogleCalendar && (
                            <button
                              onClick={() => handleSyncAppointmentToGoogle(apt)}
                              className="ml-auto px-2 py-0.5 rounded-lg bg-blue-950/70 hover:bg-blue-900 text-blue-300 border border-blue-800 text-[10px] font-semibold flex items-center gap-1"
                              title="Exportar para Google Calendar"
                            >
                              <CalendarPlus className="w-3 h-3 text-blue-400" />
                              <span>Salvar no Google</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-[#2a1b4e] flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Interactive WhatsApp Reminder Button */}
                        <button
                          type="button"
                          id={`send-whatsapp-reminder-${apt.id}`}
                          onClick={() => handleOpenWhatsAppModal(apt)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950 to-[#0b0616] hover:from-emerald-900/80 hover:to-[#150a2b] border border-emerald-700/60 text-xs font-bold text-emerald-300 hover:text-white transition-all shadow-sm group/btn"
                          title="Personalizar e Disparar Lembrete WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400 group-hover/btn:scale-110 transition-transform" />
                          <span>Lembrete WhatsApp</span>
                        </button>

                        {/* Quick 1-click Dispatch Button */}
                        <button
                          type="button"
                          onClick={() => handleDispatchWhatsApp(apt)}
                          className="p-1.5 rounded-xl bg-[#0b0616] hover:bg-emerald-950 border border-[#2a1b4e] hover:border-emerald-700 text-emerald-400 text-xs transition-all"
                          title="Disparar Imediatamente no WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {/* Sent Badge */}
                        {sentReminders[apt.id] && (
                          <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-800">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Enviado às {sentReminders[apt.id]}</span>
                          </span>
                        )}
                      </div>

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
        </>
      ) : (
        /* Google Calendar Live Events View */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#120b24] p-4 rounded-2xl border border-[#2a1b4e]">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Eventos Ativos na Sua Conta Google Calendar</span>
              </h2>
              <p className="text-xs text-purple-300/70">
                Visualização em tempo real da agenda do seu e-mail ({googleUser?.email}).
              </p>
            </div>

            <button
              onClick={fetchGoogleEvents}
              disabled={isSyncing}
              className="px-3.5 py-1.5 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700 text-blue-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Recarregar Google</span>
            </button>
          </div>

          {googleEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {googleEvents.map((evt) => {
                const startTime = evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleString('pt-BR') : evt.start?.date;
                const endTime = evt.end?.dateTime ? new Date(evt.end.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
                const meetUrl = evt.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri;

                return (
                  <div
                    key={evt.id}
                    className="p-5 rounded-2xl bg-[#120b24] border border-[#2a1b4e] hover:border-blue-500/50 shadow-md space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>{startTime} {endTime ? `às ${endTime}` : ''}</span>
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800">
                          Google Event
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mb-1">
                        {evt.summary || '(Sem título)'}
                      </h3>

                      {evt.description && (
                        <p className="text-xs text-slate-300 line-clamp-3 bg-[#0b0616] p-2.5 rounded-xl border border-[#2a1b4e] my-2 whitespace-pre-wrap">
                          {evt.description}
                        </p>
                      )}

                      {evt.location && (
                        <div className="flex items-center gap-1.5 text-xs text-purple-300/80 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#bf5af2]" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#2a1b4e] flex items-center justify-between gap-2 flex-wrap">
                      {meetUrl ? (
                        <a
                          href={meetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Entrar no Google Meet</span>
                        </a>
                      ) : evt.htmlLink ? (
                        <a
                          href={evt.htmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b0616] hover:bg-[#1a0f35] border border-[#2a1b4e] text-blue-300 text-xs font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ver no Google Agenda</span>
                        </a>
                      ) : <div />}

                      <button
                        onClick={() => setEventToDelete({ id: evt.id, title: evt.summary || 'Evento do Google Calendar' })}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-800 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                        title="Excluir evento do Google Calendar"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Excluir</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-purple-300/60 p-6 rounded-2xl bg-[#120b24] border border-[#2a1b4e]">
              <Globe className="w-10 h-10 text-blue-400/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white mb-1">
                Nenhum evento futuro encontrado no seu Google Calendar para os próximos 30 dias.
              </p>
              <p className="text-xs text-purple-300/60">
                Você pode sincronizar as consultas existentes no Psicool clicando em &quot;Sincronizar Tudo no Google&quot;.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Unauthorized Domain Error Guidance Modal */}
      {showDomainHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#120b24] border border-amber-500/80 p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-800">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Autorização de Domínio no Firebase</h3>
                <p className="text-xs text-amber-300/80">Código de erro: auth/unauthorized-domain</p>
              </div>
            </div>

            <p className="text-xs text-purple-200/90 leading-relaxed">
              O Firebase Authentication bloqueia acessos de domínios que ainda não foram cadastrados na lista de domínios autorizados do seu projeto.
            </p>

            <div className="bg-[#0b0616] p-4 rounded-xl border border-[#2a1b4e] space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block mb-1">
                  Domínio Atual para Autorizar:
                </span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-[#1a0f35] px-3 py-2 rounded-lg text-xs font-mono text-white border border-[#3b2370] overflow-x-auto">
                    {typeof window !== 'undefined' ? window.location.hostname : 'dodgerblue-alpaca-665329.hostingersite.com'}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(window.location.hostname);
                        setCopiedDomain(true);
                        setTimeout(() => setCopiedDomain(false), 3000);
                      }
                    }}
                    className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center gap-1 text-xs font-semibold"
                    title="Copiar domínio"
                  >
                    {copiedDomain ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedDomain ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-purple-300/80 space-y-1.5 pt-1 border-t border-[#2a1b4e]">
                <p className="font-semibold text-white">Como autorizar em 3 passos:</p>
                <ol className="list-decimal list-inside space-y-1 text-purple-200/70">
                  <li>Acesse o <a href="https://console.firebase.google.com/project/gen-lang-client-0972969900/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-semibold">Console do Firebase (Configurações de Autenticação)</a></li>
                  <li>Vá na aba <strong>Domínios Autorizados (Authorized Domains)</strong></li>
                  <li>Clique em <strong>Adicionar domínio</strong>, cole o domínio acima e salve.</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDomainHelpModal(false)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg"
              >
                Entendi, já adicionei
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog for Destructive Operations on Workspace Data */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#120b24] border border-rose-600/80 p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-800">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Excluir Evento do Google Calendar?</h3>
                <p className="text-xs text-purple-300/70">Esta ação modificará os dados na sua conta do Google.</p>
              </div>
            </div>

            <div className="bg-[#0b0616] p-4 rounded-xl border border-[#2a1b4e] text-xs text-slate-200">
              <span className="text-purple-400 font-semibold block text-[11px] mb-1">Evento a ser removido:</span>
              <p className="font-bold text-white text-sm">{eventToDelete.title}</p>
              <p className="text-purple-300/60 mt-1 text-[11px]">
                O evento será excluído permanentemente da sua agenda principal no Google Calendar.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={isDeletingEvent}
                className="flex-1 py-2.5 rounded-xl bg-[#1a0f35] hover:bg-[#25154d] text-purple-300 font-semibold text-xs transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteGoogleEvent}
                disabled={isDeletingEvent}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 transition-all"
              >
                {isDeletingEvent ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirmar Exclusão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#120b24] border border-[#bf5af2] p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Agendar Nova Consulta</h3>
            
            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              <div>
                <label className="text-purple-300 font-semibold block mb-1">Paciente</label>
                {patients.length > 0 ? (
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
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={manualPatientName}
                      onChange={(e) => setManualPatientName(e.target.value)}
                      placeholder="Nome do paciente"
                      required
                      className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#bf5af2]"
                    />
                    <input
                      type="text"
                      value={manualPatientPhone}
                      onChange={(e) => setManualPatientPhone(e.target.value)}
                      placeholder="WhatsApp / Telefone (ex: 11 99999-9999)"
                      className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#bf5af2]"
                    />
                  </div>
                )}
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

              {/* Google Calendar Auto-sync toggle */}
              {googleUser && (
                <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="font-bold text-white text-[11px]">Sincronizar no Google Calendar</p>
                      <p className="text-[10px] text-blue-200/70">Cria o evento na sua agenda oficial ({googleUser.email})</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={syncToGoogleCalendarOnCreate}
                    onChange={(e) => setSyncToGoogleCalendarOnCreate(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-[#0b0616] border-[#2a1b4e] focus:ring-0 cursor-pointer"
                  />
                </div>
              )}

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
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INDIVIDUAL WHATSAPP REMINDER MODAL */}
      {whatsappModalApt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl bg-[#120b24] border border-emerald-500/80 p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2a1b4e]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-400">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Lembrete de Consulta via WhatsApp</span>
                  </h3>
                  <p className="text-xs text-purple-300/80">
                    Paciente: <strong className="text-white">{whatsappModalApt.patientName}</strong> • {whatsappModalApt.date} às {whatsappModalApt.time}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setWhatsappModalApt(null)}
                className="p-2 rounded-xl bg-[#0b0616] text-purple-400 hover:text-white border border-[#2a1b4e] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Patient Phone Number Verification */}
            <div className="bg-[#0b0616] p-3 rounded-2xl border border-[#2a1b4e] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-purple-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Número de WhatsApp Cadastrado:</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  Link formatado: +{formatPhoneForWhatsApp(customPatientPhone || whatsappModalApt.patientPhone)}
                </span>
              </div>
              <input
                type="text"
                value={customPatientPhone}
                onChange={(e) => setCustomPatientPhone(e.target.value)}
                placeholder="(DDD) 99999-9999"
                className="w-full bg-[#180e2e] border border-[#3c2273] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Template Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-purple-300">
                Selecione o Modelo de Mensagem:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setReminderTemplate('telemedicina');
                    setCustomReminderText(generateWhatsAppMessage(whatsappModalApt, 'telemedicina'));
                  }}
                  className={`p-2 rounded-xl text-xs font-bold transition-all border text-center ${
                    reminderTemplate === 'telemedicina'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md'
                      : 'bg-[#0b0616] text-purple-300/70 border-[#2a1b4e] hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 mx-auto mb-1 text-[#ff007f]" />
                  <span>Telemedicina HD</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReminderTemplate('presencial');
                    setCustomReminderText(generateWhatsAppMessage(whatsappModalApt, 'presencial'));
                  }}
                  className={`p-2 rounded-xl text-xs font-bold transition-all border text-center ${
                    reminderTemplate === 'presencial'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md'
                      : 'bg-[#0b0616] text-purple-300/70 border-[#2a1b4e] hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 mx-auto mb-1 text-purple-400" />
                  <span>Presencial</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReminderTemplate('confirmacao');
                    setCustomReminderText(generateWhatsAppMessage(whatsappModalApt, 'confirmacao'));
                  }}
                  className={`p-2 rounded-xl text-xs font-bold transition-all border text-center ${
                    reminderTemplate === 'confirmacao'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md'
                      : 'bg-[#0b0616] text-purple-300/70 border-[#2a1b4e] hover:text-white'
                  }`}
                >
                  <Clock3 className="w-3.5 h-3.5 mx-auto mb-1 text-amber-400" />
                  <span>Confirmação</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReminderTemplate('personalizado');
                  }}
                  className={`p-2 rounded-xl text-xs font-bold transition-all border text-center ${
                    reminderTemplate === 'personalizado'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md'
                      : 'bg-[#0b0616] text-purple-300/70 border-[#2a1b4e] hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 mx-auto mb-1 text-[#bf5af2]" />
                  <span>Personalizado</span>
                </button>
              </div>
            </div>

            {/* Live Message Preview & Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-purple-300">
                <span className="font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#bf5af2]" />
                  <span>Pré-visualização do Texto (Editável):</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyReminderMessage(customReminderText || generateWhatsAppMessage(whatsappModalApt, reminderTemplate))}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  {copiedReminder ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReminder ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>

              <textarea
                rows={7}
                value={customReminderText || generateWhatsAppMessage(whatsappModalApt, reminderTemplate)}
                onChange={(e) => {
                  setCustomReminderText(e.target.value);
                  setReminderTemplate('personalizado');
                }}
                className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-2xl p-3 text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-emerald-500 transition-all resize-none selection:bg-emerald-600 selection:text-white"
              />
            </div>

            {/* Room Link Quick Copy for Telemedicine */}
            {whatsappModalApt.modality === 'telemedicina' && (
              <div className="p-3 bg-[#0b0616] rounded-xl border border-[#2a1b4e] flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Link2 className="w-3.5 h-3.5 text-[#bf5af2] shrink-0" />
                  <span className="text-purple-300/80 shrink-0 font-medium">Link da Sala:</span>
                  <span className="font-mono text-[#bf5af2] truncate text-[11px]">
                    {getPatientRoomUrl(whatsappModalApt)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getPatientRoomUrl(whatsappModalApt));
                    setCopiedReminder(true);
                    setTimeout(() => setCopiedReminder(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#1a0f35] hover:bg-[#26154c] text-purple-200 text-[11px] font-semibold shrink-0"
                >
                  Copiar Link
                </button>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2a1b4e]">
              <button
                type="button"
                onClick={() => setWhatsappModalApt(null)}
                className="px-4 py-2.5 rounded-xl bg-[#1a0f35] hover:bg-[#25154d] text-purple-300 font-semibold text-xs transition-all"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={() => {
                  handleDispatchWhatsApp(whatsappModalApt);
                  setWhatsappModalApt(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Disparar no WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* BATCH WHATSAPP REMINDERS MODAL (Lembretes em Lote do Dia) */}
      {showBatchReminderModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl bg-[#120b24] border border-emerald-500/80 p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2a1b4e]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Central de Lembretes WhatsApp ({selectedDate})</span>
                  </h3>
                  <p className="text-xs text-purple-300/80">
                    Dispare lembretes automáticos com 1 clique para os pacientes agendados.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBatchReminderModal(false)}
                className="p-2 rounded-xl bg-[#0b0616] text-purple-400 hover:text-white border border-[#2a1b4e] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of Consultations for Today */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {dateAppointments.length > 0 ? (
                dateAppointments.map((apt) => {
                  const isSent = !!sentReminders[apt.id];
                  const isTelemed = apt.modality === 'telemedicina';

                  return (
                    <div
                      key={apt.id}
                      className={`p-4 rounded-2xl bg-[#0b0616] border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isSent ? 'border-emerald-800/80 bg-emerald-950/20' : 'border-[#2a1b4e] hover:border-purple-500/40'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-white">
                            {apt.patientName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1a0f35] text-purple-200 border border-[#3b216d]">
                            {apt.time} ({apt.durationMinutes} min)
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isTelemed ? 'bg-pink-950 text-[#ff007f] border border-pink-800' : 'bg-purple-950 text-purple-300'
                          }`}>
                            {isTelemed ? 'Telemedicina HD' : 'Presencial'}
                          </span>
                        </div>

                        <div className="text-xs text-purple-300/70 flex items-center gap-2 font-mono">
                          <Smartphone className="w-3 h-3 text-emerald-400" />
                          <span>{apt.patientPhone || 'Telefone não cadastrado'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                        {isSent ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-bold">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Enviado ({sentReminders[apt.id]})</span>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => {
                            handleDispatchWhatsApp(apt);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                          title="Enviar lembrete via WhatsApp para este paciente"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSent ? 'Reenviar' : 'Enviar WhatsApp'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowBatchReminderModal(false);
                            handleOpenWhatsAppModal(apt);
                          }}
                          className="p-1.5 rounded-xl bg-[#180e2e] hover:bg-[#25154d] text-purple-300 text-xs border border-[#381f63]"
                          title="Ver e Editar Mensagem"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-purple-300/60 space-y-2">
                  <CalendarIcon className="w-8 h-8 mx-auto text-[#bf5af2]/40" />
                  <p className="text-xs">Nenhuma consulta agendada para {selectedDate}.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#2a1b4e] flex items-center justify-between">
              <span className="text-xs text-purple-300/70">
                {dateAppointments.filter((a) => !!sentReminders[a.id]).length} de {dateAppointments.length} lembretes disparados.
              </span>

              <button
                type="button"
                onClick={() => setShowBatchReminderModal(false)}
                className="px-4 py-2 rounded-xl bg-[#1a0f35] hover:bg-[#25154d] text-purple-300 font-semibold text-xs"
              >
                Concluir
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
