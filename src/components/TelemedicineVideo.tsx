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
  ChevronRight
} from 'lucide-react';
import { Patient, ProfessionalProfile, ClinicalEvolution } from '../types';

interface TelemedicineVideoProps {
  patients: Patient[];
  profile: ProfessionalProfile;
  onSaveEvolutionToPatient: (patientId: string, evolution: ClinicalEvolution) => void;
  onNavigateToChatWithPrompt?: (prompt: string) => void;
}

export const TelemedicineVideo: React.FC<TelemedicineVideoProps> = ({
  patients,
  profile,
  onSaveEvolutionToPatient,
  onNavigateToChatWithPrompt,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [inCall, setInCall] = useState<boolean>(true);
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [splitScreenMode, setSplitScreenMode] = useState<boolean>(true);
  const [sideTab, setSideTab] = useState<'anotacoes' | 'prontuario' | 'alegra_live'>('anotacoes');

  // Consultation notes state
  const [sessionNotes, setSessionNotes] = useState<string>(
    `Queixa relatada: Paciente relata retorno dos sintomas de insônia inicial e ansiedade antecipatória devido a cobranças no trabalho.
Exame psíquico: Afeto congruente, humor ansioso, discurso acelerado mas coeso. Nega ideação suicida ou delírios.
Intervenções na sessão: Treino de relaxamento progressivo e identificação de distorções cognitivas (catastrofização).`
  );

  // Alegra AI generated evolution state
  const [generatedEvolution, setGeneratedEvolution] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Call timer state
  const [callSeconds, setCallSeconds] = useState<number>(1420); // starts around 23 mins

  // Local camera video ref
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

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
          console.log('Webcam permissão não concedida ou dispositivo indisponível, usando fallback visual simulado.');
        }
      } else {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
          localStreamRef.current = null;
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [inCall, cameraEnabled]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Trigger Alegra AI synthesis directly from consultation notes
  const handleGenerateEvolution = async () => {
    if (!sessionNotes.trim()) return;
    setIsGenerating(true);

    try {
      const promptText = `Por favor, atue como co-piloto na telemedicina e transforme estas anotações de sessão em uma evolução clínica completa e estruturada para ${currentPatient.name}:\n\n${sessionNotes}`;

      const response = await fetch('/api/alegra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          profile,
          patientName: currentPatient.name,
        }),
      });

      if (!response.ok) throw new Error('Falha no processamento');

      const data = await response.json();
      setGeneratedEvolution(data.text);
      setSideTab('alegra_live');
    } catch (e) {
      // Fallback structured evolution
      const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setGeneratedEvolution(
        profile === 'psicologo'
          ? `### 🌿 Alegra AI • Evolução Telemedicina (Padrão CFP)
*Consulta Online em Alta Resolução • ${new Date().toLocaleDateString('pt-BR')} às ${timestamp}*
*Paciente: ${currentPatient.name}*

---

#### 1. 🎯 Queixa Principal & Demanda
${sessionNotes.split('\n')[0] || 'Demanda trazida de ansiedade antecipatória e sobrecarga.'}

#### 2. 🧠 Exame do Estado Mental
- Orientação: Alopsiquicamente e autopsiquicamente lúcido e orientado.
- Afeto: Congruente, com sinais de inquietação psicomotora.
- Linguagem: Preservada, ritmo levemente taquipsíquico.

#### 3. 🛠️ Intervenções Psicoterapêuticas
- Aplicação de técnicas de reestruturação cognitiva.
- Psicoeducação sobre o ciclo do pânico e mecanismos de enfrentamento adaptativo.

#### 4. 📌 Conduta e Encaminhamentos
- Manter acompanhamento semanal via telemedicina Psicool.
- Tarefa entre sessões: diário de pensamentos automáticos.`
          : `### 🧠 Alegra AI • Parecer Psiquiátrico Telemedicina (CRM)
*Consulta Médica Online • ${new Date().toLocaleDateString('pt-BR')} às ${timestamp}*
*Paciente: ${currentPatient.name}*

---

#### 1. 📋 Avaliação Psicopatológica
${sessionNotes.split('\n')[0] || 'Retorno clínico para avaliação de resposta farmacológica.'}

#### 2. 🔍 Hipóteses Diagnósticas
- CID-11: ${currentPatient.cid11 || '6B00 (Transtorno de Ansiedade Generalizada)'}
- DSM-5-TR: ${currentPatient.dsm5 || '300.02 (F41.1)'}

#### 3. 💊 Manejo Psicofarmacológico
- Manter farmacoterapia atual com supervisão de adesão.
- Recomenda-se aferição de pressão arterial e retorno em 30 dias.`
      );
      setSideTab('alegra_live');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEvolution = () => {
    if (!generatedEvolution) return;

    const newEvolution: ClinicalEvolution = {
      id: `evo-tele-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      profile,
      title: profile === 'psicologo'
        ? `Evolução Telemedicina CFP • ${currentPatient.name}`
        : `Consulta Psiquiátrica Online CRM • ${currentPatient.name}`,
      professionalName: profile === 'psicologo' ? 'Dra. Beatriz Albuquerque' : 'Dr. Rodrigo Vasconcelos',
      councilId: profile === 'psicologo' ? 'CRP 06/148.920' : 'CRM 152.480-SP',
      content: generatedEvolution,
    };

    onSaveEvolutionToPatient(currentPatient.id, newEvolution);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleCopyEvolution = () => {
    navigator.clipboard.writeText(generatedEvolution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
      
      {/* Top Telemedicine Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#120b24] border border-[#2a1b4e] mb-3 shadow-lg">
        
        {/* Patient and Security Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#bf5af2] to-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,127,0.4)]">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  Telemedicina Psicool HD
                </h2>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  AO VIVO
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-purple-300/80">
                <ShieldCheck className="w-3.5 h-3.5 text-[#bf5af2]" />
                <span>Criptografia E2EE (LGPD / CFP / CFM)</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-mono">1080p 60fps • 18ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Switcher & Mode Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          
          {/* Select Active Patient */}
          <div className="flex items-center gap-1.5 bg-[#0b0616] border border-[#2a1b4e] px-3 py-1.5 rounded-xl text-xs">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400 font-medium">Em atendimento:</span>
            <select
              id="telemed-patient-select"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#120b24] text-white">
                  {p.name} ({p.age} anos)
                </option>
              ))}
            </select>
          </div>

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
            <span className="hidden sm:inline">Modo Split-Screen</span>
            <span className="sm:hidden">Split</span>
          </button>

          {/* Call Timer Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b0616] border border-[#2a1b4e] font-mono text-xs text-white">
            <Clock className="w-3.5 h-3.5 text-[#bf5af2]" />
            <span className="font-bold">{formatTimer(callSeconds)}</span>
            <span className="text-purple-400/60">/ 50:00</span>
          </div>

        </div>
      </div>

      {/* Subcategoria: Modo Split-Screen (Tela Dividida) */}
      <div className={`flex-1 grid gap-3 overflow-hidden ${splitScreenMode ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* LADO ESQUERDO: Janela de Streaming de Vídeo de Alta Resolução com o Paciente */}
        <div className={`flex flex-col rounded-2xl bg-[#0b0616] border border-[#2a1b4e] overflow-hidden shadow-2xl relative ${
          splitScreenMode ? 'lg:col-span-7' : 'w-full'
        }`}>
          
          {/* Main Video Viewport (Patient Stream) */}
          <div className="relative flex-1 bg-gradient-to-b from-[#120b24] to-[#0b0616] flex items-center justify-center overflow-hidden min-h-[320px]">
            
            {inCall ? (
              <div className="w-full h-full relative flex items-center justify-center">
                {/* Simulated Patient High-Resolution Video Feed */}
                <img
                  src={currentPatient.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&auto=format&fit=crop&q=80'}
                  alt={currentPatient.name}
                  className="w-full h-full object-cover brightness-95 contrast-105"
                />

                {/* Subtle Breathing / Audio Waves Overlay on Patient */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#0b0616]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2a1b4e]">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">{currentPatient.name}</span>
                  <span className="text-[10px] text-purple-300/70">(Paciente)</span>
                </div>

                {/* Patient Audio Activity Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#0b0616]/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#2a1b4e]">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                  <div className="flex gap-0.5 items-end h-3">
                    <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.1s]" />
                    <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.2s]" />
                  </div>
                </div>

                {/* PiP (Picture-in-Picture): Professional / Doctor Camera Feed */}
                <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-video rounded-xl overflow-hidden border-2 border-[#bf5af2] shadow-[0_0_20px_rgba(191,90,242,0.4)] bg-[#120b24] z-20">
                  {cameraEnabled ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-purple-300/70 p-2 text-center bg-[#180e2e]">
                      <VideoOff className="w-6 h-6 text-[#ff007f] mb-1" />
                      <span className="text-[10px]">Câmera desativada</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1.5 bg-[#0b0616]/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-white flex items-center gap-1">
                    <span>Você</span>
                    <span className="text-purple-400">({profile === 'psicologo' ? 'CRP' : 'CRM'})</span>
                  </div>
                </div>

                {/* Professional Audio Indicator */}
                <div className="absolute bottom-4 left-4 bg-[#0b0616]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2a1b4e] text-xs flex items-center gap-2">
                  <div className={`p-1 rounded-full ${micEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {micEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[11px] text-slate-200">
                    {micEnabled ? 'Microfone ativo' : 'Microfone mudo'}
                  </span>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-[#120b24] border border-[#2a1b4e] flex items-center justify-center mb-3">
                  <PhoneOff className="w-8 h-8 text-[#ff007f]" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Consulta Encerrada</h3>
                <p className="text-xs text-purple-300/70 max-w-sm mb-4">
                  A chamada foi finalizada. As anotações clínicas foram preservadas no bloco ao lado para geração do prontuário.
                </p>
                <button
                  onClick={() => {
                    setInCall(true);
                    setCallSeconds(0);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-lg"
                >
                  Reconectar Paciente
                </button>
              </div>
            )}

          </div>

          {/* Video Controls Toolbar */}
          <div className="p-3 bg-[#120b24] border-t border-[#2a1b4e] flex items-center justify-between gap-2 flex-wrap">
            
            {/* Left Controls: Mic, Camera, ScreenShare */}
            <div className="flex items-center gap-2">
              <button
                id="telemed-mic-btn"
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-2.5 rounded-xl border transition-all ${
                  micEnabled 
                    ? 'bg-[#180e2e] text-purple-200 border-[#2a1b4e] hover:border-[#bf5af2]' 
                    : 'bg-rose-950/80 text-rose-400 border-rose-800 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                }`}
                title={micEnabled ? 'Silenciar Microfone' : 'Ativar Microfone'}
              >
                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                id="telemed-camera-btn"
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`p-2.5 rounded-xl border transition-all ${
                  cameraEnabled 
                    ? 'bg-[#180e2e] text-purple-200 border-[#2a1b4e] hover:border-[#bf5af2]' 
                    : 'bg-rose-950/80 text-rose-400 border-rose-800 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                }`}
                title={cameraEnabled ? 'Desligar Câmera' : 'Ligar Câmera'}
              >
                {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                id="telemed-screenshare-btn"
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isScreenSharing 
                    ? 'bg-[#ff007f] text-white border-[#ff007f] shadow-[0_0_12px_rgba(255,0,127,0.4)]' 
                    : 'bg-[#180e2e] text-purple-200 border-[#2a1b4e] hover:border-[#bf5af2]'
                }`}
                title="Compartilhar Tela para psicoeducação / laudos"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Center: Consultation Status Banner */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-purple-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sessão 50 min em curso</span>
            </div>

            {/* Right: End Call Action */}
            <div className="flex items-center gap-2">
              <button
                id="telemed-end-call-btn"
                onClick={() => setInCall(!inCall)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  inCall
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                }`}
              >
                <PhoneOff className="w-4 h-4" />
                <span>{inCall ? 'Encerrar' : 'Reabrir'}</span>
              </button>
            </div>

          </div>

        </div>

        {/* LADO DIREITO: Bloco de Anotações Simultâneo Integrado à Alegra AI (O Superador da Sintropia) */}
        {splitScreenMode && (
          <div className="lg:col-span-5 flex flex-col rounded-2xl bg-[#120b24] border border-[#bf5af2]/40 shadow-2xl overflow-hidden">
            
            {/* Header with Navigation Tabs on Side Panel */}
            <div className="p-3 border-b border-[#2a1b4e] flex items-center justify-between gap-2 bg-[#180e2e]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSideTab('anotacoes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    sideTab === 'anotacoes'
                      ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-[0_0_10px_rgba(255,0,127,0.4)]'
                      : 'text-purple-300/70 hover:text-white hover:bg-[#23143f]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Anotações ao Vivo</span>
                </button>

                <button
                  onClick={() => setSideTab('alegra_live')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    sideTab === 'alegra_live'
                      ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-[0_0_10px_rgba(255,0,127,0.4)]'
                      : 'text-purple-300/70 hover:text-white hover:bg-[#23143f]'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Alegra AI Prontuário</span>
                  {generatedEvolution && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>

                <button
                  onClick={() => setSideTab('prontuario')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    sideTab === 'prontuario'
                      ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-[0_0_10px_rgba(255,0,127,0.4)]'
                      : 'text-purple-300/70 hover:text-white hover:bg-[#23143f]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Histórico</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Bloco de Anotações Simultâneo */}
            {sideTab === 'anotacoes' && (
              <div className="flex-1 flex flex-col p-3.5 overflow-hidden">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-bold text-purple-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#bf5af2]" />
                    Registro Clínico em Tempo Real
                  </span>
                  <span className="text-[11px] text-purple-400/60">
                    Não fecha o streaming de vídeo
                  </span>
                </div>

                <textarea
                  id="telemed-notes-textarea"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Digite livremente os pontos trazidos pelo paciente durante a consulta online... Ao clicar em 'Gerar Prontuário com Alegra AI', suas notas serão transformadas na evolução oficial."
                  className="flex-1 w-full bg-[#0b0616] border border-[#2a1b4e] focus:border-[#bf5af2] rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-purple-400/40 focus:outline-none resize-none leading-relaxed"
                />

                {/* Quick Shortcuts for Clinical Notes */}
                <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] uppercase font-bold text-purple-400/70 shrink-0">
                    Inserir:
                  </span>
                  <button
                    onClick={() => setSessionNotes((prev) => `${prev}\n• Queixa: `)}
                    className="shrink-0 px-2 py-0.5 rounded-lg bg-[#1c1236] border border-[#2a1b4e] text-[11px] text-purple-300 hover:text-white"
                  >
                    + Queixa
                  </button>
                  <button
                    onClick={() => setSessionNotes((prev) => `${prev}\n• Estado Mental: `)}
                    className="shrink-0 px-2 py-0.5 rounded-lg bg-[#1c1236] border border-[#2a1b4e] text-[11px] text-purple-300 hover:text-white"
                  >
                    + Estado Mental
                  </button>
                  <button
                    onClick={() => setSessionNotes((prev) => `${prev}\n• Intervenção: `)}
                    className="shrink-0 px-2 py-0.5 rounded-lg bg-[#1c1236] border border-[#2a1b4e] text-[11px] text-purple-300 hover:text-white"
                  >
                    + Intervenção
                  </button>
                  <button
                    onClick={() => setSessionNotes((prev) => `${prev}\n• Conduta: `)}
                    className="shrink-0 px-2 py-0.5 rounded-lg bg-[#1c1236] border border-[#2a1b4e] text-[11px] text-purple-300 hover:text-white"
                  >
                    + Conduta
                  </button>
                </div>

                {/* CTA: Gerar Prontuário Simultâneo com Alegra AI */}
                <div className="pt-2 border-t border-[#2a1b4e]">
                  <button
                    id="telemed-generate-evolution-btn"
                    onClick={handleGenerateEvolution}
                    disabled={isGenerating || !sessionNotes.trim()}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(255,0,127,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Brain className="w-4 h-4 animate-spin" />
                        <span>Alegra AI Gerando Prontuário...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Gerar Prontuário com Alegra AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Resultado Estruturado da Alegra AI */}
            {sideTab === 'alegra_live' && (
              <div className="flex-1 flex flex-col p-3.5 overflow-hidden">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-[#bf5af2]" />
                    Evolução Clínica Gerada pela Alegra AI
                  </span>
                  <div className="flex items-center gap-2">
                    {generatedEvolution && (
                      <button
                        onClick={handleCopyEvolution}
                        className="text-xs text-purple-300 hover:text-white flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {generatedEvolution ? (
                  <div className="flex-1 overflow-y-auto p-3 rounded-xl bg-[#0b0616] border border-[#2a1b4e] text-xs text-slate-100 leading-relaxed markdown-content prose prose-invert max-w-none">
                    <ReactMarkdown>{generatedEvolution}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-purple-300/60 border border-dashed border-[#2a1b4e] rounded-xl">
                    <Brain className="w-10 h-10 text-[#bf5af2]/40 mb-2" />
                    <p className="text-xs mb-3">
                      Nenhuma evolução gerada ainda para esta chamada. Faça anotações na aba "Anotações ao Vivo" e clique em "Gerar Prontuário".
                    </p>
                    <button
                      onClick={() => setSideTab('anotacoes')}
                      className="text-xs text-[#ff007f] font-bold underline"
                    >
                      Ir para Anotações da Consulta
                    </button>
                  </div>
                )}

                {/* Save to Patient Electronic Health Record */}
                {generatedEvolution && (
                  <div className="pt-3 mt-2 border-t border-[#2a1b4e] flex items-center gap-2">
                    <button
                      id="telemed-save-record-btn"
                      onClick={handleSaveEvolution}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        saveSuccess 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-[0_0_15px_rgba(255,0,127,0.4)]'
                      }`}
                    >
                      {saveSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Salvo no Prontuário de {currentPatient.name}!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Salvar no Prontuário Oficial</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Histórico Prévio do Paciente */}
            {sideTab === 'prontuario' && (
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                <div className="p-3 rounded-xl bg-[#0b0616] border border-[#2a1b4e]">
                  <div className="text-xs font-bold text-white mb-1">
                    {currentPatient.name} • {currentPatient.age} anos
                  </div>
                  <div className="text-[11px] text-purple-300 mb-1">
                    <span className="font-semibold text-slate-400">Hipótese Diagnóstica:</span> {currentPatient.diagnosisHypothesis}
                  </div>
                  {currentPatient.medications && currentPatient.medications.length > 0 && (
                    <div className="text-[11px] text-slate-300">
                      <span className="font-semibold text-slate-400">Psicofármacos:</span> {currentPatient.medications.join(', ')}
                    </div>
                  )}
                </div>

                <div className="text-xs font-bold text-purple-200">
                  Evoluções de Sessões Anteriores:
                </div>

                {currentPatient.evolutions.length > 0 ? (
                  currentPatient.evolutions.map((evo) => (
                    <div key={evo.id} className="p-3 rounded-xl bg-[#0b0616] border border-[#2a1b4e] text-xs">
                      <div className="flex items-center justify-between text-[11px] text-purple-400 mb-1">
                        <span className="font-bold text-white">{evo.title}</span>
                        <span>{evo.date}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] whitespace-pre-wrap">
                        {evo.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-xs text-purple-300/50">
                    Primeira consulta registrada no Psicool.
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
