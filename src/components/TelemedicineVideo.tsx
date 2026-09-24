import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Brain, 
  FileText, 
  Save, 
  Copy, 
  Check, 
  Columns, 
  Maximize2, 
  Minimize2, 
  Settings, 
  Users, 
  Clock, 
  AlertCircle,
  Activity,
  ChevronRight,
  User,
  MessageCircle,
  Link as LinkIcon,
  ExternalLink,
  QrCode,
  CheckCircle2,
  X,
  Send,
  Lock,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { Patient, ProfessionalProfile, ClinicalEvolution, ProfessionalData } from '../types';

interface TelemedicineVideoProps {
  patients: Patient[];
  profile: ProfessionalProfile;
  professionalData?: ProfessionalData;
  onSaveEvolutionToPatient: (patientId: string, evolution: ClinicalEvolution) => void;
  onNavigateToChatWithPrompt?: (prompt: string) => void;
  onOpenPatientRoom?: (roomCode: string, patientName: string) => void;
}

export const TelemedicineVideo: React.FC<TelemedicineVideoProps> = ({
  patients,
  profile,
  professionalData = {
    name: profile === 'psicologo' ? 'Dr(a). Psicólogo(a)' : 'Dr(a). Psiquiatra',
    role: profile === 'psicologo' ? 'Psicólogo Clínico' : 'Médico Psiquiatra',
    council: profile === 'psicologo' ? 'CRP' : 'CRM',
    councilNumber: profile === 'psicologo' ? '06/148.920' : '152.480-SP',
    email: 'contato@consultorio.com.br',
    phone: '(11) 98765-4321',
    clinicName: 'Psicool Clínica Digital',
    clinicAddress: 'Av. Paulista, 1000 - São Paulo, SP',
    pixKey: 'contato@consultorio.com.br',
  },
  onSaveEvolutionToPatient,
  onNavigateToChatWithPrompt,
  onOpenPatientRoom,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [inCall, setInCall] = useState<boolean>(true);
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [splitScreenMode, setSplitScreenMode] = useState<boolean>(true);
  const [sideTab, setSideTab] = useState<'anotacoes' | 'prontuario' | 'whatsapp_link'>('anotacoes');

  // Consultation notes state (starts clean)
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Alegra AI generated evolution state
  const [generatedEvolution, setGeneratedEvolution] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false);

  // WhatsApp Share Modal
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Call timer state (starts at 0)
  const [callSeconds, setCallSeconds] = useState<number>(0);

  // Local camera video ref
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0] || null;

  // Custom Room Code generator
  const [customRoomCode, setCustomRoomCode] = useState<string>(() => {
    return `sala-${(currentPatient?.name || 'consulta').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
  });

  // Update room code when patient changes
  useEffect(() => {
    if (currentPatient) {
      const sanitized = currentPatient.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setCustomRoomCode(`sala-${sanitized}`);
    }
  }, [selectedPatientId]);

  // Compute real, valid room URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dodgerblue-alpaca-665329.hostingersite.com';
  const validRoomUrl = `${baseUrl}?sala=${encodeURIComponent(customRoomCode)}&paciente=${encodeURIComponent(currentPatient?.name || 'Paciente')}`;

  // Formatted WhatsApp message for patient
  const whatsappMessage = `Olá, ${currentPatient?.name || 'Paciente'}! 👋

Aqui é do consultório de *${professionalData.name}* (${professionalData.council}: ${professionalData.councilNumber}).

Segue o link seguro e criptografado para o seu atendimento de Telemedicina de hoje:

🔗 *Link da sua Sala Virtual:*
${validRoomUrl}

📌 *Orientações importantes para a consulta:*
• Acesse pelo smartphone, tablet ou computador (Google Chrome, Safari ou Edge).
• Ao entrar na página, autorize o acesso à câmera e ao microfone.
• Recomendamos estar em um ambiente calmo e com fone de ouvido para garantir seu sigilo e conforto.
• Sala 100% criptografada de ponta a ponta (E2EE), em conformidade com as normas éticas do ${professionalData.council}.

Caso precise de qualquer auxílio antes de entrar, responda a esta mensagem. Até logo! 🌿`;

  // Timer counter
  useEffect(() => {
    let interval: any;
    if (inCall) {
      interval = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [inCall]);

  // Handle local camera stream
  useEffect(() => {
    let active = true;

    async function startCamera() {
      if (inCall && cameraEnabled && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false, // avoid feedback
          });
          if (active && localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localStreamRef.current = stream;
          }
        } catch (e) {
          console.log('Webcam permissão não concedida ou dispositivo indisponível.');
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [inCall, cameraEnabled]);

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
  };

  const toggleMic = () => {
    setMicEnabled(!micEnabled);
  };

  const toggleCall = () => {
    setInCall(!inCall);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing && navigator.mediaDevices?.getDisplayMedia) {
      try {
        await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
      } catch (err) {
        console.log('Compartilhamento de tela cancelado.');
      }
    } else {
      setIsScreenSharing(false);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(validRoomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const rawPhone = currentPatient?.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const targetUrl = cleanPhone.length >= 8 
      ? `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(whatsappMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  // Live Evolution Generation with Alegra AI
  const handleGenerateEvolution = async () => {
    if (!sessionNotes.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/alegra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Por favor, estruture a seguinte evolução clínica da sessão de telemedicina realizada hoje com o paciente ${currentPatient?.name || 'Paciente'} (Diagnóstico: ${currentPatient?.diagnosisHypothesis || 'Avaliação'}).
Notas da sessão:
${sessionNotes}`,
          profile,
          patientName: currentPatient?.name || 'Paciente',
          category: 'evolucao',
        }),
      });

      const data = await response.json();
      if (data.text) {
        setGeneratedEvolution(data.text);
      }
    } catch (err) {
      console.error(err);
      setGeneratedEvolution('Erro ao processar com a Alegra AI. Verifique a conexão com a API.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToRecord = () => {
    if (!currentPatient || !generatedEvolution) return;

    const evolutionObj: ClinicalEvolution = {
      id: `evo-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      profile,
      title: 'Atendimento via Telemedicina HD (E2EE)',
      content: generatedEvolution,
      professionalName: professionalData.name,
      councilId: `${professionalData.council} ${professionalData.councilNumber}`,
      sessionModality: 'telemedicina',
    };

    onSaveEvolutionToPatient(currentPatient.id, evolutionObj);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopyEvolution = () => {
    navigator.clipboard.writeText(generatedEvolution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)] max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
      
      {/* Top Clinical Video Bar with Primary End Call Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 mb-3 rounded-2xl bg-[#120b24] border border-[#2a1b4e] shadow-lg sticky top-16 sm:top-20 z-30 backdrop-blur-md">
        
        {/* Call Security & Status */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            inCall ? 'bg-[#0b0616] border-emerald-500/40 text-emerald-400' : 'bg-pink-950/40 border-pink-500/40 text-[#ff007f]'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white">
                Telemedicina HD Criptografada (E2EE)
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                inCall 
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800 animate-pulse' 
                  : 'bg-pink-950 text-[#ff80bf] border-pink-800'
              }`}>
                {inCall ? '• Em Atendimento Ao Vivo' : 'Chamada Encerrada'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-300/70">
              <span>CFP Res. 04/2020 & CFM 2.314/2022</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-mono">1080p 60fps • 18ms</span>
            </div>
          </div>
        </div>

        {/* Patient Switcher, WhatsApp Share, Mode Toggle & PRIMARY END CALL BUTTON */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          
          {/* Select Active Patient */}
          <div className="flex items-center gap-1.5 bg-[#0b0616] border border-[#2a1b4e] px-3 py-1.5 rounded-xl text-xs">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400 font-medium">Paciente:</span>
            <select
              id="telemed-patient-select"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
            >
              {patients.length > 0 ? (
                patients.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#120b24] text-white">
                    {p.name} ({p.age} anos)
                  </option>
                ))
              ) : (
                <option value="" className="bg-[#120b24] text-purple-300">
                  Sala de Espera Virtual
                </option>
              )}
            </select>
          </div>

          {/* WhatsApp / Room Link Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all"
            title="Gerar Link Válido e Enviar no WhatsApp do Paciente"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Split-Screen Mode Toggle */}
          <button
            id="toggle-splitscreen-btn"
            onClick={() => setSplitScreenMode(!splitScreenMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              splitScreenMode
                ? 'bg-[#bf5af2]/20 border-[#bf5af2] text-white shadow-[0_0_12px_rgba(191,90,242,0.3)]'
                : 'bg-[#0b0616] border-[#2a1b4e] text-slate-300 hover:text-white'
            }`}
            title="Alternar Modo Split-Screen (Tela Dividida: Vídeo + Anotações simultâneas)"
          >
            <Columns className="w-3.5 h-3.5 text-[#ff007f]" />
            <span className="hidden sm:inline">Split-Screen</span>
          </button>

          {/* Call Timer Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b0616] border border-[#2a1b4e] font-mono text-xs text-white">
            <Clock className="w-3.5 h-3.5 text-[#bf5af2]" />
            <span className="font-bold">{formatTimer(callSeconds)}</span>
            <span className="text-purple-400/60">/ 50:00</span>
          </div>

          {/* TOP PRIMARY CALL ACTION BUTTON (ALWAYS VISIBLE AT TOP) */}
          <button
            id="top-end-telemed-call-btn"
            onClick={toggleCall}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shrink-0 ${
              inCall
                ? 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)] border border-red-400/50'
                : 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] hover:brightness-110 text-white shadow-md'
            }`}
            title={inCall ? 'Encerrar Consulta de Vídeo' : 'Iniciar Consulta de Vídeo'}
          >
            <PhoneOff className="w-4 h-4" />
            <span>{inCall ? 'Encerrar Consulta' : 'Iniciar Chamada'}</span>
          </button>

        </div>
      </div>

      {/* Quick Banner with Valid Link for Rapid Copying */}
      <div className="mb-3 px-4 py-2.5 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <LinkIcon className="w-4 h-4 text-[#bf5af2] shrink-0" />
          <span className="text-purple-300/80 shrink-0 font-medium">Link Real da Sala:</span>
          <span className="font-mono text-[#bf5af2] truncate max-w-xs sm:max-w-md bg-[#120b24] px-2 py-0.5 rounded border border-[#2a1b4e]">
            {validRoomUrl}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-2.5 py-1 rounded-lg bg-[#1a0f35] hover:bg-[#25154d] text-purple-200 font-semibold flex items-center gap-1 border border-[#3b2370] transition-all"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
          </button>
          <button
            onClick={handleOpenWhatsApp}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition-all"
          >
            <Send className="w-3 h-3" />
            <span>Abrir no WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Split-Screen Grid Layout */}
      <div className={`flex-1 grid gap-3 ${splitScreenMode ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* LEFT COLUMN: Video Stream Window */}
        <div className={`flex flex-col rounded-2xl bg-[#0b0616] border border-[#2a1b4e] overflow-hidden shadow-2xl relative ${
          splitScreenMode ? 'lg:col-span-7' : 'w-full'
        }`}>
          
          {/* Main Video Viewport */}
          <div className="relative flex-1 bg-gradient-to-b from-[#120b24] to-[#0b0616] flex items-center justify-center overflow-hidden min-h-[360px] sm:min-h-[420px]">
            
            {inCall ? (
              <div className="w-full h-full relative flex items-center justify-center bg-[#0d0718]">
                {currentPatient?.photoUrl ? (
                  <img
                    src={currentPatient.photoUrl}
                    alt={currentPatient.name}
                    className="w-full h-full object-cover brightness-95 contrast-105"
                  />
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <div className="w-24 h-24 rounded-3xl bg-[#1c1236] border-2 border-[#bf5af2]/40 mx-auto flex items-center justify-center shadow-lg">
                      <User className="w-12 h-12 text-[#bf5af2]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {currentPatient?.name || 'Aguardando Paciente'}
                      </h3>
                      <p className="text-xs text-purple-300/70 max-w-xs mx-auto mt-1">
                        {currentPatient 
                          ? 'Sala conectada e aguardando entrada do paciente pelo link do WhatsApp.' 
                          : 'Selecione um paciente ou envie o link da sala virtual.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md hover:brightness-110 flex items-center gap-2 mx-auto"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Convidar {currentPatient?.name?.split(' ')[0] || 'Paciente'} via WhatsApp</span>
                    </button>
                  </div>
                )}

                {/* Patient overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#0b0616]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2a1b4e] z-20">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">{currentPatient?.name || 'Paciente'}</span>
                  <span className="text-[10px] text-purple-300/70">(Paciente)</span>
                </div>

                {/* Audio Activity & Quick End Call in top right */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                  <div className="flex items-center gap-1 bg-[#0b0616]/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#2a1b4e]">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <div className="flex gap-0.5 items-end h-3">
                      <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.1s]" />
                      <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.2s]" />
                    </div>
                  </div>

                  <button
                    onClick={toggleCall}
                    className="p-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-600/50 text-red-300 hover:text-white transition-all shadow-md"
                    title="Encerrar Consulta"
                  >
                    <PhoneOff className="w-4 h-4" />
                  </button>
                </div>

                {/* PiP (Picture-in-Picture): Professional Camera */}
                <div className="absolute top-16 right-4 sm:top-auto sm:bottom-20 sm:right-4 w-28 sm:w-40 aspect-video rounded-xl overflow-hidden border-2 border-[#bf5af2] shadow-[0_0_20px_rgba(191,90,242,0.4)] bg-[#120b24] z-20">
                  {cameraEnabled ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0b0616] text-purple-400/60 p-2 text-center">
                      <VideoOff className="w-5 h-5 mb-1 text-[#ff007f]" />
                      <span className="text-[9px]">Câmera Off</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                    Você ({professionalData.name.split(' ')[0]})
                  </div>
                </div>

                {/* FLOATING IN-VIDEO CONTROLS TOOLBAR (ALWAYS VISIBLE OVER VIDEO) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#0a0516]/90 backdrop-blur-xl p-2 rounded-2xl border border-[#3b2064] shadow-[0_10px_30px_rgba(0,0,0,0.8)] max-w-[95%]">
                  <button
                    onClick={toggleMic}
                    className={`p-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      micEnabled
                        ? 'bg-[#150a2b] text-purple-200 hover:text-white border border-[#351b5e]'
                        : 'bg-pink-950 text-[#ff007f] border border-pink-700 shadow-[0_0_10px_rgba(255,0,127,0.3)]'
                    }`}
                    title={micEnabled ? 'Desativar Microfone' : 'Ativar Microfone'}
                  >
                    {micEnabled ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
                    <span className="hidden md:inline">{micEnabled ? 'Mic On' : 'Mutado'}</span>
                  </button>

                  <button
                    onClick={toggleCamera}
                    className={`p-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      cameraEnabled
                        ? 'bg-[#150a2b] text-purple-200 hover:text-white border border-[#351b5e]'
                        : 'bg-pink-950 text-[#ff007f] border border-pink-700 shadow-[0_0_10px_rgba(255,0,127,0.3)]'
                    }`}
                    title={cameraEnabled ? 'Desligar Câmera' : 'Ligar Câmera'}
                  >
                    {cameraEnabled ? <Video className="w-4 h-4 text-[#bf5af2]" /> : <VideoOff className="w-4 h-4" />}
                    <span className="hidden md:inline">{cameraEnabled ? 'Câmera On' : 'Câmera Off'}</span>
                  </button>

                  <button
                    onClick={toggleScreenShare}
                    className={`p-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isScreenSharing
                        ? 'bg-[#bf5af2] text-white shadow-md'
                        : 'bg-[#150a2b] text-purple-200 hover:text-white border border-[#351b5e]'
                    }`}
                    title="Compartilhar Tela com o Paciente"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden lg:inline">Compartilhar</span>
                  </button>

                  {/* FLOATING END CALL BUTTON INSIDE VIDEO TOOLBAR */}
                  <button
                    id="floating-end-telemed-call-btn"
                    onClick={toggleCall}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] border border-red-400 transition-all active:scale-95"
                    title="Encerrar Consulta Imediatamente"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span className="font-extrabold tracking-wide">Encerrar Consulta</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-pink-950/60 border border-pink-500/40 mx-auto flex items-center justify-center text-[#ff007f]">
                  <PhoneOff className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Consulta Encerrada</h3>
                <p className="text-xs text-purple-300/70 max-w-sm">
                  A gravação da sessão e as anotações clínicas foram salvas com segurança no prontuário.
                </p>
                <button
                  onClick={() => setInCall(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-lg hover:brightness-110 flex items-center gap-2 mx-auto"
                >
                  <Video className="w-4 h-4" />
                  <span>Reconectar Chamada</span>
                </button>
              </div>
            )}

          </div>

          {/* Bottom Call Controls Toolbar (Secondary / Desktop Footer) */}
          <div className="p-3 bg-[#120b24] border-t border-[#2a1b4e] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMic}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  micEnabled
                    ? 'bg-[#0b0616] text-purple-200 hover:text-white border border-[#2a1b4e]'
                    : 'bg-pink-950 text-[#ff007f] border border-pink-700 shadow-[0_0_10px_rgba(255,0,127,0.3)]'
                }`}
                title={micEnabled ? 'Desativar Microfone' : 'Ativar Microfone'}
              >
                {micEnabled ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{micEnabled ? 'Microfone On' : 'Mutado'}</span>
              </button>

              <button
                onClick={toggleCamera}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  cameraEnabled
                    ? 'bg-[#0b0616] text-purple-200 hover:text-white border border-[#2a1b4e]'
                    : 'bg-pink-950 text-[#ff007f] border border-pink-700 shadow-[0_0_10px_rgba(255,0,127,0.3)]'
                }`}
                title={cameraEnabled ? 'Desligar Câmera' : 'Ligar Câmera'}
              >
                {cameraEnabled ? <Video className="w-4 h-4 text-[#bf5af2]" /> : <VideoOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{cameraEnabled ? 'Câmera On' : 'Câmera Off'}</span>
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isScreenSharing
                    ? 'bg-[#bf5af2] text-white shadow-md'
                    : 'bg-[#0b0616] text-purple-200 hover:text-white border border-[#2a1b4e]'
                }`}
                title="Compartilhar Tela com o Paciente"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden md:inline">Compartilhar</span>
              </button>
            </div>

            {/* End Call Button in Footer */}
            <button
              id="end-telemed-call-btn"
              onClick={toggleCall}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                inCall
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                  : 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-md'
              }`}
            >
              <PhoneOff className="w-4 h-4" />
              <span>{inCall ? 'Encerrar Consulta' : 'Iniciar Chamada'}</span>
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Real-time Notes & Alegra Evolution Engine */}
        {splitScreenMode && (
          <div className="lg:col-span-5 flex flex-col rounded-2xl bg-[#120b24] border border-[#2a1b4e] overflow-hidden shadow-2xl">
            
            {/* Tabs Selector */}
            <div className="flex items-center justify-between border-b border-[#2a1b4e] bg-[#0b0616] p-1.5">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSideTab('anotacoes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sideTab === 'anotacoes'
                      ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-md'
                      : 'text-purple-300/70 hover:text-white'
                  }`}
                >
                  Anotações da Sessão
                </button>
                <button
                  onClick={() => setSideTab('prontuario')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sideTab === 'prontuario'
                      ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-md'
                      : 'text-purple-300/70 hover:text-white'
                  }`}
                >
                  Histórico Clínico
                </button>
                <button
                  onClick={() => setSideTab('whatsapp_link')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    sideTab === 'whatsapp_link'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-emerald-400 hover:text-white'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Link</span>
                </button>
              </div>

              <div className="flex items-center gap-1 px-2 text-[10px] text-purple-400 font-mono">
                <span>E2EE Prontuário</span>
              </div>
            </div>

            {/* TAB 1: Live Notes & AI Evolution */}
            {sideTab === 'anotacoes' && (
              <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto">
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#bf5af2]" />
                      <span>Notas Clínicas em Tempo Real</span>
                    </label>
                    <span className="text-[10px] text-purple-300/60 font-mono">
                      {sessionNotes.length} caracteres
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Digite anotações rápidas durante o atendimento (ex: queixas, intervenções, estado mental, medicações)..."
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-3 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-[#bf5af2] resize-none"
                  />
                </div>

                {/* AI Transformation Button */}
                <button
                  id="generate-evolution-ai-btn"
                  onClick={handleGenerateEvolution}
                  disabled={isGenerating || !sessionNotes.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isGenerating 
                      ? 'Alegra AI Estruturando Evolução Técnica...' 
                      : profile === 'psicologo' 
                        ? 'Gerar Evolução CFP (Res. 01/2009)' 
                        : 'Gerar Evolução Médica CFM (SOAP)'}
                  </span>
                </button>

                {/* Generated Evolution Container */}
                {generatedEvolution && (
                  <div className="flex-1 rounded-xl bg-[#0b0616] border border-[#bf5af2]/50 p-3.5 space-y-3 shadow-inner flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
                        <span className="flex items-center gap-1 text-[#bf5af2]">
                          <Brain className="w-3.5 h-3.5" />
                          <span>Evolução Gerada por Inteligência Clínica</span>
                        </span>
                        <span className="text-emerald-400 font-mono">Conforme {profile === 'psicologo' ? 'CFP 01/2009' : 'CFM SOAP'}</span>
                      </div>
                      
                      <div className="text-xs text-purple-100/90 leading-relaxed font-sans max-h-48 overflow-y-auto pr-1">
                        <div className="markdown-body">
                          <ReactMarkdown>{generatedEvolution}</ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#2a1b4e] flex items-center justify-between gap-2">
                      <button
                        onClick={handleCopyEvolution}
                        className="px-3 py-1.5 rounded-lg bg-[#1a0f35] hover:bg-[#25154d] text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copiado' : 'Copiar'}</span>
                      </button>

                      <button
                        onClick={handleSaveToRecord}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{saveSuccess ? 'Salvo no Prontuário!' : 'Assinar & Salvar'}</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: Patient Record Quick Peek */}
            {sideTab === 'prontuario' && (
              <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
                {currentPatient ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#0b0616] rounded-xl border border-[#2a1b4e] space-y-1">
                      <div className="text-purple-400 font-bold uppercase text-[10px]">Diagnóstico & CID-11</div>
                      <div className="text-white font-semibold">{currentPatient.diagnosisHypothesis}</div>
                    </div>

                    <div className="p-3 bg-[#0b0616] rounded-xl border border-[#2a1b4e] space-y-1">
                      <div className="text-purple-400 font-bold uppercase text-[10px]">Medicações em Uso</div>
                      <div className="text-white">
                        {currentPatient.medications && currentPatient.medications.length > 0 ? currentPatient.medications.join(', ') : 'Nenhuma medicação informada.'}
                      </div>
                    </div>

                    <div className="p-3 bg-[#0b0616] rounded-xl border border-[#2a1b4e] space-y-1">
                      <div className="text-purple-400 font-bold uppercase text-[10px]">Última Evolução Clínica Registrada</div>
                      {currentPatient.evolutions && currentPatient.evolutions.length > 0 ? (
                        <p className="text-purple-200/80 leading-relaxed text-[11px]">
                          {currentPatient.evolutions[0].content || currentPatient.evolutions[0].title}
                        </p>
                      ) : (
                        <p className="text-purple-400/50 text-[11px]">Nenhuma evolução anterior.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-purple-300/60">
                    Nenhum paciente selecionado para visualização de prontuário.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: WhatsApp & Room Link Hub */}
            {sideTab === 'whatsapp_link' && (
              <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#0b0616] border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5 text-emerald-400">
                      <MessageCircle className="w-4 h-4" />
                      Convite Direto de WhatsApp
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">1-Clique</span>
                  </div>
                  <p className="text-purple-300/70 text-[11px]">
                    Envie o link oficial e seguro diretamente no WhatsApp de <strong className="text-white">{currentPatient?.name}</strong>.
                  </p>
                  <button
                    onClick={handleOpenWhatsApp}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Disparar Mensagem para {currentPatient?.phone || 'Paciente'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-purple-300 font-semibold block text-[11px]">
                    Link Seguro da Sala Virtual:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={validRoomUrl}
                      className="flex-1 bg-[#0b0616] border border-[#2a1b4e] rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-2 rounded-xl bg-[#1a0f35] hover:bg-[#25154d] border border-[#3b2370] text-purple-200 font-semibold shrink-0"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-purple-300 font-semibold block text-[11px]">
                    Texto Completo Formatado para o WhatsApp:
                  </label>
                  <textarea
                    readOnly
                    rows={6}
                    value={whatsappMessage}
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-3 text-[11px] text-purple-200 font-sans focus:outline-none resize-none"
                  />
                  <button
                    onClick={handleCopyMessage}
                    className="w-full py-2 rounded-xl bg-[#1a0f35] hover:bg-[#25154d] border border-[#3b2370] text-purple-200 font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    {copiedMsg ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedMsg ? 'Mensagem Copiada!' : 'Copiar Texto da Mensagem'}</span>
                  </button>
                </div>

                {onOpenPatientRoom && (
                  <button
                    onClick={() => onOpenPatientRoom(customRoomCode, currentPatient?.name || 'Paciente')}
                    className="w-full py-2 rounded-xl bg-[#0b0616] hover:bg-[#1a0f35] border border-[#2a1b4e] text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#bf5af2]" />
                    <span>Visualizar Experiência do Paciente na Sala</span>
                  </button>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* WHATSAPP SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#120b24] border border-[#bf5af2] p-6 shadow-2xl relative space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#2a1b4e] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Enviar Link da Sala de Telemedicina
                  </h3>
                  <p className="text-xs text-purple-300/70">
                    Acesso imediato criptografado para {currentPatient?.name || 'Paciente'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-xl text-purple-300 hover:text-white hover:bg-[#1a0f35]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient Selector */}
            <div className="space-y-1.5 text-xs">
              <label className="text-purple-300 font-bold block">
                Paciente Destinatário:
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-[#0b0616] border border-[#2a1b4e] focus:border-[#bf5af2] rounded-xl p-2.5 text-white font-semibold"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — WhatsApp: {p.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Real Link URL Card */}
            <div className="p-3.5 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-purple-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#bf5af2]" />
                  Link Válido da Sala Virtual (E2EE)
                </span>
                <span className="text-emerald-400 text-[10px] font-mono">CFP Res. 04/2020</span>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={validRoomUrl}
                  className="flex-1 bg-[#120b24] border border-[#2a1b4e] rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white font-bold text-xs flex items-center gap-1 shrink-0 shadow-md hover:brightness-110"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Message Preview */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <label className="text-purple-300 font-bold">
                  Mensagem Pronta para o WhatsApp:
                </label>
                <button
                  onClick={handleCopyMessage}
                  className="text-xs text-[#bf5af2] hover:underline font-semibold flex items-center gap-1"
                >
                  {copiedMsg ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedMsg ? 'Mensagem copiada!' : 'Copiar texto'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#0b0616] border border-[#2a1b4e] rounded-2xl max-h-36 overflow-y-auto text-[11px] text-purple-200 font-sans whitespace-pre-line leading-relaxed">
                {whatsappMessage}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleOpenWhatsApp}
                className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Abrir e Enviar no WhatsApp Agora</span>
              </button>

              {onOpenPatientRoom && (
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    onOpenPatientRoom(customRoomCode, currentPatient?.name || 'Paciente');
                  }}
                  className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-[#1a0f35] hover:bg-[#25154d] border border-[#3b2370] text-purple-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#bf5af2]" />
                  <span>Testar Sala</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
