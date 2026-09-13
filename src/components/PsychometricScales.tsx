import React, { useState } from 'react';
import { 
  ClipboardList, 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Save, 
  Clock, 
  User, 
  ChevronRight,
  TrendingUp,
  Activity,
  FileCheck,
  Printer
} from 'lucide-react';
import { ScaleAssessment, ScaleType, Patient, ProfessionalProfile } from '../types';

interface PsychometricScalesProps {
  assessments: ScaleAssessment[];
  patients: Patient[];
  profile: ProfessionalProfile;
  onSaveAssessment: (assessment: ScaleAssessment) => void;
  initialScaleType?: ScaleType | null;
  triggerOpenScale?: boolean;
  onClearTrigger?: () => void;
}

interface ScaleQuestion {
  id: number;
  text: string;
  options: { label: string; value: number }[];
}

interface ScaleDefinition {
  type: ScaleType;
  title: string;
  description: string;
  maxScore: number;
  instructions: string;
  getClassification: (score: number) => string;
  questions: ScaleQuestion[];
}

const SCALES_DEFINITIONS: Record<ScaleType, ScaleDefinition> = {
  phq9: {
    type: 'phq9',
    title: 'PHQ-9 • Patient Health Questionnaire (Depressão)',
    description: 'Instrumento padrão-ouro para rastreamento e mensuração de gravidade de episódios depressivos (DSM-5 / CID-11).',
    maxScore: 27,
    instructions: 'Nas últimas 2 semanas, com que frequência você foi incomodado por qualquer um dos seguintes problemas?',
    getClassification: (score: number) => {
      if (score <= 4) return 'Sintomas Mínimos ou Ausentes (0-4)';
      if (score <= 9) return 'Depressão Leve (5-9)';
      if (score <= 14) return 'Depressão Moderada (10-14)';
      if (score <= 19) return 'Depressão Moderadamente Grave (15-19)';
      return 'Depressão Grave (20-27)';
    },
    questions: [
      { id: 0, text: '1. Pouco interesse ou prazer em fazer as coisas', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] },
      { id: 1, text: '2. Sentir-se "para baixo", deprimido(a) ou sem perspectiva', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] },
      { id: 2, text: '3. Dificuldade para adormecer, permanecer dormindo ou dormir demais', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] },
      { id: 3, text: '4. Sentir-se cansado(a) ou com pouca energia', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] },
      { id: 4, text: '5. Falta de apetite ou comer em excesso', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] },
      { id: 5, text: '6. Sentir-se mal consigo mesmo(a) ou sentir que é um fracasso', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] },
      { id: 6, text: '7. Dificuldade de concentração em coisas cotidianas (ler, TV, trabalho)', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] },
      { id: 7, text: '8. Lentidão motora ou inquietação excessiva notada pelos outros', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] },
      { id: 8, text: '9. Pensamentos de que seria melhor estar morto(a) ou de se machucar', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] }
    ]
  },
  gad7: {
    type: 'gad7',
    title: 'GAD-7 • Escala de Ansiedade Generalizada',
    description: 'Avaliação clínica validada de sintomas somáticos e cognitivos de ansiedade (TAG / F41.1).',
    maxScore: 21,
    instructions: 'Nas últimas 2 semanas, com que frequência você foi incomodado pelos seguintes sintomas?',
    getClassification: (score: number) => {
      if (score <= 4) return 'Ansiedade Mínima (0-4)';
      if (score <= 9) return 'Ansiedade Leve (5-9)';
      if (score <= 14) return 'Ansiedade Moderada (10-14)';
      return 'Ansiedade Grave (15-21)';
    },
    questions: [
      { id: 0, text: '1. Sentir-se nervoso(a), ansioso(a) ou no limite', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] },
      { id: 1, text: '2. Não conseguir parar ou controlar as preocupações', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] },
      { id: 2, text: '3. Preocupar-se demais com coisas diferentes', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] },
      { id: 3, text: '4. Dificuldade para relaxar', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] },
      { id: 4, text: '5. Ficar tão agitado(a) que é difícil permanecer sentado(a)', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] },
      { id: 5, text: '6. Ficar facilmente irritado(a) ou chateado(a)', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] },
      { id: 6, text: '7. Sentir medo como se algo terrível fosse acontecer', options: [{ label: 'Nenhum dia (0)', value: 0 }, { label: 'Vários dias (1)', value: 1 }, { label: 'Mais da metade dos dias (2)', value: 2 }, { label: 'Quase todos os dias (3)', value: 3 }] }
    ]
  },
  asrs18: {
    type: 'asrs18',
    title: 'ASRS-18 • Rastreio de TDAH em Adultos (OMS / ASRS-v1.1)',
    description: 'Escala oficial da Organização Mundial da Saúde para sintomas de desatenção e hiperatividade/impulsividade.',
    maxScore: 24,
    instructions: 'Responda com base em como você tem se sentido e se comportado nos últimos 6 meses.',
    getClassification: (score: number) => {
      if (score >= 14) return 'Alta Probabilidade de TDAH Adulto (Requer Avaliação Aprofundada)';
      if (score >= 9) return 'Sintomatologia Borderline / Moderada';
      return 'Baixa Probabilidade de TDAH';
    },
    questions: [
      { id: 0, text: '1. Com que frequência você comete erros por descuido quando tem que trabalhar em um projeto chato ou difícil?', options: [{ label: 'Nunca (0)', value: 0 }, { label: 'Raramente (1)', value: 1 }, { label: 'Às vezes (2)', value: 2 }, { label: 'Frequentemente (3)', value: 3 }, { label: 'Muito Frequentemente (4)', value: 4 }] },
      { id: 1, text: '2. Com que frequência você tem dificuldade para manter a atenção quando está fazendo um trabalho monótono ou repetitivo?', options: [{ label: 'Nunca (0)', value: 0 }, { label: 'Raramente (1)', value: 1 }, { label: 'Às vezes (2)', value: 2 }, { label: 'Frequentemente (3)', value: 3 }, { label: 'Muito Frequentemente (4)', value: 4 }] },
      { id: 2, text: '3. Com que frequência você tem dificuldade para se concentrar no que as pessoas dizem, mesmo quando estão falando diretamente com você?', options: [{ label: 'Nunca (0)', value: 0 }, { label: 'Raramente (1)', value: 1 }, { label: 'Às vezes (2)', value: 2 }, { label: 'Frequentemente (3)', value: 3 }, { label: 'Muito Frequentemente (4)', value: 4 }] },
      { id: 3, text: '4. Com que frequência você deixa um projeto pela metade depois de já ter feito as partes mais difíceis?', options: [{ label: 'Nunca (0)', value: 0 }, { label: 'Raramente (1)', value: 1 }, { label: 'Às vezes (2)', value: 2 }, { label: 'Frequentemente (3)', value: 3 }, { label: 'Muito Frequentemente (4)', value: 4 }] },
      { id: 4, text: '5. Com que frequência você tem dificuldade para organizar as coisas quando tem que fazer uma tarefa que exige organização?', options: [{ label: 'Nunca (0)', value: 0 }, { label: 'Raramente (1)', value: 1 }, { label: 'Às vezes (2)', value: 2 }, { label: 'Frequentemente (3)', value: 3 }, { label: 'Muito Frequentemente (4)', value: 4 }] },
      { id: 5, text: '6. Com que frequência você evita ou adia começar tarefas que exigem muito raciocínio e esforço contínuo?', options: [{ label: 'Nunca (0)', value: 0 }, { label: 'Raramente (1)', value: 1 }, { label: 'Às vezes (2)', value: 2 }, { label: 'Frequentemente (3)', value: 3 }, { label: 'Muito Frequentemente (4)', value: 4 }] }
    ]
  },
  bdi2: {
    type: 'bdi2',
    title: 'BDI-II • Inventário de Depressão de Beck (Versão Reduzida)',
    description: 'Avaliação psicométrica aprofundada de atitudes e sintomas cognitivos, afetivos e somáticos da depressão.',
    maxScore: 18,
    instructions: 'Indique a afirmação que melhor descreve como você se sentiu na última semana.',
    getClassification: (score: number) => {
      if (score <= 4) return 'Depressão Mínima';
      if (score <= 9) return 'Depressão Leve';
      if (score <= 14) return 'Depressão Moderada';
      return 'Depressão Grave';
    },
    questions: [
      { id: 0, text: '1. Tristeza e Desânimo', options: [{ label: 'Não me sinto triste (0)', value: 0 }, { label: 'Sinto-me triste boa parte do tempo (1)', value: 1 }, { label: 'Estou triste o tempo todo (2)', value: 2 }, { label: 'Estou tão triste que não aguento (3)', value: 3 }] },
      { id: 1, text: '2. Pessimismo em relação ao futuro', options: [{ label: 'Não estou desanimado quanto ao futuro (0)', value: 0 }, { label: 'Sinto-me mais desanimado que antes (1)', value: 1 }, { label: 'Não espero nada de bom para mim (2)', value: 2 }, { label: 'O futuro é sem esperança (3)', value: 3 }] },
      { id: 2, text: '3. Sensação de Fracasso', options: [{ label: 'Não me sinto um fracasso (0)', value: 0 }, { label: 'Fracassei mais do que deveria (1)', value: 1 }, { label: 'Olhando para trás, vejo muitos fracassos (2)', value: 2 }, { label: 'Sinto-me um fracasso total como pessoa (3)', value: 3 }] },
      { id: 3, text: '4. Perda de Prazer e Satisfação', options: [{ label: 'Tenho tanto prazer quanto antes (0)', value: 0 }, { label: 'Não sinto tanto prazer como antes (1)', value: 1 }, { label: 'Obtenho muito pouco prazer com as coisas (2)', value: 2 }, { label: 'Não sinto prazer com absolutamente nada (3)', value: 3 }] },
      { id: 4, text: '5. Sentimento de Culpa e Autocrítica', options: [{ label: 'Não me sinto especialmente culpado (0)', value: 0 }, { label: 'Sinto-me culpado por várias coisas (1)', value: 1 }, { label: 'Sinto-me culpado a maior parte do tempo (2)', value: 2 }, { label: 'Sinto-me culpado o tempo todo (3)', value: 3 }] },
      { id: 5, text: '6. Cansaço e Fadiga', options: [{ label: 'Não me sinto mais cansado que o habitual (0)', value: 0 }, { label: 'Fico cansado mais facilmente (1)', value: 1 }, { label: 'Estou cansado demais para fazer muitas coisas (2)', value: 2 }, { label: 'Estou cansado demais para fazer qualquer coisa (3)', value: 3 }] }
    ]
  },
  bai: {
    type: 'bai',
    title: 'BAI • Inventário de Ansiedade de Beck',
    description: 'Mapeamento focado em sintomas fisiológicos e autonômicos de pânico e hiperativação simpática.',
    maxScore: 18,
    instructions: 'Indique o quanto você foi incomodado por cada sintoma durante a última semana.',
    getClassification: (score: number) => {
      if (score <= 4) return 'Ansiedade Mínima';
      if (score <= 9) return 'Ansiedade Leve';
      if (score <= 14) return 'Ansiedade Moderada';
      return 'Ansiedade Grave';
    },
    questions: [
      { id: 0, text: '1. Dormência ou formigamento nas extremidades', options: [{ label: 'Absolutamente não (0)', value: 0 }, { label: 'Levemente (1)', value: 1 }, { label: 'Moderadamente (2)', value: 2 }, { label: 'Gravemente (3)', value: 3 }] },
      { id: 1, text: '2. Sensação de calor ou calafrios repentinos', options: [{ label: 'Absolutamente não (0)', value: 0 }, { label: 'Levemente (1)', value: 1 }, { label: 'Moderadamente (2)', value: 2 }, { label: 'Gravemente (3)', value: 3 }] },
      { id: 2, text: '3. Tremores nas mãos ou pernas', options: [{ label: 'Absolutamente não (0)', value: 0 }, { label: 'Levemente (1)', value: 1 }, { label: 'Moderadamente (2)', value: 2 }, { label: 'Gravemente (3)', value: 3 }] },
      { id: 3, text: '4. Taquicardia ou palpitações cardíacas aceleradas', options: [{ label: 'Absolutamente não (0)', value: 0 }, { label: 'Levemente (1)', value: 1 }, { label: 'Moderadamente (2)', value: 2 }, { label: 'Gravemente (3)', value: 3 }] },
      { id: 4, text: '5. Sensação de desmaio, tontura ou desequilíbrio', options: [{ label: 'Absolutamente não (0)', value: 0 }, { label: 'Levemente (1)', value: 1 }, { label: 'Moderadamente (2)', value: 2 }, { label: 'Gravemente (3)', value: 3 }] },
      { id: 5, text: '6. Medo de perder o controle ou enlouquecer', options: [{ label: 'Absolutamente não (0)', value: 0 }, { label: 'Levemente (1)', value: 1 }, { label: 'Moderadamente (2)', value: 2 }, { label: 'Gravemente (3)', value: 3 }] }
    ]
  },
  meem: {
    type: 'meem',
    title: 'MEEM • Mini Exame do Estado Mental (Rastreio Cognitivo)',
    description: 'Rastreio padronizado de declínio cognitivo, orientação temporo-espacial, memória e funções executivas.',
    maxScore: 30,
    instructions: 'Aplicação guiada pelo profissional durante a consulta clínica presencial ou telemedicina.',
    getClassification: (score: number) => {
      if (score >= 24) return 'Preservado / Normal (> 24 pontos)';
      if (score >= 18) return 'Declínio Cognitivo Leve a Moderado (18-23)';
      return 'Declínio Cognitivo Severo (< 18)';
    },
    questions: [
      { id: 0, text: '1. Orientação Temporal (Ano, Estação, Mês, Dia do mês, Dia da semana)', options: [{ label: '0 acertos', value: 0 }, { label: '1 a 2 acertos', value: 2 }, { label: '3 a 4 acertos', value: 4 }, { label: '5 acertos plenos', value: 5 }] },
      { id: 1, text: '2. Orientação Espacial (País, Estado, Cidade, Local/Consultório, Andar)', options: [{ label: '0 acertos', value: 0 }, { label: '1 a 2 acertos', value: 2 }, { label: '3 a 4 acertos', value: 4 }, { label: '5 acertos plenos', value: 5 }] },
      { id: 2, text: '3. Registro Imediato de 3 palavras (Carro, Vaso, Tijolo)', options: [{ label: '0 palavras', value: 0 }, { label: '1 palavra', value: 1 }, { label: '2 palavras', value: 2 }, { label: '3 palavras', value: 3 }] },
      { id: 3, text: '4. Atenção e Cálculo (Subtrações sucessivas 100-7 ou soletrar MUNDO de trás para frente)', options: [{ label: '0 acertos', value: 0 }, { label: '1 a 2 acertos', value: 2 }, { label: '3 a 4 acertos', value: 4 }, { label: '5 acertos plenos', value: 5 }] },
      { id: 4, text: '5. Evocação Tardia das 3 palavras aprendidas', options: [{ label: '0 palavras', value: 0 }, { label: '1 palavra', value: 1 }, { label: '2 palavras', value: 2 }, { label: '3 palavras', value: 3 }] },
      { id: 5, text: '6. Linguagem & Praxia Construtiva (Nomear relógio/caneta, comando em 3 etapas, copiar pentágonos)', options: [{ label: '0 a 3 acertos', value: 3 }, { label: '4 a 6 acertos', value: 6 }, { label: '7 a 8 acertos', value: 8 }, { label: '9 acertos plenos', value: 9 }] }
    ]
  }
};

