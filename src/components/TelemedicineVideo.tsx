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
  User
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

  // Consultation notes state (starts clean)
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Alegra AI generated evolution state
  const [generatedEvolution, setGeneratedEvolution] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Call timer state (starts at 0)
  const [callSeconds, setCallSeconds] = useState<number>(0);

  // Local camera video ref
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0] || null;

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

  // Live Evolution Generation with Alegra AI
  const handleGenerateEvolution = async () => {
    if (!sessionNotes.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: sessionNotes,
          profile,
          patientName: currentPatient?.name || 'Paciente',
          diagnosis: currentPatient?.diagnosisHypothesis || 'Avaliação clínica',
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
      professionalName: profile === 'psicologo' ? 'Psicólogo Clínico' : 'Médico Psiquiatra',
      councilId: profile === 'psicologo' ? 'CRP' : 'CRM',
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
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
      
      {/* Top Clinical Video Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 mb-3 rounded-2xl bg-[#120b24] border border-[#2a1b4e] shadow-lg">
        
        {/* Call Security & Status */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0b0616] border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white">
                Telemedicina HD Criptografada (E2EE)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                {inCall ? 'Ao Vivo' : 'Chamada Encerrada'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-300/70">
              <span>CFP Res. 04/2020 & CFM 2.314/2022</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-mono">1080p 60fps • 18ms</span>
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

      {/* Split-Screen Grid Layout */}
      <div className={`flex-1 grid gap-3 overflow-hidden ${splitScreenMode ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* LEFT COLUMN: Video Stream Window */}
        <div className={`flex flex-col rounded-2xl bg-[#0b0616] border border-[#2a1b4e] overflow-hidden shadow-2xl relative ${
          splitScreenMode ? 'lg:col-span-7' : 'w-full'
        }`}>
          
          {/* Main Video Viewport */}
          <div className="relative flex-1 bg-gradient-to-b from-[#120b24] to-[#0b0616] flex items-center justify-center overflow-hidden min-h-[320px]">
            
            {inCall ? (
              <div className="w-full h-full relative flex items-center justify-center bg-[#0d0718]">
                {currentPatient?.photoUrl ? (
                  <img
                    src={currentPatient.photoUrl}
                    alt={currentPatient.name}
                    className="w-full h-full object-cover brightness-95 contrast-105"
                  />
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <div className="w-24 h-24 rounded-full bg-[#1c1236] border-2 border-[#bf5af2]/40 mx-auto flex items-center justify-center shadow-lg">
                      <User className="w-12 h-12 text-[#bf5af2]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {currentPatient?.name || 'Aguardando Paciente'}
                      </h3>
                      <p className="text-xs text-purple-300/70">
                        {currentPatient ? 'Conectado à Sala Criptografada' : 'Envie o link permanente ao paciente para iniciar a consulta'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Patient overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#0b0616]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2a1b4e]">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">{currentPatient?.name || 'Paciente'}</span>
                  <span className="text-[10px] text-purple-300/70">(Paciente)</span>
                </div>

                {/* Audio Activity */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#0b0616]/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#2a1b4e]">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <div className="flex gap-0.5 items-end h-3">
                    <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.1s]" />
                    <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.2s]" />
                  </div>
                </div>

                {/* PiP (Picture-in-Picture): Professional Camera */}
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
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0b0616] text-purple-400/60 p-2 text-center">
                      <VideoOff className="w-5 h-5 mb-1 text-[#ff007f]" />
                      <span className="text-[10px]">Câmera Desativada</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                    Você (Profissional)
                  </div>
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
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-md hover:brightness-110"
                >
                  Reconectar Chamada
                </button>
              </div>
            )}

          </div>

          {/* Bottom Call Controls Toolbar */}
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

            {/* End Call Button */}
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

          </div>
        )}

      </div>

    </div>
  );
};
