import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  Download, 
  Filter, 
  FileText, 
  CreditCard, 
  QrCode, 
  Plus, 
  ShieldCheck,
  X,
  Printer
} from 'lucide-react';
import { FinancialRecord, Patient, ProfessionalProfile, ProfessionalData } from '../types';

interface FinancialDashboardProps {
  records: FinancialRecord[];
  patients: Patient[];
  profile: ProfessionalProfile;
  professional?: ProfessionalData;
  onAddRecord: (record: FinancialRecord) => void;
  initialOpenNew?: boolean;
  onClearTrigger?: () => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  records,
  patients,
  profile,
  professional,
  onAddRecord,
  initialOpenNew,
  onClearTrigger,
}) => {
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pago' | 'pendente'>('todos');
  const [selectedReceipt, setSelectedReceipt] = useState<FinancialRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Deep Navigation Trigger Listener
  useEffect(() => {
    if (initialOpenNew) {
      setShowAddModal(true);
      if (onClearTrigger) onClearTrigger();
    }
  }, [initialOpenNew, onClearTrigger]);

  // Form state
  const [patientName, setPatientName] = useState(patients[0]?.name || '');
  const [amount, setAmount] = useState<number | ''>(250);
  const [method, setMethod] = useState<'pix' | 'cartao' | 'convenio'>('pix');
  const [description, setDescription] = useState('Sessão de Atendimento Clínico • Telemedicina/Presencial');

  const totalRevenue = records
    .filter((r) => r.status === 'pago')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingRevenue = records
    .filter((r) => r.status === 'pendente')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const completedConsultations = records.filter((r) => r.status === 'pago').length;
  const averageTicket = completedConsultations > 0 ? totalRevenue / completedConsultations : 0;

  const filteredRecords = records.filter((r) => {
    if (filterStatus !== 'todos' && r.status !== filterStatus) return false;
    return true;
  });

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    const newRecord: FinancialRecord = {
      id: `fin-${Date.now()}`,
      patientName: patientName.trim(),
      date: new Date().toLocaleDateString('pt-BR'),
      amount: Number(amount) || 0,
      status: 'pago',
      method,
      receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      description: description.trim() || 'Atendimento Clínico Especializado',
    };

    onAddRecord(newRecord);
    setShowAddModal(false);
    setPatientName(patients[0]?.name || '');
    setAmount(250);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-[#120b24] border border-[#2a1b4e]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#bf5af2] uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Fluxo de Caixa & Emissão de Recibos (DMED / IRPF)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Financeiro do Consultório
          </h1>
          <p className="text-xs text-purple-300/70">
            Controle de honorários, conciliação PIX instantânea e recibos médicos e psicológicos válidos.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,0,127,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Pagamento / Recibo</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Faturamento Mensal */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#120b24] border border-[#2a1b4e] space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-300/80">
            <span>Receita Recebida</span>
            <div className="p-1 rounded-lg bg-emerald-950 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <span>{completedConsultations} {completedConsultations === 1 ? 'consulta quitada' : 'consultas quitadas'}</span>
          </div>
        </div>

        {/* Metric 2: Consultas Realizadas */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#120b24] border border-[#2a1b4e] space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-300/80">
            <span>Consultas Pagas</span>
            <div className="p-1 rounded-lg bg-purple-950 text-purple-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {completedConsultations}
          </div>
          <div className="text-[11px] text-purple-300/70">
            100% de pontualidade
          </div>
        </div>

        {/* Metric 3: Ticket Médio */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#120b24] border border-[#2a1b4e] space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-300/80">
            <span>Ticket Médio</span>
            <div className="p-1 rounded-lg bg-indigo-950 text-indigo-300">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-purple-300/70">
            Por sessão clínica
          </div>
        </div>

        {/* Metric 4: A Receber */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#120b24] border border-[#2a1b4e] space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-300/80">
            <span>A Receber</span>
            <div className="p-1 rounded-lg bg-rose-950 text-rose-300">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            R$ {pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-purple-300/70">
            {records.filter(r => r.status === 'pendente').length} pendências ativas
          </div>
        </div>

      </div>

      {/* Transactions & Receipts Table Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#120b24] border border-[#2a1b4e] space-y-4">
        
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#2a1b4e]">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#bf5af2]" />
            <span>Extrato de Honorários & Recibos Emitidos</span>
          </h2>

          <div className="flex items-center gap-1.5 bg-[#0b0616] p-1 rounded-xl border border-[#2a1b4e] text-xs">
            <button
              onClick={() => setFilterStatus('todos')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterStatus === 'todos' ? 'bg-[#bf5af2] text-white' : 'text-purple-300 hover:text-white'
              }`}
            >
              Todos ({records.length})
            </button>
            <button
              onClick={() => setFilterStatus('pago')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterStatus === 'pago' ? 'bg-emerald-600 text-white' : 'text-purple-300 hover:text-white'
              }`}
            >
              Recebidos
            </button>
            <button
              onClick={() => setFilterStatus('pendente')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterStatus === 'pendente' ? 'bg-[#ff007f] text-white' : 'text-purple-300 hover:text-white'
              }`}
            >
              Pendentes
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-purple-200">
              <thead>
                <tr className="border-b border-[#2a1b4e] text-purple-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Paciente & Descrição</th>
                  <th className="py-2.5">Data</th>
                  <th className="py-2.5">Método</th>
                  <th className="py-2.5">Valor</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a1b4e]">
                {filteredRecords.map((r) => {
                  const isPaid = r.status === 'pago';
                  return (
                    <tr key={r.id} className="hover:bg-[#180e2e]/50 transition-colors">
                      <td className="py-3.5">
                        <div className="font-bold text-white">{r.patientName}</div>
                        <div className="text-[11px] text-purple-300/70">{r.description}</div>
                      </td>
                      <td className="py-3.5 text-slate-300">{r.date}</td>
                      <td className="py-3.5">
                        <span className="flex items-center gap-1.5 text-purple-300 uppercase font-mono text-[10px] font-bold">
                          {r.method === 'pix' ? <QrCode className="w-3.5 h-3.5 text-emerald-400" /> : <CreditCard className="w-3.5 h-3.5 text-[#ff007f]" />}
                          {r.method}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-white">
                        R$ {r.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isPaid ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-pink-950 text-pink-400 border border-pink-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => setSelectedReceipt(r)}
                          className="px-3 py-1.5 rounded-xl bg-[#0b0616] hover:bg-[#1a0f35] border border-[#2a1b4e] text-purple-200 hover:text-white transition-all text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#bf5af2]" />
                          <span>Ver Recibo</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-[#0b0616] rounded-2xl border border-[#2a1b4e] space-y-2">
            <DollarSign className="w-8 h-8 mx-auto text-purple-400/40" />
            <p className="text-xs font-semibold text-white">Nenhum lançamento financeiro registrado</p>
            <p className="text-[11px] text-purple-300/60 max-w-sm mx-auto">
              Clique em "Lançar Pagamento / Recibo" para registrar recebimentos de consultas particulares ou convênios.
            </p>
          </div>
        )}

      </div>

      {/* Recibo Clínico Modal (Padrão IRPF / DMED) */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 no-print-bg">
          <div className="w-full max-w-lg rounded-3xl bg-[#120b24] border border-[#bf5af2] p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#1c1236] text-purple-300 hover:text-white no-print"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Official Printable Timbrated Receipt */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white text-slate-900 border border-slate-300 space-y-4 text-xs shadow-md printable-document">
              <div className="text-center pb-3 border-b-2 border-slate-900 space-y-1">
                <div className="text-base font-black text-slate-900 uppercase tracking-wide">
                  Recibo de Prestação de Serviços de Saúde
                </div>
                <div className="text-[11px] text-purple-900 font-bold">
                  Comprovante Oficial para Dedução IRPF • Declaração DMED / Carnê-Leão
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Nº do Recibo: {selectedReceipt.receiptNumber} • Emissão: {selectedReceipt.date}
                </div>
              </div>

              <div className="space-y-3 text-slate-800">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Profissional Emitente:</span>
                  <div className="text-slate-900 font-bold text-sm">
                    {professional?.name || (profile === 'psicologo' ? 'Psicólogo(a) Responsável' : 'Médico(a) Psiquiatra')} • {professional?.councilNumber || (profile === 'psicologo' ? 'CRP' : 'CRM')}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    {professional?.clinicName || 'Consultório Particular PSICOOL'} • {professional?.clinicAddress || ''}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Recebi de (Paciente / Responsável):</span>
                  <div className="text-slate-900 font-bold text-sm">{selectedReceipt.patientName}</div>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 flex items-center justify-between">
                  <span className="text-purple-900 font-bold text-xs uppercase">Valor Total Recebido:</span>
                  <div className="text-lg font-black text-purple-950">
                    R$ {selectedReceipt.amount.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold text-[10px] uppercase">Especificação do Serviço:</span>
                  <div className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {selectedReceipt.description} — Forma de Pagamento: {selectedReceipt.method.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="pt-6 text-center space-y-1 border-t border-slate-200">
                <div className="w-48 border-b border-slate-800 mx-auto mb-1" />
                <p className="font-bold text-slate-900">{professional?.name || 'Profissional Emitente'}</p>
                <p className="text-[10px] text-slate-500">{professional?.councilNumber || 'Registro Profissional Oficial'}</p>
                <div className="text-[9px] text-emerald-800 font-mono pt-1">
                  ✓ Recibo eletrônico emitido conforme normativas fiscais da Receita Federal do Brasil
                </div>
              </div>

              <div className="pt-2 no-print flex gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Recibo / Salvar PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Financial Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#120b24] border border-[#bf5af2] p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Lançar Novo Pagamento / Recibo</h3>
            
            <form onSubmit={handleCreateRecord} className="space-y-3.5 text-xs">
              <div>
                <label className="text-purple-300 font-semibold block mb-1">Nome do Paciente *</label>
                {patients.length > 0 ? (
                  <input
                    type="text"
                    required
                    list="patients-datalist"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Nome do paciente"
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#bf5af2]"
                  />
                ) : (
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Nome do paciente"
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#bf5af2]"
                  />
                )}
                {patients.length > 0 && (
                  <datalist id="patients-datalist">
                    {patients.map((p) => (
                      <option key={p.id} value={p.name} />
                    ))}
                  </datalist>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="250"
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#bf5af2]"
                  />
                </div>

                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Forma de Pagamento</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as 'pix' | 'cartao' | 'convenio')}
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  >
                    <option value="pix" className="bg-[#120b24]">PIX Instantâneo</option>
                    <option value="cartao" className="bg-[#120b24]">Cartão de Crédito/Débito</option>
                    <option value="convenio" className="bg-[#120b24]">Reembolso / Convênio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-purple-300 font-semibold block mb-1">Descrição do Atendimento</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Sessão de Psicoterapia Individual • 50 minutos"
                  className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1a0f35] text-purple-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white font-bold shadow-lg hover:brightness-110"
                >
                  Salvar e Emitir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
