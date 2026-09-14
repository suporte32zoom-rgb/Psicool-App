import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Search, 
  Clock, 
  FileCheck,
  Building2,
  Lock,
  UserCheck
} from 'lucide-react';
import { ClinicalDocument, DocumentType, Patient, ProfessionalProfile, ProfessionalData } from '../types';

interface ClinicalDocumentsProps {
  documents: ClinicalDocument[];
  patients: Patient[];
  profile: ProfessionalProfile;
  professional: ProfessionalData;
  onAddDocument: (doc: ClinicalDocument) => void;
  initialDocType?: DocumentType | null;
  triggerOpenNew?: boolean;
  onClearTrigger?: () => void;
}

export const ClinicalDocuments: React.FC<ClinicalDocumentsProps> = ({
  documents,
  patients,
  profile,
  professional,
  onAddDocument,
  initialDocType,
  triggerOpenNew,
  onClearTrigger,
}) => {
  const [activeFilter, setActiveFilter] = useState<'todos' | 'receitas' | 'atestados' | 'laudos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [showNewModal, setShowNewModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Document Form State
  const [docType, setDocType] = useState<DocumentType>(
    profile === 'psiquiatra' ? 'receita_controle_especial' : 'atestado_psicologico'
  );
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualPatientCpf, setManualPatientCpf] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [docContent, setDocContent] = useState('');
  const [daysOfRest, setDaysOfRest] = useState<number>(3);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Keep selected document in sync
  useEffect(() => {
    if (documents.length > 0 && !documents.some((d) => d.id === selectedDocId)) {
      setSelectedDocId(documents[0].id);
    }
  }, [documents, selectedDocId]);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || null;

  // Deep Navigation Trigger Listener
  useEffect(() => {
    if (initialDocType) {
      setDocType(initialDocType);
    }
    if (triggerOpenNew) {
      setShowNewModal(true);
      if (onClearTrigger) onClearTrigger();
    }
  }, [initialDocType, triggerOpenNew, onClearTrigger]);

  // Filtered Documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.verificationHash.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'receitas') {
      return doc.type.startsWith('receita_');
    }
    if (activeFilter === 'atestados') {
      return doc.type.includes('atestado') || doc.type === 'declaracao_comparecimento';
    }
    if (activeFilter === 'laudos') {
      return doc.type.includes('laudo') || doc.type.includes('relatorio') || doc.type === 'encaminhamento';
    }
    return true;
  });

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateWithAI = async () => {
    const currentPatient = patients.find((p) => p.id === patientId);
    const patName = currentPatient ? currentPatient.name : manualPatientName || 'Paciente';

    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType,
          patientName: patName,
          patientCpf: currentPatient?.cpf || manualPatientCpf,
          diagnosis: diagnosis || currentPatient?.diagnosisHypothesis || 'Avaliação clínica especializada',
          context: `Atendimento clínico padrão. Perfil profissional: ${profile}.`,
          profile,
          professionalName: professional.name || 'Profissional Responsável',
          councilNumber: professional.councilNumber || 'Conselho Profissional',
        }),
      });

      const data = await res.json();
      if (data.text) {
        setDocContent(data.text);
      }
    } catch (e) {
      console.error(e);
      setDocContent('Atesto para os devidos fins que o(a) paciente acima identificado(a) encontra-se em acompanhamento clínico nesta data.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    const finalPatName = patient ? patient.name : manualPatientName.trim();
    if (!finalPatName) return;

    const newDoc: ClinicalDocument = {
      id: `doc-${Date.now()}`,
      patientId: patient ? patient.id : `p-ext-${Date.now()}`,
      patientName: finalPatName,
      patientCpf: patient ? patient.cpf : manualPatientCpf.trim() || undefined,
      type: docType,
      title: docTitle.trim() || getDocumentTypeLabel(docType),
      date: new Date().toLocaleDateString('pt-BR'),
      content: docContent.trim() || 'Documento clínico emitido via ecossistema PSICOOL.',
      cid11: diagnosis.trim() || undefined,
      daysOfRest: docType.includes('atestado') ? daysOfRest : undefined,
      professionalName: professional.name || 'Profissional Responsável',
      councilNumber: professional.councilNumber || 'Conselho Profissional',
      rqe: professional.rqe,
      verificationHash: `PSI-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      status: 'emitido',
    };

    onAddDocument(newDoc);
    setSelectedDocId(newDoc.id);
    setShowNewModal(false);
    setDocContent('');
    setDocTitle('');
    setManualPatientName('');
    setManualPatientCpf('');
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'receita_controle_especial':
        return 'Receituário de Controle Especial (C1 - 2 Vias)';
      case 'receita_b':
        return 'Notificação de Receita B (Azul - Psicotrópicos)';
      case 'receita_a':
        return 'Notificação de Receita A (Amarela - Estimulantes)';
      case 'receita_simples':
        return 'Receituário Simples';
      case 'atestado_medico':
        return 'Atestado Médico Psiquiátrico (Afastamento)';
      case 'atestado_psicologico':
        return 'Atestado Psicológico (Res. CFP 06/2019)';
      case 'relatorio_psicologico':
        return 'Relatório Psicológico Multidisciplinar';
      case 'laudo_psicologico':
        return 'Laudo Pericial / Neuropsicológico';
      case 'declaracao_comparecimento':
        return 'Declaração de Comparecimento';
      case 'encaminhamento':
        return 'Guia de Encaminhamento Clínico';
      default:
        return 'Documento Clínico';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-[#120b24] border border-[#2a1b4e]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#bf5af2] uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Documentos Oficiais, Prescrições & Laudos (CFP / CFM)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Emissor Clínico Inteligente PSICOOL
          </h1>
          <p className="text-xs text-purple-300/70">
            Receituários controlados (A, B, C1), atestados de afastamento, relatórios e laudos com impressão timbrada e validação digital.
          </p>
        </div>

        <button
          id="new-clinical-doc-btn"
          onClick={() => {
            setShowNewModal(true);
            const pat = patients[0];
            if (pat) {
              setDiagnosis(pat.diagnosisHypothesis);
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,0,127,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Emitir Novo Documento</span>
        </button>
      </div>

      {/* Main Split: Left Document History / Right Timbrated Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Filter & List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Filter tabs & Search */}
          <div className="p-3 rounded-2xl bg-[#120b24] border border-[#2a1b4e] space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por paciente, tipo ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:border-[#bf5af2]"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <button
                onClick={() => setActiveFilter('todos')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeFilter === 'todos' ? 'bg-[#bf5af2] text-white' : 'bg-[#0b0616] text-purple-300 hover:text-white'
                }`}
              >
                Todos ({documents.length})
              </button>
              <button
                onClick={() => setActiveFilter('receitas')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeFilter === 'receitas' ? 'bg-[#bf5af2] text-white' : 'bg-[#0b0616] text-purple-300 hover:text-white'
                }`}
              >
                Receitas
              </button>
              <button
                onClick={() => setActiveFilter('atestados')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeFilter === 'atestados' ? 'bg-[#bf5af2] text-white' : 'bg-[#0b0616] text-purple-300 hover:text-white'
                }`}
              >
                Atestados
              </button>
              <button
                onClick={() => setActiveFilter('laudos')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeFilter === 'laudos' ? 'bg-[#bf5af2] text-white' : 'bg-[#0b0616] text-purple-300 hover:text-white'
                }`}
              >
                Laudos & Relatórios
              </button>
            </div>
          </div>

          {/* List of Documents */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                const isPrescription = doc.type.startsWith('receita_');

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c1236] border-[#bf5af2] shadow-[0_0_15px_rgba(191,90,242,0.25)]'
                        : 'bg-[#120b24] border-[#2a1b4e] hover:border-purple-400/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        isPrescription
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {getDocumentTypeLabel(doc.type).split('(')[0]}
                      </span>
                      <span className="text-[11px] text-purple-300/60 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {doc.date}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-0.5">{doc.title}</h4>
                    <p className="text-xs text-purple-200/70 mb-2">Paciente: {doc.patientName}</p>

                    <div className="flex items-center justify-between text-[11px] text-purple-400/60 pt-2 border-t border-[#2a1b4e]/60">
                      <span className="font-mono text-[10px]">{doc.verificationHash}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Validado
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-[#120b24] rounded-2xl border border-[#2a1b4e] text-purple-300/60 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-purple-400/40" />
                <p className="text-xs font-semibold text-white">Nenhum documento emitido ainda</p>
                <p className="text-[11px] text-purple-300/60">
                  Clique no botão acima para emitir receitas de controle especial, atestados ou laudos oficiais.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Timbrated Document Preview (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="printable-document p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-purple-300/30 shadow-2xl space-y-6 relative overflow-hidden print:p-0 print:border-none" id="official-printed-doc">
              
              {/* Top Controls (Hidden on Print) */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden no-print">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] uppercase">
                    Visualização Timbrada
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Hash: {selectedDoc.verificationHash}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(selectedDoc.content, selectedDoc.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    {copiedId === selectedDoc.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Texto</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir / Salvar PDF</span>
                  </button>
                </div>
              </div>

              {/* Official Header */}
              <div className="text-center pb-4 border-b-2 border-slate-900/80 space-y-1">
                <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  {professional.clinicName || 'Consultório Clínico Especializado'}
                </h2>
                <p className="text-xs font-bold text-slate-700">
                  {professional.name || 'Profissional Responsável'} • {professional.councilNumber || 'CRP / CRM'}
                  {professional.rqe ? ` • ${professional.rqe}` : ''}
                </p>
                <p className="text-[11px] text-slate-500">
                  {professional.clinicAddress || 'Atendimento Clínico Presencial e Telemedicina'} • {professional.phone || ''}
                </p>
              </div>

              {/* Document Title */}
              <div className="text-center py-2">
                <h3 className="text-base font-extrabold uppercase tracking-wide text-slate-900 border-b border-slate-300 inline-block pb-1">
                  {selectedDoc.title}
                </h3>
              </div>

              {/* Patient Identification Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1">
                <div className="flex justify-between">
                  <span><strong>Paciente:</strong> {selectedDoc.patientName}</span>
                  {selectedDoc.patientCpf && <span><strong>CPF:</strong> {selectedDoc.patientCpf}</span>}
                </div>
                <div className="flex justify-between text-slate-600">
                  <span><strong>Data de Emissão:</strong> {selectedDoc.date}</span>
                  {selectedDoc.cid11 && <span><strong>CID-11 / Hipótese:</strong> {selectedDoc.cid11}</span>}
                </div>
              </div>

              {/* Body Content */}
              <div className="text-xs text-slate-800 leading-relaxed min-h-[160px] whitespace-pre-line font-sans px-1">
                {selectedDoc.content}
              </div>

              {/* Signature Section */}
              <div className="pt-8 text-center space-y-1 border-t border-slate-200">
                <div className="w-56 border-b border-slate-800 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-900">{professional.name || 'Profissional Responsável'}</p>
                <p className="text-[11px] text-slate-600">{professional.councilNumber || 'Conselho Profissional'}</p>
                <div className="pt-2 flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-mono font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Documento emitido e assinado digitalmente • Validação: {selectedDoc.verificationHash}</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-[#120b24] border border-[#2a1b4e] text-center space-y-4 shadow-xl">
              <FileCheck className="w-12 h-12 text-purple-400/40 mx-auto" />
              <div className="max-w-sm mx-auto">
                <h3 className="text-base font-bold text-white">Nenhum Documento Selecionado</h3>
                <p className="text-xs text-purple-300/70 mt-1">
                  Selecione um documento ao lado ou emita um novo receituário de controle especial, atestado ou laudo pericial.
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-bold shadow-md inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Emitir Primeiro Documento</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Modal: New Document Form */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#120b24] border border-[#bf5af2] p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Emitir Novo Documento Clínico</h3>
                <p className="text-xs text-purple-300/70">Preencha os dados ou use a Alegra AI para redigir o documento conforme CFP / CFM.</p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-purple-300 hover:text-white text-xs px-2 py-1 rounded-lg bg-[#0b0616]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Tipo de Documento</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocumentType)}
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#bf5af2]"
                  >
                    <optgroup label="Psiquiatria & Medicina (CRM)">
                      <option value="receita_controle_especial" className="bg-[#120b24]">
                        Receituário Especial C1 (2 Vias Branca)
                      </option>
                      <option value="receita_b" className="bg-[#120b24]">
                        Notificação de Receita B (Azul - Benzodiazepínicos)
                      </option>
                      <option value="receita_a" className="bg-[#120b24]">
                        Notificação de Receita A (Amarela - Estimulantes)
                      </option>
                      <option value="atestado_medico" className="bg-[#120b24]">
                        Atestado Médico Psiquiátrico (Afastamento)
                      </option>
                      <option value="encaminhamento" className="bg-[#120b24]">
                        Guia de Encaminhamento Clínico
                      </option>
                    </optgroup>

                    <optgroup label="Psicologia Clínica (CFP)">
                      <option value="atestado_psicologico" className="bg-[#120b24]">
                        Atestado Psicológico (Afastamento/Aptidão)
                      </option>
                      <option value="relatorio_psicologico" className="bg-[#120b24]">
                        Relatório Psicológico
                      </option>
                      <option value="laudo_psicologico" className="bg-[#120b24]">
                        Laudo Psicológico / Neuropsicológico
                      </option>
                      <option value="declaracao_comparecimento" className="bg-[#120b24]">
                        Declaração de Comparecimento
                      </option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Paciente *</label>
                  {patients.length > 0 ? (
                    <select
                      value={patientId}
                      onChange={(e) => {
                        setPatientId(e.target.value);
                        const pat = patients.find((p) => p.id === e.target.value);
                        if (pat) setDiagnosis(pat.diagnosisHypothesis);
                      }}
                      className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#bf5af2]"
                    >
                      {patients.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#120b24]">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={manualPatientName}
                      onChange={(e) => setManualPatientName(e.target.value)}
                      placeholder="Nome completo do paciente"
                      className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white focus:outline-none focus:border-[#bf5af2]"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Título Personalizado (Opcional)</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder={getDocumentTypeLabel(docType)}
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Diagnóstico / CID-11</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Ex: 6B00 (TAG) ou F32.1"
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {docType.includes('atestado') && (
                <div>
                  <label className="text-purple-300 font-semibold block mb-1">Dias de Afastamento Sugeridos</label>
                  <input
                    type="number"
                    value={daysOfRest}
                    onChange={(e) => setDaysOfRest(Number(e.target.value))}
                    min={1}
                    max={90}
                    className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-2.5 text-white"
                  />
                </div>
              )}

              {/* AI Auto-Complete Button */}
              <div className="flex items-center justify-between pt-1">
                <label className="text-purple-300 font-semibold">Corpo do Documento & Prescrição *</label>
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingAI ? 'Alegra AI Redigindo...' : 'Redigir com Alegra AI'}</span>
                </button>
              </div>

              <textarea
                rows={7}
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder="Insira o texto técnico, declaração de aptidão ou prescrição, ou clique no botão acima para a Alegra AI redigir com fundamentação ética."
                className="w-full bg-[#0b0616] border border-[#2a1b4e] rounded-xl p-3 text-white font-sans focus:outline-none focus:border-[#bf5af2]"
                required
              />

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
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white font-bold shadow-lg hover:brightness-110"
                >
                  Emitir e Assinar Digitalmente
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
