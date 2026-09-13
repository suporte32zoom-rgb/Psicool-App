import React, { useState } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Users, 
  Video, 
  FileText, 
  ClipboardList, 
  Building2, 
  DollarSign, 
  Sparkles, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  Crown,
  Activity,
  LayoutGrid,
  Search,
  Plus,
  Printer,
  Pill,
  Brain,
  Receipt,
  UserPlus,
  ArrowRight,
  FileCheck,
  CheckCircle2,
  Mic
} from 'lucide-react';
import { Logo } from './Logo';
import { NavigationTab, ProfessionalProfile } from '../types';

export interface MenuSubItem {
  id: string;
  title: string;
  subtitle: string;
  category: NavigationTab;
  subAction?: string;
  badge?: string;
  profileRequired?: ProfessionalProfile;
}

export interface MenuCategory {
  id: NavigationTab;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  items: MenuSubItem[];
}

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  profile: ProfessionalProfile;
  setProfile: (profile: ProfessionalProfile) => void;
  messageCount: number;
  maxMessages: number;
  onSelectSubAction?: (category: NavigationTab, subAction?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  setProfile,
  messageCount,
  maxMessages,
  onSelectSubAction,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [menuSearchTerm, setMenuSearchTerm] = useState('');

  // Top main tabs
  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'consultorio', label: 'Alegra AI', icon: Stethoscope },
    { id: 'documentos', label: 'Prescrições & Laudos', icon: FileText, badge: 'IMPRIMIR' },
    { id: 'escalas', label: 'Escalas & Testes', icon: ClipboardList, badge: 'TESTES' },
    { id: 'pacientes', label: 'Prontuários', icon: Users },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'telemedicina', label: 'Telemedicina', icon: Video, badge: 'HD' },
    { id: 'consultorios', label: 'Consultórios & TCLE', icon: Building2 },
    { id: 'financeiro', label: 'Financeiro & IRPF', icon: DollarSign },
    { id: 'planos', label: 'Planos Pro', icon: Crown, badge: 'PRO' },
  ];

  // Complete Structured Catalog of Clinic Categories & Subcategories
  const clinicMenuCatalog: MenuCategory[] = [
    {
      id: 'documentos',
      title: 'Prescrições & Laudos Oficiais (com Impressão Timbrada)',
      description: 'Emita receitas de controle especial, notificações, atestados e laudos com assinatura e validação digital.',
      icon: FileText,
      color: 'from-[#ff007f] to-[#d946ef]',
      items: [
        {
          id: 'doc-c1',
          title: 'Receituário de Controle Especial (C1 - 2 Vias)',
          subtitle: 'Antidepressivos, Antipsicóticos, Estabilizadores de Humor (Portaria SVS/MS 344/98)',
          category: 'documentos',
          subAction: 'receita_controle_especial',
          badge: 'C1 BRANCA',
        },
        {
          id: 'doc-b',
          title: 'Notificação de Receita B (Azul)',
          subtitle: 'Benzodiazepínicos e Hipnóticos Z (Clonazepam, Diazepam, Zolpidem)',
          category: 'documentos',
          subAction: 'receita_b',
          badge: 'B AZUL',
        },
        {
          id: 'doc-a',
          title: 'Notificação de Receita A (Amarela)',
          subtitle: 'Psicoestimulantes e Entorpecentes (Metilfenidato, Lisdexanfetamina)',
          category: 'documentos',
          subAction: 'receita_a',
          badge: 'A AMARELA',
        },
        {
          id: 'doc-atestado',
          title: 'Atestado Médico / Psicológico de Afastamento',
          subtitle: 'Atestado formal com CID-11 e dias de repouso válidos para trabalho e perícia',
          category: 'documentos',
          subAction: 'atestado_medico',
          badge: 'OFICIAL',
        },
        {
          id: 'doc-laudo',
          title: 'Laudo Psicológico Pericial (Resolução CFP nº 06/2019)',
          subtitle: 'Estruturação técnico-científica rigorosa para fins jurídicos e diagnósticos',
          category: 'documentos',
          subAction: 'laudo_psicologico',
          badge: 'CFP 06/2019',
        },
        {
          id: 'doc-comparecimento',
          title: 'Declaração de Comparecimento & Parecer',
          subtitle: 'Comprovação de presença em sessão e encaminhamentos interdisciplinares',
          category: 'documentos',
          subAction: 'declaracao_comparecimento',
        },
      ],
    },
    {
      id: 'escalas',
      title: 'Escalas & Testes Psicométricos Padronizados',
      description: 'Aplique questionários clínicos com pontuação automática em tempo real, gráficos e parecer da Alegra AI.',
      icon: ClipboardList,
      color: 'from-[#bf5af2] to-[#7928ca]',
      items: [
        {
          id: 'esc-phq9',
          title: 'PHQ-9 • Patient Health Questionnaire (Depressão)',
          subtitle: 'Padrão-ouro para rastreamento e graduação de episódios depressivos (DSM-5 / CID-11)',
          category: 'escalas',
          subAction: 'phq9',
          badge: 'DEPRESSÃO',
        },
        {
          id: 'esc-gad7',
          title: 'GAD-7 • Generalized Anxiety Disorder 7-item (Ansiedade)',
          subtitle: 'Mensuração de gravidade de transtorno de ansiedade generalizada e crises',
          category: 'escalas',
          subAction: 'gad7',
          badge: 'ANSIEDADE',
        },
        {
          id: 'esc-asrs',
          title: 'ASRS-18 • Rastreamento de TDAH Adulto (OMS)',
          subtitle: 'Escala de autoavaliação para déficit de atenção e hiperatividade em adultos',
          category: 'escalas',
          subAction: 'asrs18',
          badge: 'TDAH OMS',
        },
        {
          id: 'esc-bdi2',
          title: 'BDI-II • Inventário de Depressão de Beck',
          subtitle: '21 itens avaliando atitudes e sintomas cognitivo-afetivos e somáticos',
          category: 'escalas',
          subAction: 'bdi2',
          badge: 'BECK',
        },
        {
          id: 'esc-bai',
          title: 'BAI • Inventário de Ansiedade de Beck',
          subtitle: 'Avaliação da severidade de sintomas fisiológicos e cognitivos de ansiedade',
          category: 'escalas',
          subAction: 'bai',
        },
        {
          id: 'esc-meem',
          title: 'MEEM • Mini Exame do Estado Mental',
          subtitle: 'Rastreio de declínio cognitivo, memória, orientação temporal e espacial',
          category: 'escalas',
          subAction: 'meem',
          badge: 'COGNITIVO',
        },
      ],
    },
    {
      id: 'consultorio',
      title: 'Alegra AI & Inteligência Clínica Integrada',
      description: 'Copiloto de raciocínio conjunto para psiquiatras e psicólogos com motor Gemini 3.8 Flash.',
      icon: Stethoscope,
      color: 'from-[#bf5af2] to-[#ff007f]',
      items: [
        {
          id: 'ai-chat',
          title: 'Chat Clínico & Raciocínio Diagnóstico',
          subtitle: 'Discussão de casos complexos, hipóteses diagnósticas DSM-5-TR e CID-11',
          category: 'consultorio',
          subAction: 'chat',
        },
        {
          id: 'ai-voz',
          title: 'Ditado Clínico por Voz em Tempo Real',
          subtitle: 'Grave a síntese da sessão por voz para estruturação automática em padrão CFP/CFM',
          category: 'consultorio',
          subAction: 'ditado',
          badge: 'ÁUDIO',
        },
        {
          id: 'ai-risco',
          title: 'Avaliador de Risco Autolítico (Columbia C-SSRS)',
          subtitle: 'Estratificação de risco de ideação suicida e geração de Plano de Segurança em 6 passos',
          category: 'consultorio',
          subAction: 'risco',
          badge: 'CRÍTICO',
        },
        {
          id: 'ai-farmaco',
          title: 'Farmacologia, Titulação & Desmame (Tapering)',
          subtitle: 'Interações medicamentosas, contraindicações, cálculo de doses e desmame gradual',
          category: 'consultorio',
          subAction: 'farmaco',
        },
      ],
    },
    {
      id: 'pacientes',
      title: 'Prontuário Eletrônico & Evolução Clínica',
      description: 'Fichas cadastrais completas, histórico de consultas, evoluções no padrão CFP/CFM e anexos.',
      icon: Users,
      color: 'from-[#00f2fe] to-[#4facfe]',
      items: [
        {
          id: 'pac-lista',
          title: 'Diretório Completo de Prontuários',
          subtitle: 'Busca rápida, histórico de consultas, medicações ativas e contato de emergência',
          category: 'pacientes',
          subAction: 'lista',
        },
        {
          id: 'pac-nova-evolucao',
          title: 'Nova Evolução de Sessão (Padrão CFP 01/2009 & CFM)',
          subtitle: 'Registro estruturado com queixa principal, exame mental e conduta',
          category: 'pacientes',
          subAction: 'nova_evolucao',
          badge: 'EVOLUÇÃO',
        },
        {
          id: 'pac-novo',
          title: 'Cadastrar Novo Paciente',
          subtitle: 'Inserir dados cadastrais, CPF, hipótese diagnóstica e termo de consentimento',
          category: 'pacientes',
          subAction: 'novo_paciente',
          badge: 'NOVO',
        },
      ],
    },
    {
      id: 'agenda',
      title: 'Agenda Clínica & Google Calendar',
      description: 'Gestão de horários presenciais e online, integração oficial com Google Agenda e lembretes WhatsApp.',
      icon: Calendar,
      color: 'from-[#38ef7d] to-[#11998e]',
      items: [
        {
          id: 'age-calendario',
          title: 'Calendário Clínico & Google Calendar',
          subtitle: 'Sincronização bidirecional em tempo real com Google Agenda oficial e telemedicina',
          category: 'agenda',
          subAction: 'calendario',
          badge: 'GOOGLE SYNC',
        },
        {
          id: 'age-novo',
          title: 'Novo Agendamento de Consulta',
          subtitle: 'Marque sessões vinculando paciente, modalidade, horário e sincronização com Google Agenda',
          category: 'agenda',
          subAction: 'novo_agendamento',
          badge: 'AGENDAR',
        },
        {
          id: 'age-google-sync',
          title: 'Sincronização com Google Agenda (Oficial)',
          subtitle: 'Conecte sua conta Google para sincronizar eventos, horários e notificações no celular',
          category: 'agenda',
          subAction: 'google_sync',
          badge: 'GOOGLE',
        },
        {
          id: 'age-lembrete',
          title: 'Disparo de Lembrete WhatsApp com Link Seguro',
          subtitle: 'Reduza faltas e no-shows com notificações automáticas pré-sessão',
          category: 'agenda',
          subAction: 'lembrete',
        },
      ],
    },
    {
      id: 'telemedicina',
      title: 'Telemedicina HD Integrada & Split-Screen',
      description: 'Videoconsulta criptografada de ponta a ponta com anotações em tela dividida.',
      icon: Video,
      color: 'from-[#ff0844] to-[#ffb199]',
      items: [
        {
          id: 'tel-sala',
          title: 'Sala de Atendimento Virtual Criptografada',
          subtitle: 'Vídeo 1080p sem corte de tempo com proteção E2EE conforme CFM 2.314/2022',
          category: 'telemedicina',
          subAction: 'sala',
          badge: 'AO VIVO',
        },
        {
          id: 'tel-split',
          title: 'Modo Tela Dividida (Split-Screen)',
          subtitle: 'Atenda o paciente enquanto edita o prontuário e consulta a Alegra AI',
          category: 'telemedicina',
          subAction: 'split',
        },
      ],
    },
    {
      id: 'consultorios',
      title: 'Consultório Híbrido (Virtual & Físico) & TCLE',
      description: 'Gerencie salas físicas, sublocação, Wi-Fi, link fixo virtual, termos TCLE e contratos.',
      icon: Building2,
      color: 'from-[#f39c12] to-[#e67e22]',
      items: [
        {
          id: 'loc-salas',
          title: 'Gestão de Salas Físicas & Sublocação',
          subtitle: 'Endereço presencial, número de sala, senha de Wi-Fi, portaria e custo/hora',
          category: 'consultorios',
          subAction: 'locais',
          badge: 'FÍSICO',
        },
        {
          id: 'loc-tcle',
          title: 'Emissor de TCLE (Termo de Consentimento Livre)',
          subtitle: 'Termo para Telemedicina e Atendimento Presencial (CFP/CFM/LGPD)',
          category: 'consultorios',
          subAction: 'tcle',
          badge: 'TCLE',
        },
        {
          id: 'loc-contrato',
          title: 'Contrato de Prestação de Serviços & Honorários',
          subtitle: 'Regras de faltas, reajustes, sigilo profissional e política de no-show',
          category: 'consultorios',
          subAction: 'contrato',
        },
        {
          id: 'loc-dados',
          title: 'Dados Cadastrais do Profissional (CRP/CRM/RQE)',
          subtitle: 'Configuração do cabeçalho timbrado para todos os documentos gerados',
          category: 'consultorios',
          subAction: 'dados',
        },
      ],
    },
    {
      id: 'financeiro',
      title: 'Financeiro, Recibos & Dedução IRPF (DMED)',
      description: 'Emissão de recibos timbrados válidos para IRPF/Carnê-Leão e faturamento do consultório.',
      icon: DollarSign,
      color: 'from-[#2ecc71] to-[#27ae60]',
      items: [
        {
          id: 'fin-recibo',
          title: 'Emissor de Recibo Timbrado Oficial para IRPF',
          subtitle: 'Recibo com CPF do paciente, dados do profissional e código para dedução no IRPF / DMED',
          category: 'financeiro',
          subAction: 'novo_recibo',
          badge: 'IRPF / DMED',
        },
        {
          id: 'fin-faturamento',
          title: 'Controle de Faturamento & Fluxo de Caixa',
          subtitle: 'Resumo de honorários recebidos, pendentes, ticket médio e formas de pagamento',
          category: 'financeiro',
          subAction: 'faturamento',
        },
      ],
    },
  ];

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  const handleExecuteSubItem = (item: MenuSubItem) => {
    setActiveTab(item.category);
    if (onSelectSubAction) {
      onSelectSubAction(item.category, item.subAction);
    }
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  const isLimitReached = messageCount >= maxMessages;
  const usagePercentage = Math.min(100, Math.round((messageCount / maxMessages) * 100));

  // Quick Action bar shortcuts
  const quickActions = [
    { label: '+ Receita C1 (2 vias)', category: 'documentos' as NavigationTab, subAction: 'receita_controle_especial', icon: Pill, color: 'text-[#ff007f]' },
    { label: '+ Notificação B Azul', category: 'documentos' as NavigationTab, subAction: 'receita_b', icon: FileCheck, color: 'text-blue-400' },
    { label: '+ Atestado Médico/Psic.', category: 'documentos' as NavigationTab, subAction: 'atestado_medico', icon: FileText, color: 'text-emerald-400' },
    { label: '+ Laudo CFP 06/2019', category: 'documentos' as NavigationTab, subAction: 'laudo_psicologico', icon: ShieldCheck, color: 'text-purple-400' },
    { label: '+ Aplicar PHQ-9', category: 'escalas' as NavigationTab, subAction: 'phq9', icon: ClipboardList, color: 'text-pink-400' },
    { label: '+ Aplicar GAD-7', category: 'escalas' as NavigationTab, subAction: 'gad7', icon: Activity, color: 'text-indigo-400' },
    { label: '+ Aplicar TDAH (ASRS-18)', category: 'escalas' as NavigationTab, subAction: 'asrs18', icon: Brain, color: 'text-cyan-400' },
    { label: '+ Abrir Telemedicina HD', category: 'telemedicina' as NavigationTab, subAction: 'sala', icon: Video, color: 'text-rose-400' },
    { label: '+ Emitir Recibo IRPF', category: 'financeiro' as NavigationTab, subAction: 'novo_recibo', icon: Receipt, color: 'text-amber-400' },
    { label: '+ Gerar TCLE / Contrato', category: 'consultorios' as NavigationTab, subAction: 'tcle', icon: Building2, color: 'text-amber-300' },
    { label: '+ Novo Agendamento', category: 'agenda' as NavigationTab, subAction: 'novo_agendamento', icon: Calendar, color: 'text-teal-400' },
    { label: '+ Novo Paciente', category: 'pacientes' as NavigationTab, subAction: 'novo_paciente', icon: UserPlus, color: 'text-sky-400' },
  ];

  // Filtered menu items for search in mega-menu
  const filteredCatalog = clinicMenuCatalog.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        menuSearchTerm === '' ||
        item.title.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
        cat.title.toLowerCase().includes(menuSearchTerm.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#2a1b4e]/80 bg-[#0b0616]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            
            {/* Left: Brand Logo + Mega-Menu Trigger Button */}
            <div className="flex items-center gap-3">
              <div 
                onClick={() => handleSelectTab('consultorio')} 
                className="cursor-pointer shrink-0 transition-opacity hover:opacity-90"
              >
                <Logo size="md" showSubtitle={false} />
              </div>

              {/* Mega-Menu "Menu Geral do Consultório" Button */}
              <button
                id="mega-menu-trigger-btn"
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold transition-all shadow-md shrink-0 border ${
                  megaMenuOpen
                    ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white border-[#ff007f] shadow-[0_0_15px_rgba(255,0,127,0.4)]'
                    : 'bg-[#180e2e] text-purple-200 border-[#3d2466] hover:border-[#bf5af2] hover:bg-[#20133d]'
                }`}
                title="Abrir catálogo completo de categorias e subcategorias do consultório"
              >
                <LayoutGrid className="w-4 h-4 text-[#bf5af2]" />
                <span className="hidden sm:inline">Menu do Consultório</span>
                <span className="sm:hidden font-mono">Menu</span>
                <span className="hidden md:inline-block text-[9px] px-1.5 py-0.5 rounded-full bg-[#ff007f]/30 text-[#ff80bf] font-extrabold uppercase border border-[#ff007f]/40">
                  Todas as Funções
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Desktop Navigation: Always visible on screens >= xl */}
            <nav className="hidden xl:flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-btn-${item.id}`}
                    onClick={() => handleSelectTab(item.id)}
                    className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#bf5af2]/20 to-[#ff007f]/20 text-white border border-[#bf5af2]/60 shadow-[0_0_15px_rgba(191,90,242,0.25)]'
                        : 'text-slate-300 hover:text-white hover:bg-[#180e2e]/70 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#ff007f]' : 'text-purple-300/70'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full ${
                        isActive 
                          ? 'bg-[#ff007f] text-white shadow-[0_0_8px_rgba(255,0,127,0.5)]' 
                          : 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Profile Dropdown, Quota Indicator & Hamburger */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Free Usage Counter */}
              <div 
                onClick={() => setActiveTab('planos')}
                className={`hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isLimitReached
                    ? 'bg-[#ff007f]/15 border-[#ff007f] text-[#ff007f] shadow-[0_0_12px_rgba(255,0,127,0.3)] animate-pulse'
                    : 'bg-[#120b24] border-[#2a1b4e] text-purple-200 hover:border-[#bf5af2]/60'
                }`}
                title="Cota de interações clínicas com Alegra AI"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isLimitReached ? 'text-[#ff007f]' : 'text-[#bf5af2]'}`} />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1 leading-none">
                    <span className="font-bold">{messageCount}</span>
                    <span className="text-purple-400/60">/ {maxMessages}</span>
                  </div>
                  <div className="w-12 h-1 bg-[#23143f] rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full transition-all duration-300 ${isLimitReached ? 'bg-[#ff007f]' : 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f]'}`}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Professional Profile Dropdown */}
              <div className="relative">
                <button
                  id="profile-selector-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#120b24] border border-[#2a1b4e] hover:border-[#bf5af2] text-xs font-semibold text-slate-100 transition-all shadow-inner"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${profile === 'psicologo' ? 'bg-[#bf5af2] shadow-[0_0_8px_#bf5af2]' : 'bg-[#00f2fe] shadow-[0_0_8px_#00f2fe]'}`} />
                  <span className="hidden sm:inline">
                    {profile === 'psicologo' ? 'Psicólogo • CRP' : 'Psiquiatra • CRM'}
                  </span>
                  <span className="sm:hidden font-mono">
                    {profile === 'psicologo' ? 'CRP' : 'CRM'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#120b24] border border-[#2a1b4e] shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-purple-400/70 tracking-wider">
                      Perfil Profissional Ativo
                    </div>

                    <button
                      onClick={() => {
                        setProfile('psicologo');
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                        profile === 'psicologo'
                          ? 'bg-[#bf5af2]/20 border border-[#bf5af2]/50 text-white'
                          : 'hover:bg-[#1a0f35] text-slate-300'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-[#bf5af2] mt-1 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          Psicologia Clínica
                          <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-1 py-0.2 rounded border border-purple-800/40">CRP</span>
                        </div>
                        <div className="text-[11px] text-purple-300/70">
                          Resolução CFP 01/2009 e 06/2019, TCC, DBT, ACT e Laudos Psicológicos.
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setProfile('psiquiatra');
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                        profile === 'psiquiatra'
                          ? 'bg-[#00f2fe]/20 border border-[#00f2fe]/50 text-white'
                          : 'hover:bg-[#1a0f35] text-slate-300'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00f2fe] mt-1 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          Psiquiatria Médica
                          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-1 py-0.2 rounded border border-cyan-800/40">CRM</span>
                        </div>
                        <div className="text-[11px] text-cyan-300/70">
                          Psicofarmacologia, Receitas C1/B/A, Desmame, DSM-5-TR e CID-11.
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Hamburger Button */}
              <button
                id="mobile-nav-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl bg-[#120b24] border border-[#2a1b4e] text-purple-200 hover:text-white"
                aria-label="Abrir menu de navegação"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Quick-Action Bar for Doctors & Psychologists (Direct 1-Click Access) */}
        <div id="psicool-quick-bar" className="w-full bg-[#070310] border-t border-[#1e1338] py-1.5 px-2 sm:px-4 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#bf5af2] whitespace-nowrap pl-1 pr-1 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3" /> Ações Rápidas:
            </span>
            <div className="flex items-center gap-1.5">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleExecuteSubItem({
                      id: `qa-${idx}`,
                      title: action.label,
                      subtitle: '',
                      category: action.category,
                      subAction: action.subAction,
                    })}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#140b2a] hover:bg-[#20133d] border border-[#2c184d] hover:border-[#bf5af2]/60 text-[11px] font-medium text-slate-200 hover:text-white transition-all whitespace-nowrap shrink-0 shadow-sm"
                  >
                    <Icon className={`w-3 h-3 ${action.color}`} />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MEGA-MENU FULL CLINIC CATALOG MODAL (CATEGORIZED HUBS & SUBCATEGORIES)    */}
      {/* ========================================================================= */}
      {megaMenuOpen && (
        <div 
          id="psicool-mega-menu"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-start p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="max-w-7xl w-full mx-auto bg-[#0f0821] border border-[#3b2064] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
            
            {/* Mega-Menu Top Header & Search Bar */}
            <div className="p-4 sm:p-6 border-b border-[#2a174a] bg-gradient-to-r from-[#120b24] via-[#1a0e38] to-[#120b24] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#bf5af2] uppercase tracking-wider mb-1">
                  <LayoutGrid className="w-4 h-4" />
                  <span>Central Clínica • Consultório Virtual & Físico Inteligente</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                  <span>Menu Geral de Categorias & Funções</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white font-bold">
                    PSICOOL
                  </span>
                </h2>
                <p className="text-xs text-purple-300/70 mt-1">
                  Acesse instantaneamente todos os formulários clínicos, receitas com impressão oficial, baterias psicométricas e módulos de gestão.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/60" />
                  <input
                    type="text"
                    value={menuSearchTerm}
                    onChange={(e) => setMenuSearchTerm(e.target.value)}
                    placeholder="Buscar receita, teste, laudo..."
                    className="w-full bg-[#070310] border border-[#2a1b4e] focus:border-[#bf5af2] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/40 focus:outline-none"
                  />
                  {menuSearchTerm && (
                    <button
                      onClick={() => setMenuSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setMegaMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-[#1e113a] hover:bg-[#2b1752] text-purple-300 hover:text-white transition-all border border-[#3d2466]"
                  title="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mega-Menu Categorized Cards Grid */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 overflow-y-auto max-h-[72vh]">
              {filteredCatalog.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <div
                    key={category.id}
                    className="flex flex-col bg-[#140b2a] border border-[#2b184d] hover:border-[#bf5af2]/60 rounded-2xl p-4 transition-all duration-200 shadow-md group"
                  >
                    {/* Category Title Header */}
                    <div 
                      onClick={() => handleSelectTab(category.id)}
                      className="cursor-pointer border-b border-[#261445] pb-3 mb-3"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="p-2 rounded-xl bg-[#1f103d] border border-[#3b2064] text-[#bf5af2] group-hover:text-[#ff007f] transition-colors">
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-purple-400/60 uppercase tracking-widest group-hover:text-purple-300 flex items-center gap-1">
                          Acessar <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-[#bf5af2] transition-colors leading-snug">
                        {category.title}
                      </h3>
                      <p className="text-[11px] text-purple-300/60 line-clamp-2 mt-1">
                        {category.description}
                      </p>
                    </div>

                    {/* Subcategories List */}
                    <div className="space-y-1.5 flex-1">
                      {category.items.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => handleExecuteSubItem(subItem)}
                          className="w-full text-left p-2 rounded-xl bg-[#0d071c] hover:bg-[#20123d] border border-[#22123f] hover:border-[#bf5af2]/50 transition-all flex items-start justify-between gap-2 group/item"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-200 group-hover/item:text-white flex items-center gap-1.5 flex-wrap">
                              <span>{subItem.title}</span>
                              {subItem.badge && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#ff007f]/20 text-[#ff80bf] font-mono font-bold border border-[#ff007f]/30">
                                  {subItem.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-purple-300/50 group-hover/item:text-purple-300/80 line-clamp-1 mt-0.5">
                              {subItem.subtitle}
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-purple-400/40 group-hover/item:text-[#ff007f] shrink-0 mt-1 transition-transform group-hover/item:translate-x-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mega-Menu Bottom Bar */}
            <div className="p-3 sm:p-4 bg-[#090414] border-t border-[#261445] flex flex-wrap items-center justify-between gap-3 text-xs text-purple-400/60 px-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Todos os módulos atendem às exigências de telemedicina e prontuário do CFP (Res. 01/2009) e CFM (Res. 2.314/2022).</span>
              </div>
              <button
                onClick={() => setMegaMenuOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#1e113a] hover:bg-[#2b1752] text-white text-xs font-bold"
              >
                Fechar Menu
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-40 bg-[#0b0616]/98 backdrop-blur-xl pt-20 pb-6 px-4 overflow-y-auto space-y-4">
          <div className="space-y-1">
            <button
              onClick={() => {
                setMegaMenuOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#bf5af2]/20 to-[#ff007f]/20 border border-[#bf5af2]/60 text-white font-bold text-sm mb-3 shadow-md"
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#bf5af2]" />
                <span>Abrir Catálogo Completo (Menu do Consultório)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#ff007f]" />
            </button>

            <div className="text-[10px] uppercase font-bold text-purple-400/70 px-2 pb-1 tracking-wider">
              Navegação Principal
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#bf5af2]/25 to-[#ff007f]/25 text-white border border-[#bf5af2]/60'
                      : 'text-slate-300 hover:bg-[#180e2e] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#ff007f]' : 'text-purple-300/70'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff007f] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#2a1b4e]">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#120b24] via-[#1a0f35] to-[#250d3a] border border-[#ff007f]/40 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#ff007f] uppercase tracking-wider mb-1">
                <Crown className="w-4 h-4" />
                PSICOOL Premium Ilimitado
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Alegra AI ilimitada, telemedicina sem corte de tempo e emissão de laudos.
              </p>
              <button
                onClick={() => handleSelectTab('planos')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-lg"
              >
                Fazer Upgrade Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
