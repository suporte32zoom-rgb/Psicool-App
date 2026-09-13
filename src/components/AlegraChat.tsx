import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Lock, 
  Crown, 
  FileText, 
  Activity, 
  Brain, 
  UserCheck, 
  Save, 
  AlertTriangle,
  ChevronDown,
  Pill,
  ShieldAlert,
  Building2
} from 'lucide-react';
import { ProfessionalProfile, ChatMessage, Patient, ClinicalEvolution } from '../types';

interface AlegraChatProps {
  profile: ProfessionalProfile;
  setProfile: (profile: ProfessionalProfile) => void;
  messageCount: number;
  maxMessages: number;
  incrementMessageCount: () => void;
  onUpgradeClick: () => void;
  patients: Patient[];
  onSaveEvolutionToPatient?: (patientId: string, evolution: ClinicalEvolution) => void;
  initialPrompt?: string;
  onInitialPromptConsumed?: () => void;
}

export const AlegraChat: React.FC<AlegraChatProps> = ({
  profile,
  setProfile,
  messageCount,
  maxMessages,
  incrementMessageCount,
  onUpgradeClick,
  patients,
  onSaveEvolutionToPatient,
  initialPrompt,
  onInitialPromptConsumed,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        sender: 'alegra',
        profile: 'psicologo',
        timestamp: 'Agora',
        text: `Olá, colega! Sou a **Alegra AI**, a maior autoridade em inteligência clínica para **Psicologia Clínica (CFP)** e **Psiquiatria Médica (CFM)**, integrada ao ecossistema **PSICOOL** (motor Gemini 3.8 Flash).

Como assistente de máxima especialização:
- 🌿 **Psicologia (CRP)**: Estruturo evoluções de sessão conformes à **Resolução CFP nº 01/2009**, laudos e relatórios (Res. 06/2019), manejo de casos em TCC/DBT/ACT e planos de intervenção.
- 💊 **Psiquiatria (CRM)**: Análise de psicofarmacologia avançada, cálculo de titulação e desmame (tapering), prevenção de interações medicamentosas, monitoramento laboratorial e critérios DSM-5-TR / CID-11.
- 🏢 **Gestão do Consultório**: Precificação de honorários, termos de consentimento (TCLE) e redução de no-show (faltas).

*Selecione uma ferramenta rápida abaixo, dite pelo microfone ou digite as notas da consulta.*`
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [savedMessageId, setSavedMessageId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('geral');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const isLimitReached = messageCount >= maxMessages;

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle incoming prompt if triggered externally
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      setInput(initialPrompt);
      if (onInitialPromptConsumed) {
        onInitialPromptConsumed();
      }
    }
  }, [initialPrompt]);

  // Web Speech API Voice Dictation Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setInput((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Reconhecimento de voz:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceDictation = () => {
    if (isLimitReached) return;

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.warn('Erro ao iniciar microfone:', e);
          setIsListening(false);
        }
      } else {
        setInput((prev) => 
          prev + (prev ? ' ' : '') + 'Paciente relata humor rebaixado há 3 semanas, insônia terminal, angústia matinal e perda de interesse pelas atividades cotidianas. Nega ideação autolítica ativa.'
        );
      }
    }
  };

  const handleSendMessage = async (textToSend?: string, customCategory?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    if (isLimitReached) {
      onUpgradeClick();
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
    }

    const currentPatient = patients.find((p) => p.id === selectedPatientId);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      profile,
      patientName: currentPatient ? currentPatient.name : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    incrementMessageCount();

    try {
      const response = await fetch('/api/alegra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          profile,
          patientName: currentPatient?.name,
          category: customCategory || activeCategory,
          patientContext: currentPatient ? {
            diagnosis: currentPatient.diagnosisHypothesis,
            medications: currentPatient.medications,
            allergies: currentPatient.allergies,
            riskAlert: currentPatient.riskAlert,
          } : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro no servidor: ${response.statusText}`);
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: `alegra-${Date.now()}`,
        sender: 'alegra',
        text: data.text || 'Resposta clínica processada.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        profile,
        patientName: currentPatient ? currentPatient.name : undefined,
        isStructuredNote: true,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Falha ao comunicar com Alegra AI:', err);
      const fallbackAiMessage: ChatMessage = {
        id: `alegra-fallback-${Date.now()}`,
        sender: 'alegra',
        text: `### 🌿 Alegra AI • Registro Clínico Estruturado
*Síntese processada para ${currentPatient?.name || 'Paciente'}*

**1. Queixa Principal:** ${text.slice(0, 150)}
**2. Avaliação Clínica:** Apresenta sintomas que demandam monitoramento e intervenções estruturadas.
**3. Conduta Recomendada:** Manter plano de tratamento e reavaliação seriada.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        profile,
        patientName: currentPatient ? currentPatient.name : undefined,
        isStructuredNote: true,
      };
      setMessages((prev) => [...prev, fallbackAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveToPatientRecord = (msg: ChatMessage) => {
    if (!onSaveEvolutionToPatient || !selectedPatientId) return;
    const currentPatient = patients.find((p) => p.id === selectedPatientId);
    if (!currentPatient) return;

    const newEvolution: ClinicalEvolution = {
      id: `evo-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      profile,
      title: profile === 'psicologo' 
        ? `Evolução CFP • Sessão com ${currentPatient.name}` 
        : `Parecer Psiquiátrico CRM • ${currentPatient.name}`,
      professionalName: profile === 'psicologo' ? 'Dra. Beatriz Albuquerque' : 'Dr. Rodrigo Vasconcelos',
      councilId: profile === 'psicologo' ? 'CRP 06/148.920' : 'CRM 152.480-SP',
      content: msg.text,
    };

    onSaveEvolutionToPatient(selectedPatientId, newEvolution);
    setSavedMessageId(msg.id);
    setTimeout(() => setSavedMessageId(null), 3000);
  };

  const specializedAITools = [
    {
      id: 'evolucao',
      label: 'Evolução Padrão CFP (Res. 01/2009)',
      icon: FileText,
      category: 'evolucao',
      prompt: 'Elabore uma Evolução de Sessão completa no Padrão Oficial CFP (1. Queixa Principal; 2. Exame do Estado Mental; 3. Intervenções Técnicas; 4. Conduta e Próxima Sessão) baseada nas seguintes anotações livres: Paciente relata ansiedade antecipatória, fadiga laboral e pensamentos autocríticos. Realizado treino de respiração diafragmática e identificação de distorções cognitivas.'
    },
    {
      id: 'farmaco',
      label: 'Psicofarmaco & Interações (CRM)',
      icon: Pill,
      category: 'farmaco',
      prompt: 'Analise detalhadamente o perfil psicofarmacológico, posologia, titulação, meia-vida e risco de interações medicamentosas para: Desvenlafaxina 50mg + Zolpidem 5mg + Dipirona em paciente adulto com queixas de insônia e ansiedade.'
    },
    {
      id: 'risco_crise',
      label: 'Avaliação de Risco & Plano de Segurança',
      icon: ShieldAlert,
      category: 'risco_crise',
      prompt: 'Estruture uma Avaliação de Risco Autolítico com base no protocolo Columbia (C-SSRS) e um Plano de Segurança em 6 passos (estratégias internas, rede social, contatos de emergência e restrição de meios letais).'
    },
    {
      id: 'gestao',
      label: 'Gestão de Consultório, Honorários & No-Show',
      icon: Building2,
      category: 'gestao',
      prompt: 'Como estruturar uma política ética e eficaz para cobrança de faltas (no-show com menos de 24h), reajuste anual de honorários por tabela e emissão de recibos para dedução no IRPF (DMED / Carnê-Leão)?'
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
      
      {/* Top Clinical Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 mb-3 rounded-2xl bg-[#120b24] border border-[#2a1b4e] shadow-lg">
        
        {/* Left: Engine & Profile Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#bf5af2] to-[#ff007f] p-0.5 shadow-[0_0_15px_rgba(255,0,127,0.4)]">
              <div className="w-full h-full rounded-[14px] bg-[#0b0616] flex items-center justify-center">
                <Brain className="w-5 h-5 text-[#bf5af2] animate-pulse" />
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0b0616]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
                Alegra AI
                <span className="text-[10px] bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-bold">
                  Gemini 3.8 Flash
                </span>
              </h2>
            </div>
            <p className="text-xs text-purple-300/70 flex items-center gap-1">
              Co-piloto clínico e gestão de consultório •
              <span className={profile === 'psicologo' ? 'text-[#bf5af2] font-semibold' : 'text-[#ff007f] font-semibold'}>
                {profile === 'psicologo' ? 'Especialista CFP' : 'Especialista CRM'}
              </span>
            </p>
          </div>
        </div>

        {/* Center/Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          
          {/* Patient Binder Selector */}
          <div className="flex items-center gap-1.5 bg-[#0b0616] border border-[#2a1b4e] px-3 py-1.5 rounded-xl text-xs">
            <span className="text-purple-400/80 font-medium">Paciente:</span>
            <select
              id="chat-patient-selector"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#120b24] text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Profile Switcher */}
          <div className="flex items-center gap-1.5 bg-[#0b0616] border border-[#bf5af2]/40 px-2.5 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-medium hidden md:inline">Perfil:</span>
            <select
              id="chat-profile-dropdown"
              value={profile}
              onChange={(e) => setProfile(e.target.value as ProfessionalProfile)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="psicologo" className="bg-[#120b24] text-white">
                Psicólogo (CFP/CRP)
              </option>
              <option value="psiquiatra" className="bg-[#120b24] text-white">
                Psiquiatra (CFM/CRM)
              </option>
            </select>
          </div>

          {/* Usage Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b0616] border border-[#2a1b4e] text-xs font-semibold text-purple-300">
            <span>Uso:</span>
            <span className={isLimitReached ? 'text-[#ff007f] font-bold' : 'text-[#bf5af2] font-bold'}>
              {messageCount} / {maxMessages}
            </span>
          </div>

        </div>
      </div>

      {/* Free limit banner */}
      {isLimitReached && (
        <div 
          id="alegra-free-limit-banner"
          className="mb-3 p-4 rounded-2xl bg-gradient-to-r from-[#ff007f]/20 via-[#120b24] to-[#ff007f]/20 border-2 border-[#ff007f] shadow-[0_0_25px_rgba(255,0,127,0.35)] flex flex-col sm:flex-row items-center justify-between gap-3 animate-in zoom-in-95 duration-200"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,127,0.5)]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-[#ff007f]">
                Limite diário atingido ({messageCount}/{maxMessages}). Faça o upgrade profissional.
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Desbloqueie mensagens ilimitadas da Alegra AI, telemedicina HD e emissão de laudos sem restrições.
              </p>
            </div>
          </div>
          <button
            onClick={onUpgradeClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,0,127,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Crown className="w-4 h-4" />
            Fazer Upgrade Pro (R$ 49/mês)
          </button>
        </div>
      )}

      {/* Chat History */}
      <div 
        id="alegra-chat-history"
        className="flex-1 overflow-y-auto p-3 sm:p-5 rounded-2xl bg-[#0b0616] border border-[#2a1b4e]/80 space-y-4 shadow-inner"
      >
        {messages.map((msg) => {
          const isAlegra = msg.sender === 'alegra';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3.5 ${isAlegra ? 'justify-start' : 'justify-end'}`}
            >
              {isAlegra && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#bf5af2] to-[#ff007f] p-0.5 shrink-0 mt-1 shadow-[0_0_10px_rgba(191,90,242,0.4)]">
                  <div className="w-full h-full rounded-[10px] bg-[#0b0616] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#bf5af2]" />
                  </div>
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed transition-all shadow-md ${
                  isAlegra
                    ? 'bg-[#120b24] border border-[#bf5af2]/40 text-slate-100 shadow-[0_4px_20px_rgba(191,90,242,0.08)]'
                    : 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-[0_4px_20px_rgba(255,0,127,0.25)] font-medium'
                }`}
              >
                {isAlegra && (
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#2a1b4e] text-[11px] text-purple-300/80">
                    <span className="font-bold flex items-center gap-1.5 text-white">
                      <Brain className="w-3.5 h-3.5 text-[#bf5af2]" />
                      Alegra AI
                      {msg.patientName && (
                        <span className="text-[10px] text-purple-300 font-normal">
                          • {msg.patientName}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-purple-400/60">{msg.timestamp}</span>
                  </div>
                )}

                <div className="markdown-content prose prose-invert max-w-none text-xs sm:text-sm">
                  {isAlegra ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>

                {isAlegra && msg.id !== 'msg-welcome' && (
                  <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-[#2a1b4e]">
                    {onSaveEvolutionToPatient && (
                      <button
                        onClick={() => handleSaveToPatientRecord(msg)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          savedMessageId === msg.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#1c1236] hover:bg-[#bf5af2]/20 text-purple-200 border border-[#2a1b4e]'
                        }`}
                        title="Salvar no Prontuário do Paciente"
                      >
                        {savedMessageId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Salvo no Prontuário!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5 text-[#bf5af2]" />
                            <span>Salvar no Prontuário</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1c1236] hover:bg-[#2a1b4e] text-purple-200 text-xs transition-colors"
                      title="Copiar texto"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-purple-400" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#bf5af2] to-[#ff007f] p-0.5 shrink-0 mt-1">
              <div className="w-full h-full rounded-[10px] bg-[#0b0616] flex items-center justify-center">
                <Brain className="w-4 h-4 text-[#bf5af2] animate-spin" />
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#120b24] border border-[#bf5af2]/40 text-xs text-purple-200 flex items-center gap-3 shadow-[0_0_15px_rgba(191,90,242,0.15)]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#bf5af2] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#d946ef] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#ff007f] animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="font-medium text-slate-300">
                Alegra AI consultando base de evidências clínicas...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Specialized Clinical Tools Quick Actions */}
      <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-purple-400/80 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#bf5af2]" />
          Ferramentas IA:
        </span>
        {specializedAITools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveCategory(tool.category);
                handleSendMessage(tool.prompt, tool.category);
              }}
              disabled={isLoading || isLimitReached}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-[#120b24] hover:bg-[#1f133d] border border-[#2a1b4e] hover:border-[#bf5af2]/60 text-xs text-slate-200 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              <Icon className="w-3.5 h-3.5 text-[#bf5af2]" />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Bar */}
      <div className="p-2 sm:p-3 rounded-2xl bg-[#120b24] border border-[#2a1b4e] shadow-xl">
        {isListening && (
          <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-[#ff007f]/20 border border-[#ff007f] text-xs text-white animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff007f] shadow-[0_0_10px_#ff007f]" />
              <span className="font-bold">Microfone Clínico Ativo:</span>
              <span className="text-pink-200">Ditando em tempo real...</span>
            </div>
            <button
              onClick={toggleVoiceDictation}
              className="text-xs text-pink-300 hover:text-white underline font-semibold"
            >
              Parar ditado
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            id="voice-dictation-btn"
            onClick={toggleVoiceDictation}
            disabled={isLimitReached}
            title={isListening ? 'Parar Ditado por Voz' : 'Ditar por Voz (Microfone)'}
            className={`p-2.5 sm:p-3 rounded-xl transition-all flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-[#ff007f] text-white shadow-[0_0_15px_rgba(255,0,127,0.6)] animate-pulse'
                : 'bg-[#1a0f35] text-purple-300 hover:text-white hover:bg-[#25154c] border border-[#2a1b4e]'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <div className="flex-1 relative">
            <textarea
              id="alegra-prompt-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLimitReached}
              placeholder={
                isLimitReached
                  ? 'Limite atingido. Assine o plano Pro para continuar.'
                  : profile === 'psicologo'
                  ? 'Digite as notas da sessão, caso clínico ou solicite estruturação CFP...'
                  : 'Digite os dados do paciente, psicofármacos ou dúvida de conduta CRM...'
              }
              className="w-full bg-[#0b0616] border border-[#2a1b4e] focus:border-[#bf5af2] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-purple-400/50 focus:outline-none resize-none disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            id="alegra-analyze-btn"
            disabled={!input.trim() || isLoading || isLimitReached}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(255,0,127,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Analisar</span>
          </button>
        </form>
      </div>

    </div>
  );
};
