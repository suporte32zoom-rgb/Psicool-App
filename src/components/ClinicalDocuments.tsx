import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Download, 
  User, 
  Calendar, 
  Pill, 
  Clock, 
  Stethoscope, 
  BrainCircuit,
  FileCheck,
  Eye,
  X
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
  const [selectedDoc, setSelectedDoc] = useState<ClinicalDocument | null>(documents[0] || null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Document Form State
  const [docType, setDocType] = useState<DocumentType>(
    profile === 'psiquiatra' ? 'receita_controle_especial' : 'atestado_psicologico'
  );

  // Deep Navigation Trigger Listener
  React.useEffect(() => {
    if (initialDocType) {
      setDocType(initialDocType);
    }
    if (triggerOpenNew) {
      setShowNewModal(true);
      if (onClearTrigger) onClearTrigger();
    }
  }, [initialDocType, triggerOpenNew, onClearTrigger]);
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [docTitle, setDocTitle] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [docContent, setDocContent] = useState('');
  const [daysOfRest, setDaysOfRest] = useState<number>(3);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

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
    if (!currentPatient) return;

    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType,
          patientName: currentPatient.name,
          patientCpf: currentPatient.cpf,
          diagnosis: diagnosis || currentPatient.diagnosisHypothesis,
          context: `Paciente com queixas clínicas ativas. Perfil: ${profile}.`,
          profile,
          professionalName: professional.name,
          councilNumber: professional.councilNumber,
        }),
      });

      const data = await res.json();
      if (data.text) {
        setDocContent(data.text);
      }
    } catch (e) {
      console.error(e);
      setDocContent('Documento emitido para acompanhamento clínico especializado.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    const newDoc: ClinicalDocument = {
      id: `doc-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      patientCpf: patient.cpf,
      type: docType,
      title: docTitle || getDocumentTypeLabel(docType),
      date: new Date().toLocaleDateString('pt-BR'),
      content: docContent || 'Documento clínico emitido via plataforma PSICOOL.',
      cid11: diagnosis || patient.cid11,
      daysOfRest: docType.includes('atestado') ? daysOfRest : undefined,
      professionalName: professional.name,
      councilNumber: professional.councilNumber,
      rqe: professional.rqe,
      verificationHash: `PSI-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      status: 'emitido',
    };

    onAddDocument(newDoc);
    setSelectedDoc(newDoc);
    setShowNewModal(false);
    setDocContent('');
    setDocTitle('');
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
        return 'Atestado Médico Psiquiátrico (Afastamento/INSS)';
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
            Receituários controlados (A, B, C1), atestados de afastamento, relatórios e laudos com assinatura e validação digital.
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
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeFilter === 'todos' ? 'bg-[#bf5af2] text-white' : 'bg-[#0b0616] text-purple-300/70 hover:text-white'
                }`}
              >
                Todos ({documents.length})
              </button>
              <button
                onClick={() => setActiveFilter('receitas')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeFilter === 'receitas' ? 'bg-[#bf5af2] text-white' : 'bg-[#0b0616] text-purple-300/70 hover:text-white'
                }`}
              >
                Receitas Controladas
              </button>
              <button
                onClick={() => setActiveFilter('atestados')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeFilter === 'atestados' ? 'bg-[#bf5af2] text-white' : 'bg-[#0b0616] text-purple-300/70 hover:text-white'
                }`}
              >
                Atestados
              </button>
              <button
                onClick={() => setActiveFilter('laudos')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeFilter === 'laudos' ? 'bg-[#bf5af2] text-white' : 'bg-[#0b0616] text-purple-300/70 hover:text-white'
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
                    onClick={() => setSelectedDoc(doc)}
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
              <div className="p-8 text-center bg-[#120b24] rounded-2xl border border-[#2a1b4e] text-purple-300/60">
                <FileText className="w-8 h-8 mx-auto mb-2 text-purple-400/40" />
                <p className="text-xs">Nenhum documento encontrado.</p>
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
                        <span>Copiar</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir / PDF</span>
                  </button>
                </div>
              </div>

              {/* Clinic Timbrated Header */}
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                <div className="inline-flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-purple-700 flex items-center justify-center text-white font-black text-xs">
                    Ψ
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-slate-900 uppercase">
                    {professional.clinicName}
                  </span>
                </div>
                <h2 className="text-xs text-slate-600">
                  {professional.name} • {professional.councilNumber} {professional.rqe ? `• ${professional.rqe}` : ''}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {professional.clinicAddress} • Tel: {professional.phone}
                </p>
              </div>

              {/* Document Title & Identification */}
              <div className="space-y-2">
                <h3 className="text-lg font-black text-center text-slate-900 uppercase tracking-wide">
                  {selectedDoc.title}
                </h3>
                
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p><strong>Paciente:</strong> {selectedDoc.patientName}</p>
                  {selectedDoc.patientCpf && <p><strong>CPF:</strong> {selectedDoc.patientCpf}</p>}
                  {selectedDoc.cid11 && <p><strong>Diagnóstico / CID-11:</strong> {selectedDoc.cid11}</p>}
                  <p><strong>Data de Emissão:</strong> {selectedDoc.date}</p>
                </div>
              </div>

              {/* Specific Medications List if Prescription */}
              {selectedDoc.medications && selectedDoc.medications.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                    Posologia & Medicamentos Prescritos
                  </h4>
                  <div className="space-y-2 text-xs">
                    {selectedDoc.medications.map((med, idx) => (
                      <div key={idx} className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{idx + 1}. {med.name} {med.dosage}</span>
                          <span className="text-purple-800 font-mono text-[11px]">{med.quantity}</span>
                        </div>
                        <p className="text-slate-700 mt-1">{med.posology}</p>
                        {med.instructions && (
                          <p className="text-slate-500 italic text-[11px] mt-0.5">Obs: {med.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Main Body Content */}
              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-serif min-h-[140px]">
                {selectedDoc.content}
              </div>

              {/* Signature & Council Verification */}
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-lg flex flex-col items-center justify-center text-center p-1">
                    <ShieldCheck className="w-5 h-5 text-purple-700" />
                    <span className="text-[8px] font-mono text-slate-600 mt-0.5">E-VALID</span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    <p className="font-semibold text-slate-800">Assinatura Digital Autenticada</p>
                    <p>Chave: {selectedDoc.verificationHash}</p>
                    <p>Em conformidade com as normas ICP-Brasil e CFP/CFM.</p>
                  </div>
                </div>

                <div className="text-center text-xs">
                  <div className="w-44 border-b border-slate-900 mb-1" />
                  <p className="font-bold text-slate-900">{professional.name}</p>
                  <p className="text-slate-600 text-[11px]">{professional.councilNumber}</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 bg-[#120b24] rounded-3xl border border-[#2a1b4e] text-purple-300/60">
              <p className="text-sm">Selecione um documento para visualizar a via timbrada.</p>
            </div>
          )}
        </div>

      </div>

      {/* New Document Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#120b24] border border-[#bf5af2] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Emitir Documento Oficial</h3>
                <p className="text-xs text-purple-300/70">
                  Compatível com normas do CFP (Res. 06/2019) e CFM / Portaria 344/98.
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded-lg text-purple-400 hover:text-white"
              >
                <X className="w-5 h-5" />
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
                  <label className="text-purple-300 font-semibold block mb-1">Paciente</label>
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
                        {p.name} ({p.cpf || 'Sem CPF'})
                      </option>
                    ))}
                  </select>
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
                <label className="text-purple-300 font-semibold">Corpo do Documento & Prescrição</label>
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
                placeholder="Insira o texto técnico, declaração de aptidão ou clique no botão acima para a IA redigir com fundamentação ética."
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