export const PsychometricScales: React.FC<PsychometricScalesProps> = ({
  assessments,
  patients,
  profile,
  onSaveAssessment,
  initialScaleType,
  triggerOpenScale,
  onClearTrigger,
}) => {
  const [selectedScaleType, setSelectedScaleType] = useState<ScaleType>('phq9');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isEvaluatingAI, setIsEvaluatingAI] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [activeTab, setActiveTab] = useState<'aplicar' | 'historico'>('aplicar');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Deep Navigation Trigger Listener
  React.useEffect(() => {
    if (initialScaleType) {
      setSelectedScaleType(initialScaleType);
      setActiveTab('aplicar');
    }
    if (triggerOpenScale) {
      setActiveTab('aplicar');
      if (onClearTrigger) onClearTrigger();
    }
  }, [initialScaleType, triggerOpenScale, onClearTrigger]);

  const activeScale = SCALES_DEFINITIONS[selectedScaleType];

  // Calculate live score
  const totalScore = Object.values(answers).reduce((sum, val) => sum + (val || 0), 0);
  const severity = activeScale.getClassification(totalScore);

  const handleSelectOption = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleResetAnswers = () => {
    setAnswers({});
    setAiInterpretation('');
  };

  const handleEvaluateAI = async () => {
    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) return;

    setIsEvaluatingAI(true);
    try {
      const res = await fetch('/api/evaluate-scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scaleType: selectedScaleType,
          patientName: patient.name,
          score: totalScore,
          maxScore: activeScale.maxScore,
          answers,
          profile,
        }),
      });

      const data = await res.json();
      if (data.text) {
        setAiInterpretation(data.text);
      }
    } catch (e) {
      console.error(e);
      setAiInterpretation(`Escore obtido: ${totalScore} de ${activeScale.maxScore}. Classificação: ${severity}. Recomenda-se acompanhamento clínico seriado.`);
    } finally {
      setIsEvaluatingAI(false);
    }
  };

  const handleSaveAssessmentToHistory = () => {
    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) return;

    const newAssessment: ScaleAssessment = {
      id: `scale-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      scaleType: selectedScaleType,
      date: new Date().toLocaleDateString('pt-BR'),
      score: totalScore,
      maxScore: activeScale.maxScore,
      severityClassification: severity,
      answers,
      aiClinicalInterpretation: aiInterpretation || `Escore ${totalScore}/${activeScale.maxScore} (${severity}). Avaliação realizada no consultório PSICOOL.`,
    };

    onSaveAssessment(newAssessment);
    setActiveTab('historico');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-[#120b24] border border-[#2a1b4e]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#bf5af2] uppercase tracking-wider mb-1">
            <ClipboardList className="w-4 h-4" />
            <span>Psicometria Clínica & Escalas Diagnósticas Padronizadas</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Bateria de Escalas & Testes Psicométricos
          </h1>
          <p className="text-xs text-purple-300/70">
            PHQ-9, GAD-7, ASRS-18 (TDAH), Beck (BDI-II / BAI) e Mini-Mental com cálculo automático e parecer da Alegra AI.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0b0616] p-1.5 rounded-2xl border border-[#2a1b4e]">
          <button
            onClick={() => setActiveTab('aplicar')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'aplicar'
                ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-md'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            Aplicar Teste
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'historico'
                ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-md'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            Histórico & Evolução ({assessments.length})
          </button>
        </div>
      </div>

      {activeTab === 'aplicar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Scale Selector & Configuration (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Patient Selector */}
            <div className="p-4 rounded-2xl bg-[#120b24] border border-[#2a1b4e] space-y-2">
              <label className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#bf5af2]" />
                <span>Paciente em Avaliação</span>
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#bf5af2]"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#120b24]">
                    {p.name} ({p.diagnosisHypothesis.substring(0, 30)}...)
                  </option>
                ))}
              </select>
            </div>

            {/* Scale Picker */}
            <div className="p-4 rounded-2xl bg-[#120b24] border border-[#2a1b4e] space-y-2">
              <label className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-2">
                Selecione o Instrumento
              </label>
              
              <div className="space-y-1.5">
                {(Object.keys(SCALES_DEFINITIONS) as ScaleType[]).map((st) => {
                  const scale = SCALES_DEFINITIONS[st];
                  const isSelected = selectedScaleType === st;
                  return (
                    <button
                      key={st}
                      onClick={() => {
                        setSelectedScaleType(st);
                        setAnswers({});
                        setAiInterpretation('');
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'bg-[#1c1236] border-[#bf5af2] text-white shadow-[0_0_12px_rgba(191,90,242,0.3)]'
                          : 'bg-[#0b0616] border-[#2a1b4e] text-purple-200/70 hover:text-white hover:border-purple-400/40'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{scale.title.split('•')[0]}</span>
                        <span className="text-[10px] font-mono text-purple-400">Max {scale.maxScore} pts</span>
                      </div>
                      <p className="text-[11px] text-purple-300/60 mt-0.5 line-clamp-1">{scale.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Scorecard Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#180e2e] to-[#0b0616] border border-[#bf5af2] shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 uppercase">Pontuação Atual</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#bf5af2]/20 text-[#bf5af2] border border-[#bf5af2]/40">
                  {totalScore} / {activeScale.maxScore}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-[#0b0616] rounded-full overflow-hidden border border-[#2a1b4e]">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-[#ff007f] transition-all duration-300"
                  style={{ width: `${Math.min(100, (totalScore / activeScale.maxScore) * 100)}%` }}
                />
              </div>

              <div className="p-3 rounded-xl bg-[#0b0616] border border-[#2a1b4e]">
                <span className="text-[10px] text-purple-400 uppercase font-semibold block">Classificação Clínica:</span>
                <p className="text-xs font-extrabold text-white mt-0.5">{severity}</p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleResetAnswers}
                  className="px-3 py-2 rounded-xl bg-[#0b0616] hover:bg-[#1a0f35] border border-[#2a1b4e] text-purple-300 text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>

                <button
                  onClick={handleEvaluateAI}
                  disabled={isEvaluatingAI}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEvaluatingAI ? 'Analisando...' : 'Parecer Alegra AI'}</span>
                </button>
              </div>

              {/* Save Assessment & Print Report */}
              <div className="space-y-2">
                <button
                  onClick={handleSaveAssessmentToHistory}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar no Prontuário do Paciente</span>
                </button>

                <button
                  onClick={() => setShowPrintModal(true)}
                  className="w-full py-2 rounded-xl bg-[#1e113a] hover:bg-[#2b1752] border border-[#3d2466] text-purple-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-[#bf5af2]" />
                  <span>Imprimir Relatório do Teste / PDF</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Questionnaire (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Scale Header & Instructions */}
            <div className="p-5 rounded-2xl bg-[#120b24] border border-[#2a1b4e] space-y-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#bf5af2]" />
                <span>{activeScale.title}</span>
              </h2>
              <p className="text-xs text-purple-200/80">{activeScale.description}</p>
              <div className="pt-2 text-[11px] text-[#bf5af2] font-semibold">
                Instruções: {activeScale.instructions}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {activeScale.questions.map((q) => {
                const currentAnswer = answers[q.id];

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-[#120b24] border border-[#2a1b4e] hover:border-[#bf5af2]/40 transition-all space-y-2.5"
                  >
                    <p className="text-xs font-semibold text-white">{q.text}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {q.options.map((opt) => {
                        const isChosen = currentAnswer === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleSelectOption(q.id, opt.value)}
                            className={`p-2 rounded-xl text-[11px] font-medium border text-left transition-all ${
                              isChosen
                                ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white border-transparent shadow-md font-bold'
                                : 'bg-[#0b0616] border-[#2a1b4e] text-purple-200/70 hover:text-white hover:border-purple-400/40'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Interpretation Box */}
            {aiInterpretation && (
              <div className="p-5 rounded-2xl bg-[#180e2e] border border-[#bf5af2] shadow-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#bf5af2] uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>Parecer & Interpretação Clínica da Alegra AI (Gemini 3.8)</span>
                </div>
                <div className="text-xs text-purple-100 whitespace-pre-wrap leading-relaxed font-sans">
                  {aiInterpretation}
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        /* History Tab */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.length > 0 ? (
              assessments.map((ass) => {
                return (
                  <div
                    key={ass.id}
                    className="p-5 rounded-2xl bg-[#120b24] border border-[#2a1b4e] hover:border-[#bf5af2]/40 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800">
                        {ass.scaleType.toUpperCase()}
                      </span>
                      <span className="text-xs text-purple-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {ass.date}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{ass.patientName}</h3>
                      <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                        Escore: {ass.score} / {ass.maxScore} • {ass.severityClassification}
                      </p>
                    </div>

                    <div className="p-3 bg-[#0b0616] rounded-xl border border-[#2a1b4e] text-xs text-purple-200/80 line-clamp-3">
                      {ass.aiClinicalInterpretation}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-12 p-6 rounded-2xl bg-[#120b24] border border-[#2a1b4e] text-purple-300/60">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 text-purple-400/40" />
                <p className="text-sm">Nenhuma escala salva no histórico até o momento.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Report Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print-bg">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden my-auto printable-document">
            
            {/* Top Modal Controls (Hidden on Print) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] uppercase">
                  Relatório Psicométrico Oficial
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedScaleType.toUpperCase()} • {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* Timbrated Header */}
            <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
              <h2 className="text-base font-extrabold uppercase text-slate-900 tracking-tight">
                Consultório Clínico Especializado • PSICOOL
              </h2>
              <p className="text-xs text-slate-600">
                {profile === 'psicologo' ? 'Avaliação Psicológica Padronizada (CFP)' : 'Avaliação Psiquiátrica & Psicometria (CFM)'}
              </p>
            </div>

            {/* Test Title & Patient Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Paciente:</strong> {patients.find((p) => p.id === selectedPatientId)?.name || 'Paciente'}
                </div>
                <div>
                  <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div>
                <strong>Instrumento:</strong> {activeScale.title}
              </div>
              <div className="flex items-center justify-between font-bold pt-1 border-t border-slate-200">
                <span className="text-sm text-purple-900">
                  Pontuação Total: {totalScore} / {activeScale.maxScore}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900">
                  {severity}
                </span>
              </div>
            </div>

            {/* Question Answers Summary */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Detalhamento dos Itens Avaliados:
              </h4>
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto print:max-h-none">
                {activeScale.questions.map((q) => {
                  const val = answers[q.id];
                  const opt = q.options.find((o) => o.value === val);
                  return (
                    <div key={q.id} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-[11px] border border-slate-100">
                      <span className="text-slate-700 pr-2">{q.text}</span>
                      <span className="font-bold text-purple-900 whitespace-nowrap">
                        {opt ? opt.label : 'Não respondido'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clinical Interpretation */}
            <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200 space-y-1.5 text-xs text-slate-800">
              <h4 className="font-bold text-purple-950 uppercase tracking-wider text-[11px]">
                Parecer Clínico & Síntese Diagnóstica:
              </h4>
              <p className="whitespace-pre-wrap leading-relaxed">
                {aiInterpretation || `Escore obtido de ${totalScore}/${activeScale.maxScore} pontos, correspondendo ao estrato clínico de "${severity}". Os resultados devem ser contextualizados à anamnese clínica longitudinal do paciente.`}
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-6 flex items-center justify-between border-t border-slate-300 text-xs">
              <div className="text-[10px] text-slate-500">
                Relatório gerado eletronicamente no ecossistema PSICOOL.
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-slate-900 mb-1" />
                <p className="font-bold text-slate-900">Assinatura do Profissional</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
