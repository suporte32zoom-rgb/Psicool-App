import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Wifi, 
  Clock, 
  DollarSign, 
  Plus, 
  Copy, 
  Check, 
  FileText, 
  UserCheck, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles,
  Lock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { OfficeSpace, ProfessionalData, ProfessionalProfile, Patient } from '../types';

interface OfficeManagerProps {
  offices: OfficeSpace[];
  professional: ProfessionalData;
  profile: ProfessionalProfile;
  patients: Patient[];
  onUpdateProfessional: (data: ProfessionalData) => void;
  onAddOffice: (office: OfficeSpace) => void;
  initialSubTab?: 'locais' | 'tcle_contratos' | 'dados_profissional' | null;
  onClearTrigger?: () => void;
}

export const OfficeManager: React.FC<OfficeManagerProps> = ({
  offices,
  professional,
  profile,
  patients,
  onUpdateProfessional,
  onAddOffice,
  initialSubTab,
  onClearTrigger,
}) => {
  const [activeTab, setActiveTab] = useState<'locais' | 'tcle_contratos' | 'dados_profissional'>(
    initialSubTab || 'locais'
  );
  const [showNewOfficeModal, setShowNewOfficeModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Deep Navigation Trigger Listener
  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
      if (onClearTrigger) onClearTrigger();
    }
  }, [initialSubTab, onClearTrigger]);

  // New Office Form State
  const [officeName, setOfficeName] = useState('');
  const [officeType, setOfficeType] = useState<'fisico' | 'virtual'>('fisico');
  const [officeAddress, setOfficeAddress] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [hourlyCost, setHourlyCost] = useState<number | ''>('');
  const [secretaryPhone, setSecretaryPhone] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [operatingHours, setOperatingHours] = useState('Segunda a Sexta das 08:00 às 20:00');

  // Professional Data Edit Form State
  const [profName, setProfName] = useState(professional.name);
  const [profCouncilNumber, setProfCouncilNumber] = useState(professional.councilNumber);
  const [profRqe, setProfRqe] = useState(professional.rqe || '');
  const [profEmail, setProfEmail] = useState(professional.email);
  const [profPhone, setProfPhone] = useState(professional.phone);
  const [clinicName, setClinicName] = useState(professional.clinicName);
  const [clinicAddress, setClinicAddress] = useState(professional.clinicAddress);
  const [pixKey, setPixKey] = useState(professional.pixKey);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  useEffect(() => {
    setProfName(professional.name);
    setProfCouncilNumber(professional.councilNumber);
    setProfRqe(professional.rqe || '');
    setProfEmail(professional.email);
    setProfPhone(professional.phone);
    setClinicName(professional.clinicName);
    setClinicAddress(professional.clinicAddress);
    setPixKey(professional.pixKey);
  }, [professional]);

  const handleCopyTelemedLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfessional({
      ...professional,
      name: profName.trim(),
      councilNumber: profCouncilNumber.trim(),
      rqe: profRqe.trim(),
      email: profEmail.trim(),
      phone: profPhone.trim(),
      clinicName: clinicName.trim(),
      clinicAddress: clinicAddress.trim(),
      pixKey: pixKey.trim(),
    });
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  const handleCreateOffice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officeName.trim()) return;

    const newOff: OfficeSpace = {
      id: `off-${Date.now()}`,
      name: officeName.trim(),
      type: officeType,
      address: officeAddress.trim() || (officeType === 'virtual' ? 'https://telemed.psicool.com.br/sala-privada' : 'Consultório Principal'),
      roomNumber: roomNumber.trim() || undefined,
      hourlyRentalCost: officeType === 'fisico' && hourlyCost ? Number(hourlyCost) : undefined,
      secretaryPhone: secretaryPhone.trim() || undefined,
      wifiPassword: wifiPassword.trim() || undefined,
      operatingHours: operatingHours.trim(),
    };

    onAddOffice(newOff);
    setShowNewOfficeModal(false);
    setOfficeName('');
    setOfficeAddress('');
    setRoomNumber('');
    setHourlyCost('');
    setSecretaryPhone('');
    setWifiPassword('');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-[#120b24] border border-[#2a1b4e]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#bf5af2] uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Gestão do Consultório Híbrido (Virtual & Físico)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Administração de Consultórios & Contratos TCLE
          </h1>
          <p className="text-xs text-purple-300/70">
            Gerencie consultórios físicos (salas e sublocação), salas virtuais de telemedicina E2EE, termos de consentimento e dados do profissional.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-[#0b0616] p-1.5 rounded-2xl border border-[#2a1b4e] flex-wrap">
          <button
            onClick={() => setActiveTab('locais')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'locais'
                ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-md'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            Locais de Atendimento ({offices.length})
          </button>
          <button
            onClick={() => setActiveTab('tcle_contratos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tcle_contratos'
                ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-md'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            TCLE & Contratos Éticos
          </button>
          <button
            onClick={() => setActiveTab('dados_profissional')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dados_profissional'
                ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-md'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            Dados do Profissional (CFP/CFM)
          </button>
        </div>
      </div>

      {/* 1. LOCAIS DE ATENDIMENTO TAB */}
      {activeTab === 'locais' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#bf5af2]" />
              <span>Espaços Clínicos Configurados</span>
            </h2>

            <button
              onClick={() => setShowNewOfficeModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Espaço</span>
            </button>
          </div>

          {offices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offices.map((off) => {
                const isVirtual = off.type === 'virtual';

                return (
                  <div
                    key={off.id}
                    className="p-5 rounded-2xl bg-[#120b24] border border-[#2a1b4e] hover:border-[#bf5af2]/50 transition-all space-y-4 shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isVirtual
                            ? 'bg-[#ff007f]/20 text-[#ff007f] border border-[#ff007f]/40'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {isVirtual ? 'Telemedicina HD' : 'Consultório Presencial'}
                        </span>

                        {off.hourlyRentalCost && (
                          <span className="text-xs font-mono font-bold text-purple-300">
                            R$ {off.hourlyRentalCost.toFixed(2)} / hora
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white">{off.name}</h3>

                      <div className="text-xs text-purple-300/80 space-y-1.5 pt-1">
                        <p className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#bf5af2] shrink-0 mt-0.5" />
                          <span className="break-words">{off.address}</span>
                        </p>

                        {off.roomNumber && (
                          <p className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>{off.roomNumber}</span>
                          </p>
                        )}

                        {off.secretaryPhone && (
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>Secretaria: {off.secretaryPhone}</span>
                          </p>
                        )}

                        {off.wifiPassword && (
                          <p className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Wifi className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>Wi-Fi: {off.wifiPassword}</span>
                          </p>
                        )}

                        <p className="flex items-center gap-1.5 text-[11px] text-purple-400/60 pt-1">
                          <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>{off.operatingHours}</span>
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-[#2a1b4e]">
                      {isVirtual ? (
                        <button
                          onClick={() => handleCopyTelemedLink(off.address)}
                          className="w-full py-2 rounded-xl bg-[#0b0616] hover:bg-[#1a0f35] border border-[#2a1b4e] text-xs font-semibold text-[#bf5af2] flex items-center justify-center gap-1.5 transition-all"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Link Permanente Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Link da Sala Virtual</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="text-center text-[11px] text-emerald-400 font-semibold py-1">
                          ✓ Consultório Ativo para Agendamentos
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 rounded-3xl bg-[#120b24] border border-[#2a1b4e] text-center space-y-3">
              <Building2 className="w-10 h-10 text-purple-400/40 mx-auto" />
              <div>
                <p className="text-sm font-bold text-white">Nenhum Espaço Clínico Cadastrado</p>
                <p className="text-xs text-purple-300/70 mt-1 max-w-md mx-auto">
                  Cadastre seus consultórios físicos (salas de atendimento, clínicas ou sublocações) ou crie salas virtuais para telemedicina segura.
                </p>
              </div>
              <button
                onClick={() => setShowNewOfficeModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Primeiro Espaço</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. TCLE & CONTRATOS ÉTICOS TAB */}
      {activeTab === 'tcle_contratos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-[#120b24] border border-[#2a1b4e] space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#bf5af2] uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Termo de Consentimento Livre e Esclarecido (TCLE)</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Consentimento Informado para Teleatendimento
              </h3>
              <p className="text-xs text-purple-200/80 leading-relaxed">
                Em conformidade com a <strong>Resolução CFP nº 04/2020</strong> e <strong>Resolução CFM nº 2.314/2022</strong>, além da Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>

              <div className="p-4 bg-[#0b0616] rounded-2xl border border-[#2a1b4e] text-xs text-purple-200/80 space-y-2 font-mono text-[11px]">
                <p>1. O paciente declara estar ciente de que o atendimento é realizado via plataforma criptografada de alta segurança.</p>
                <p>2. É estritamente proibida a gravação de áudio ou vídeo da sessão por qualquer das partes sem consentimento formal prévio.</p>
                <p>3. O sigilo profissional é resguardado conforme o Código de Ética Profissional.</p>
                <p>4. Em caso de intercorrência técnica ou crise aguda, será acionado o contato de emergência cadastrado.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-purple-300 block">Status de Assinatura dos Pacientes</label>
                {patients.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {patients.map((p) => (
                      <div key={p.id} className="p-2.5 rounded-xl bg-[#0b0616] border border-[#2a1b4e] flex items-center justify-between text-xs">
                        <span className="text-white font-semibold">{p.name}</span>
                        <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Assinado Digitalmente
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-[#0b0616] rounded-xl border border-[#2a1b4e] text-center text-xs text-purple-300/60">
                    Cadastre pacientes para acompanhar o status de envio e assinatura do TCLE.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-[#120b24] border border-[#2a1b4e] space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#bf5af2] uppercase">
                <FileText className="w-4 h-4" />
                <span>Contrato de Prestação de Serviços & Política de Faltas</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Contrato Terapêutico & Regras de No-Show
              </h3>
              <p className="text-xs text-purple-200/80 leading-relaxed">
                Define honorários, frequência semanal das sessões e política de cancelamento com aviso prévio mínimo de 24 horas.
              </p>

              <div className="p-4 bg-[#0b0616] rounded-2xl border border-[#2a1b4e] text-xs text-purple-200/80 space-y-2 text-[11px]">
                <p><strong>• Honorários:</strong> Valores pactuados por sessão de 50 minutos com emissão de recibo para dedução de IRPF.</p>
                <p><strong>• Cancelamentos / Reagendamento:</strong> Cancelamentos com menos de 24h de antecedência implicam cobrança integral da sessão.</p>
                <p><strong>• Recesso Terapêutico:</strong> Férias e recessos comunicados com 30 dias de antecedência mútua.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#180e2e] border border-[#bf5af2] space-y-2">
                <span className="text-xs font-bold text-[#bf5af2] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gerar Contrato Personalizado para Novo Paciente</span>
                </span>
                <p className="text-xs text-purple-300/70">
                  A Alegra AI preenche automaticamente as cláusulas com os dados do profissional e do paciente.
                </p>
                <button
                  onClick={() => alert('Modelo de contrato pronto para emissão e personalização!')}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  Gerar Contrato em PDF Timbrado
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 3. DADOS DO PROFISSIONAL TAB */}
      {activeTab === 'dados_profissional' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#120b24] border border-[#2a1b4e] space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#bf5af2]" />
              <span>Dados Profissionais & Timbre Clínico</span>
            </h2>
            <p className="text-xs text-purple-300/70">
              Esses dados são impressos automaticamente no cabeçalho e rodapé de todos os seus laudos, receitas, atestados e recibos.
            </p>
          </div>

          {isSavedAlert && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Dados profissionais salvos com sucesso!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfessional} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-purple-300 font-semibold block mb-1">Nome Completo do Profissional *</label>
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  placeholder="Ex: Dra. Maria Silva ou Dr. João Santos"
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:border-[#bf5af2] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-purple-300 font-semibold block mb-1">Número de Registro (CRP / CRM) *</label>
                <input
                  type="text"
                  value={profCouncilNumber}
                  onChange={(e) => setProfCouncilNumber(e.target.value)}
                  placeholder="Ex: CRP 06/123456 ou CRM 123456-SP"
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:border-[#bf5af2] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-purple-300 font-semibold block mb-1">RQE / Especialidade Formal (Opcional)</label>
              <input
                type="text"
                value={profRqe}
                onChange={(e) => setProfRqe(e.target.value)}
                placeholder="Ex: RQE 78.432 (Psiquiatria da Infância) ou Título de Especialista em Neuropsicologia"
                className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-purple-300 font-semibold block mb-1">E-mail Profissional</label>
                <input
                  type="email"
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                  placeholder="contato@consultorio.com.br"
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-purple-300 font-semibold block mb-1">Telefone / WhatsApp Comercial</label>
                <input
                  type="text"
                  value={profPhone}
                  onChange={(e) => setProfPhone(e.target.value)}
                  placeholder="(11) 98888-8888"
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-purple-300 font-semibold block mb-1">Nome da Clínica / Consultório</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Ex: Consultório de Psicologia Clínica & Psiquiatria"
                className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-purple-300 font-semibold block mb-1">Endereço Principal / Cidade</label>
              <input
                type="text"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                placeholder="Ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-purple-300 font-semibold block mb-1">Chave PIX para Recebimento de Honorários</label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, CNPJ, E-mail ou Celular"
                className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                Salvar Configurações do Consultório
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Office Modal */}
      {showNewOfficeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#120b24] border border-[#bf5af2] p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Cadastrar Espaço Clínico</h3>
            
            <form onSubmit={handleCreateOffice} className="space-y-3.5 text-xs">
              <div>
                <label className="text-purple-300 font-semibold block mb-1">Nome do Espaço *</label>
                <input
                  type="text"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  placeholder="Ex: Consultório Principal - Sala 4"
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#bf5af2]"
                  required
                />
              </div>

              <div>
                <label className="text-purple-300 font-semibold block mb-1">Modalidade</label>
                <select
                  value={officeType}
                  onChange={(e) => setOfficeType(e.target.value as 'fisico' | 'virtual')}
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                >
                  <option value="fisico" className="bg-[#120b24]">Consultório Físico (Presencial)</option>
                  <option value="virtual" className="bg-[#120b24]">Sala Virtual (Telemedicina)</option>
                </select>
              </div>

              <div>
                <label className="text-purple-300 font-semibold block mb-1">
                  {officeType === 'fisico' ? 'Endereço Completo' : 'Link da Sala Permanente'}
                </label>
                <input
                  type="text"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  placeholder={officeType === 'fisico' ? 'Rua, número, bairro e cidade' : 'https://telemed.psicool.com.br/...'}
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                />
              </div>

              {officeType === 'fisico' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-purple-300 font-semibold block mb-1">Número da Sala</label>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="Sala 112"
                      className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-purple-300 font-semibold block mb-1">Custo / Hora (R$)</label>
                    <input
                      type="number"
                      value={hourlyCost}
                      onChange={(e) => setHourlyCost(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Ex: 45"
                      className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewOfficeModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1a0f35] text-purple-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white font-bold shadow-lg"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
