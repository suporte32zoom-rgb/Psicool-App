import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  ShieldCheck, 
  MessageSquare, 
  Send, 
  Clock, 
  Lock, 
  Sparkles, 
  User, 
  Volume2, 
  Activity,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  Settings,
  HelpCircle
} from 'lucide-react';
import { ProfessionalData, ProfessionalProfile } from '../types';

interface PatientTelemedPortalProps {
  roomCode: string;
  patientNameParam?: string;
  professionalData: ProfessionalData;
  profile: ProfessionalProfile;
  onExitToDashboard?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'paciente' | 'profissional';
  text: string;
  time: string;
}

export const PatientTelemedPortal: React.FC<PatientTelemedPortalProps> = ({
  roomCode,
  patientNameParam = 'Paciente',
  professionalData,
  profile,
  onExitToDashboard,
}) => {
  const [patientName, setPatientName] = useState(patientNameParam || 'Paciente');
  const [hasEnteredRoom, setHasEnteredRoom] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [callSeconds, setCallSeconds] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'profissional',
      text: `Olá, ${patientName}! Seja bem-vindo(a) à sala virtual segura. O atendimento iniciará em instantes.`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Timer counter
  useEffect(() => {
    let interval: any;
    if (hasEnteredRoom) {
      interval = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasEnteredRoom]);

  // Request webcam & mic for patient
  useEffect(() => {
    let active = true;

    async function startPatientCamera() {
      if (cameraEnabled && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (active && localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localStreamRef.current = stream;
            setPermissionError(null);
          }
        } catch (err: any) {
          console.warn('Permissão de vídeo/áudio não concedida:', err);
          setPermissionError('Permissão para câmera/microfone não autorizada no navegador. Por favor, permita o acesso para participar da videochamada.');
        }
      }
    }

    startPatientCamera();

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraEnabled]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !micEnabled;
      });
    }
    setMicEnabled(!micEnabled);
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !cameraEnabled;
      });
    }
    setCameraEnabled(!cameraEnabled);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `pmsg-${Date.now()}`,
      sender: 'paciente',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    // Simulated doctor response if first message
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `doc-${Date.now()}`,
          sender: 'profissional',
          text: 'Recebido! Já estou conectado com áudio e vídeo ativos. Pode me ouvir e ver normalmente?',
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#070311] text-white flex flex-col selection:bg-[#ff007f] selection:text-white">
      
      {/* Top Header */}
      <header className="px-4 py-3 bg-[#0e071e] border-b border-[#2a1b4e] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#bf5af2] to-[#ff007f] p-0.5 shadow-[0_0_12px_rgba(191,90,242,0.5)]">
            <div className="w-full h-full bg-[#0b0616] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#bf5af2]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide text-white">PSICOOL</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                Sala Criptografada E2EE
              </span>
            </div>
            <p className="text-[11px] text-purple-300/70">
              Telemedicina Segura • Sala: <span className="font-mono text-[#bf5af2]">{roomCode}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onExitToDashboard && (
            <button
              onClick={onExitToDashboard}
              className="px-3 py-1.5 rounded-xl bg-[#1a0f35] hover:bg-[#26154e] border border-[#3c2273] text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Acessar Painel Profissional</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Room Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">
        
        {!hasEnteredRoom ? (
          /* PRE-JOIN LOBBY (Sala de Espera & Teste de Dispositivos) */
          <div className="max-w-xl mx-auto w-full space-y-6">
            
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Sala de Atendimento Online
              </h1>
              <p className="text-sm text-purple-300/80">
                Você foi convidado(a) por <strong className="text-white">{professionalData.name}</strong> ({professionalData.council}: {professionalData.councilNumber}).
              </p>
            </div>

            {/* Video Test Box */}
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-[#120b24] border-2 border-[#2a1b4e] shadow-2xl flex items-center justify-center">
              {cameraEnabled ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-[#1f123b] mx-auto flex items-center justify-center text-purple-400">
                    <VideoOff className="w-7 h-7 text-[#ff007f]" />
                  </div>
                  <p className="text-xs text-purple-300 font-semibold">Câmera desligada</p>
                </div>
              )}

              {/* Patient Name input badge */}
              <div className="absolute top-3 left-3 bg-[#0b0616]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2a1b4e] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">{patientName}</span>
              </div>

              {/* Quick toggle bar on video */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0b0616]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#2a1b4e]">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                    micEnabled ? 'bg-[#1e133a] text-emerald-400' : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                  title={micEnabled ? 'Microfone ativado' : 'Microfone desativado'}
                >
                  {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                    cameraEnabled ? 'bg-[#1e133a] text-[#bf5af2]' : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                  title={cameraEnabled ? 'Câmera ativada' : 'Câmera desativada'}
                >
                  {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {permissionError && (
              <div className="p-3.5 rounded-2xl bg-amber-950/70 border border-amber-800/80 text-xs text-amber-200">
                {permissionError}
              </div>
            )}

            {/* Patient Form & Enter Button */}
            <div className="bg-[#120b24] p-5 rounded-3xl border border-[#2a1b4e] space-y-4 shadow-xl">
              <div>
                <label className="block text-xs font-bold text-purple-300 mb-1.5">
                  Como gostaria de ser chamado(a) na sala?
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] focus:border-[#bf5af2] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#0b0616] border border-[#2a1b4e]/80 flex items-center justify-between text-xs text-purple-300/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Sigilo Ético e Criptografia Ponta a Ponta</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-400">CFP / CFM</span>
              </div>

              <button
                onClick={() => setHasEnteredRoom(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white font-bold text-sm shadow-[0_0_20px_rgba(255,0,127,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>Entrar na Sala Virtual Agora</span>
              </button>
            </div>

          </div>
        ) : (
          /* LIVE ACTIVE CALL VIEW FOR PATIENT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
            
            {/* Left/Main Video Grid */}
            <div className={`flex flex-col rounded-3xl bg-[#0b0616] border border-[#2a1b4e] overflow-hidden shadow-2xl relative ${
              showChat ? 'lg:col-span-8' : 'lg:col-span-12'
            }`}>
              
              {/* Doctor Main Screen */}
              <div className="flex-1 relative bg-gradient-to-b from-[#150d2b] to-[#070311] flex items-center justify-center p-4">
                
                <div className="text-center space-y-3 max-w-sm">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#bf5af2] to-[#ff007f] p-1 mx-auto shadow-2xl">
                    <div className="w-full h-full rounded-[22px] bg-[#0b0616] flex items-center justify-center text-white text-2xl font-bold">
                      {professionalData.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'Dr'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                      <span>{professionalData.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Conectado
                      </span>
                    </h3>
                    <p className="text-xs text-purple-300/80">
                      {professionalData.role} • {professionalData.council}: {professionalData.councilNumber}
                    </p>
                  </div>
                </div>

                {/* Professional Status badge */}
                <div className="absolute top-4 left-4 bg-[#0b0616]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2a1b4e] flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">{professionalData.name}</span>
                  <span className="text-[10px] text-purple-400">(Profissional)</span>
                </div>

                {/* Call Timer */}
                <div className="absolute top-4 right-4 bg-[#0b0616]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2a1b4e] flex items-center gap-2 font-mono text-xs text-white">
                  <Clock className="w-3.5 h-3.5 text-[#bf5af2]" />
                  <span>{formatTimer(callSeconds)}</span>
                </div>

                {/* Patient PiP (Self-view) */}
                <div className="absolute bottom-4 right-4 w-36 sm:w-48 aspect-video rounded-2xl overflow-hidden border-2 border-[#bf5af2] bg-[#120b24] shadow-2xl z-20">
                  {cameraEnabled ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-purple-400/60 bg-[#0b0616] p-2 text-center text-[10px]">
                      <VideoOff className="w-4 h-4 text-[#ff007f] mb-1" />
                      <span>Câmera Off</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                    Você ({patientName})
                  </div>
                </div>

              </div>

              {/* Bottom Control Bar */}
              <div className="p-3 sm:p-4 bg-[#120b24] border-t border-[#2a1b4e] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMic}
                    className={`p-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      micEnabled ? 'bg-[#0b0616] text-emerald-400 border border-[#2a1b4e]' : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    <span className="hidden sm:inline">{micEnabled ? 'Microfone On' : 'Mutado'}</span>
                  </button>

                  <button
                    onClick={toggleCamera}
                    className={`p-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      cameraEnabled ? 'bg-[#0b0616] text-[#bf5af2] border border-[#2a1b4e]' : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    <span className="hidden sm:inline">{cameraEnabled ? 'Câmera On' : 'Câmera Off'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className={`p-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      showChat ? 'bg-[#bf5af2] text-white shadow-md' : 'bg-[#0b0616] text-purple-200 border border-[#2a1b4e]'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Chat ({chatMessages.length})</span>
                  </button>

                  <button
                    onClick={() => setHasEnteredRoom(false)}
                    className="px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Sair da Chamada</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Chat Sidebar for Patient */}
            {showChat && (
              <div className="lg:col-span-4 rounded-3xl bg-[#120b24] border border-[#2a1b4e] flex flex-col overflow-hidden shadow-2xl">
                <div className="p-3.5 border-b border-[#2a1b4e] bg-[#0b0616] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <MessageSquare className="w-4 h-4 text-[#bf5af2]" />
                    <span>Mensagens da Consulta</span>
                  </div>
                  <span className="text-[10px] text-purple-400 font-mono">E2EE Sigiloso</span>
                </div>

                <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs">
                  {chatMessages.map((msg) => {
                    const isMe = msg.sender === 'paciente';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl ${
                          isMe 
                            ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white rounded-tr-none' 
                            : 'bg-[#0b0616] text-purple-100 border border-[#2a1b4e] rounded-tl-none'
                        }`}>
                          <p className="leading-relaxed">{msg.text}</p>
                          <span className={`text-[9px] block mt-1 ${isMe ? 'text-purple-200' : 'text-purple-400/60'}`}>
                            {msg.time} • {isMe ? 'Você' : professionalData.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-[#2a1b4e] bg-[#0b0616] flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 bg-[#120b24] border border-[#2a1b4e] focus:border-[#bf5af2] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white hover:brightness-110"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-2.5 px-4 text-center text-[11px] text-purple-400/60 border-t border-[#2a1b4e]/50">
        Plataforma em conformidade com as resoluções do Conselho Federal de Psicologia (CFP nº 04/2020) e Conselho Federal de Medicina (CFM nº 2.314/2022).
      </footer>

    </div>
  );
};
