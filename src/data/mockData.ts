import { 
  Patient, 
  Appointment, 
  FinancialRecord, 
  ClinicalDocument, 
  ScaleAssessment, 
  OfficeSpace, 
  ProfessionalData 
} from '../types';

export const INITIAL_PROFESSIONAL: ProfessionalData = {
  name: 'Dra. Beatriz Albuquerque',
  role: 'Psicólogo Clínico',
  council: 'CRP',
  councilNumber: 'CRP 06/148.920',
  rqe: 'Especialista em Psicologia Clínica e Neuropsicologia',
  email: 'dra.beatriz@psicool.com.br',
  phone: '(11) 98765-4321',
  clinicName: 'Clínica Psicool de Saúde Mental Integrada',
  clinicAddress: 'Av. Paulista, 1842 - Cj 112 - Bela Vista, São Paulo - SP',
  pixKey: 'dra.beatriz@psicool.com.br'
};

export const INITIAL_OFFICES: OfficeSpace[] = [
  {
    id: 'off-1',
    name: 'Consultório Paulista - Sala 112 (Presencial)',
    type: 'fisico',
    address: 'Av. Paulista, 1842, Bela Vista - São Paulo / SP',
    roomNumber: 'Sala 112 (Acústica e Poltrona Reclinável)',
    hourlyRentalCost: 45.00,
    secretaryPhone: '(11) 3284-5500',
    wifiPassword: 'psicool_paulista',
    operatingHours: 'Segunda a Sexta das 08:00 às 20:00'
  },
  {
    id: 'off-2',
    name: 'Sala Virtual Telemedicina HD E2EE (Online)',
    type: 'virtual',
    address: 'https://telemed.psicool.com.br/sala/dra-beatriz',
    roomNumber: 'Sala Criptografada Ponta a Ponta',
    operatingHours: 'Disponibilidade 24/7 para atendimentos remotos'
  },
  {
    id: 'off-3',
    name: 'Consultório Moema - Sublocação (Presencial)',
    type: 'fisico',
    address: 'Alameda dos Maracatins, 450 - Moema, São Paulo / SP',
    roomNumber: 'Sala 03',
    hourlyRentalCost: 50.00,
    secretaryPhone: '(11) 5051-2299',
    wifiPassword: 'moema_clinica',
    operatingHours: 'Terças e Quintas das 13:00 às 19:00'
  }
];

export const INITIAL_DOCUMENTS: ClinicalDocument[] = [
  {
    id: 'doc-1',
    patientId: 'p-1',
    patientName: 'Carolina Mendes Silva',
    patientCpf: '342.891.028-11',
    type: 'receita_controle_especial',
    title: 'Receituário de Controle Especial (C1 - 2 Vias)',
    date: '10/09/2026',
    status: 'emitido',
    professionalName: 'Dr. Rodrigo Vasconcelos',
    councilNumber: 'CRM 152.480-SP',
    rqe: 'RQE 78.432 (Psiquiatria)',
    verificationHash: 'PSI-2026-C1-8894A',
    cid11: '6B00 (Transtorno de Ansiedade Generalizada)',
    medications: [
      {
        name: 'Sertralina Cloridrato',
        dosage: '50mg',
        posology: 'Tomar 01 (um) comprimido pela manhã, após o café da manhã.',
        quantity: '02 (duas) caixas com 30 comprimidos',
        instructions: 'Uso contínuo. Não interromper abruptamente sem orientação médica.'
      },
      {
        name: 'Trazodona Cloridrato',
        dosage: '50mg',
        posology: 'Tomar 01 (um) comprimido à noite, 30 minutos antes de deitar.',
        quantity: '01 (uma) caixa com 30 comprimidos',
        instructions: 'Para melhora da arquitetura do sono e ansiedade noturna.'
      }
    ],
    content: 'Prescrição emitida em conformidade com a Portaria SVS/MS nº 344/98 e Resolução CFM nº 2.314/2022.'
  },
  {
    id: 'doc-2',
    patientId: 'p-3',
    patientName: 'Mariana Duarte Castello',
    patientCpf: '198.542.778-90',
    type: 'atestado_psicologico',
    title: 'Atestado Psicológico de Afastamento Laboral',
    date: '08/09/2026',
    status: 'emitido',
    professionalName: 'Dra. Beatriz Albuquerque',
    councilNumber: 'CRP 06/148.920',
    daysOfRest: 5,
    cid11: 'QD85 (Síndrome de Burnout / Esgotamento)',
    verificationHash: 'PSI-2026-AT-9912F',
    content: 'Atesto, para os devidos fins a pedido da interessada, que a paciente encontra-se em acompanhamento psicoterapêutico intensivo devido a quadro agudo de esgotamento profissional (Burnout), necessitando de 05 (cinco) dias de afastamento de suas atividades laborais para estabilização psíquica e regulação emocional.'
  },
  {
    id: 'doc-3',
    patientId: 'p-4',
    patientName: 'Gabriel Albuquerque Rocha',
    patientCpf: '451.902.338-04',
    type: 'relatorio_psicologico',
    title: 'Relatório Psicológico • Avaliação de TDAH e Funções Executivas',
    date: '01/09/2026',
    status: 'emitido',
    professionalName: 'Dra. Beatriz Albuquerque',
    councilNumber: 'CRP 06/148.920',
    verificationHash: 'PSI-2026-REL-1044C',
    content: 'Relatório estruturado com base em 6 sessões de testagem e anamnese neuropsicológica, indicando perfil cognitivo compatível com TDAH predomínio desatento (CID-11: 6A05.0) com desregulação da memória de trabalho e flexibilidade cognitiva.'
  }
];

export const INITIAL_SCALE_ASSESSMENTS: ScaleAssessment[] = [
  {
    id: 'scale-1',
    patientId: 'p-1',
    patientName: 'Carolina Mendes Silva',
    scaleType: 'gad7',
    date: '07/09/2026',
    score: 14,
    maxScore: 21,
    severityClassification: 'Ansiedade Moderada a Grave',
    answers: { 0: 2, 1: 3, 2: 2, 3: 2, 4: 1, 5: 2, 6: 2 },
    aiClinicalInterpretation: 'Escore de 14 no GAD-7 reflete sintomas persistentes de nervosismo, preocupação excessiva incontrolável e inquietação motora. Recomenda-se reforçar técnicas de tolerância ao mal-estar e monitoramento de sintomas autonômicos.'
  },
  {
    id: 'scale-2',
    patientId: 'p-3',
    patientName: 'Mariana Duarte Castello',
    scaleType: 'phq9',
    date: '05/09/2026',
    score: 17,
    maxScore: 27,
    severityClassification: 'Depressão Moderadamente Grave',
    answers: { 0: 3, 1: 2, 2: 3, 3: 3, 4: 2, 5: 1, 6: 2, 7: 1, 8: 0 },
    aiClinicalInterpretation: 'Escore 17 no PHQ-9. Destacam-se anedonia expressiva, exaustão psicofísica e prejuízo no padrão de sono. Item 9 negativo para ideação suicida ativa. Conduta focada em descompressão funcional e ativação comportamental gradual.'
  },
  {
    id: 'scale-3',
    patientId: 'p-4',
    patientName: 'Gabriel Albuquerque Rocha',
    scaleType: 'asrs18',
    date: '28/08/2026',
    score: 22,
    maxScore: 36,
    severityClassification: 'Alta Probabilidade de TDAH Adulto',
    answers: { 0: 3, 1: 3, 2: 2, 3: 3, 4: 2, 5: 3 },
    aiClinicalInterpretation: 'Respostas na Parte A do ASRS-18 com 5 de 6 critérios sombreados como frequentes. Forte evidência de desatenção, procrastinação executiva e dificuldade em manter o foco em tarefas não motivadoras.'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p-1',
    name: 'Carolina Mendes Silva',
    cpf: '342.891.028-11',
    birthDate: '14/05/1994',
    age: 32,
    phone: '(11) 98765-4321',
    email: 'carolina.mendes@email.com',
    address: 'Rua Bela Cintra, 1420 - Consolação, São Paulo / SP',
    emergencyContact: {
      name: 'Roberto Mendes (Esposo)',
      relationship: 'Cônjuge',
      phone: '(11) 99811-0022'
    },
    profileType: 'psicologo',
    diagnosisHypothesis: 'Transtorno de Ansiedade Generalizada (TAG) com agorafobia incipiente',
    cid11: '6B00',
    dsm5: '300.02 (F41.1)',
    medications: ['Sertralina 50mg (manhã)', 'Trazodona 50mg (noite)'],
    allergies: ['Dipirona (urticária)'],
    notesCRP: 'Trabalhando regulação emocional e exposição gradual a situações de liderança corporativa.',
    riskAlert: 'baixo',
    status: 'ativo',
    lastSessionDate: 'Hoje às 14:00',
    nextSessionDate: '14/09/2026 às 14:00',
    consentSigned: true,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    evolutions: [
      {
        id: 'evo-1',
        date: '07/09/2026',
        time: '14:50',
        profile: 'psicologo',
        title: 'Sessão 08 • Reestruturação Cognitiva e Exposição',
        professionalName: 'Dra. Beatriz Albuquerque',
        councilId: 'CRP 06/148.920',
        sessionModality: 'telemedicina',
        content: `**1. Queixa Principal:** Dificuldade de manter o sono e picos de ansiedade pré-reuniões executivas.
**2. Estado Mental:** Lúcida, orientada, afeto congruente, humor ansioso com queixas somáticas de aperto torácico.
**3. Intervenções:** Registro de Pensamentos Disfuncionais (RPD), treino de respiração 4-7-8 e desarmamento da crença de incapacidade.
**4. Conduta:** Manter diário de auto-observação. Próxima sessão telemedicina em 7 dias.`
      }
    ]
  },
  {
    id: 'p-2',
    name: 'Lucas Eduardo Prado',
    cpf: '219.043.518-20',
    birthDate: '22/11/1997',
    age: 28,
    phone: '(11) 97123-8899',
    email: 'lucas.prado@email.com',
    address: 'Av. Ibirapuera, 2300 - Moema, São Paulo / SP',
    emergencyContact: {
      name: 'Helena Prado (Mãe)',
      relationship: 'Mãe',
      phone: '(11) 98122-3344'
    },
    profileType: 'psiquiatra',
    diagnosisHypothesis: 'Episódio Depressivo Maior, moderado, sem sintomas psicóticos',
    cid11: '6A70',
    dsm5: '296.22 (F32.1)',
    medications: ['Desvenlafaxina 50mg/dia', 'Zolpidem 5mg à noite (desmame programado)'],
    allergies: ['Nenhuma conhecida'],
    notesCRP: 'Acompanhamento conjunto com psiquiatria. Melhora progressiva do padrão anedônico.',
    riskAlert: 'moderado',
    status: 'retorno',
    lastSessionDate: '01/09/2026',
    nextSessionDate: '08/09/2026 às 16:00',
    consentSigned: true,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    evolutions: [
      {
        id: 'evo-2',
        date: '01/09/2026',
        time: '16:45',
        profile: 'psiquiatra',
        title: 'Consulta Psiquiátrica • Titulação e Manejo de Insônia',
        professionalName: 'Dr. Rodrigo Vasconcelos',
        councilId: 'CRM 152.480-SP',
        sessionModality: 'presencial',
        content: `**1. Avaliação Psicopatológica:** Melhora de 40% na volição e apetite. Nega ideação autolítica ativa.
**2. Farmacologia:** Boa tolerabilidade gástrica à Desvenlafaxina. Titular para 100mg se estagnação após 4 semanas.
**3. Exames:** Solicitado perfil tireoidiano (TSH/T4L) e B12.
**4. Conduta:** Retorno em 30 dias para avaliar resposta plena.`
      }
    ]
  },
  {
    id: 'p-3',
    name: 'Mariana Duarte Castello',
    cpf: '198.542.778-90',
    birthDate: '03/03/1985',
    age: 41,
    phone: '(21) 99881-2244',
    email: 'mariana.castello@email.com',
    address: 'Rua Visconde de Pirajá, 500 - Ipanema, Rio de Janeiro / RJ',
    emergencyContact: {
      name: 'Eduardo Castello (Irmão)',
      relationship: 'Irmão',
      phone: '(21) 98822-1100'
    },
    profileType: 'psicologo',
    diagnosisHypothesis: 'Síndrome de Burnout (Esgotamento Profissional) com labilidade emocional',
    cid11: 'QD85',
    dsm5: 'Transtorno de Adaptação com humor deprimido e ansioso',
    medications: ['Fitoterápico Passiflora encarnata 500mg'],
    allergies: ['Sulfa'],
    notesCRP: 'Acompanhamento intensivo semanal em telemedicina.',
    riskAlert: 'moderado',
    status: 'crise',
    lastSessionDate: '05/09/2026',
    nextSessionDate: 'Hoje às 17:30',
    consentSigned: true,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    evolutions: []
  },
  {
    id: 'p-4',
    name: 'Gabriel Albuquerque Rocha',
    cpf: '451.902.338-04',
    birthDate: '19/08/2007',
    age: 19,
    phone: '(19) 98455-1100',
    email: 'gabriel.rocha@email.com',
    address: 'Av. Barão de Itapura, 1200 - Guanabara, Campinas / SP',
    emergencyContact: {
      name: 'Cláudia Rocha (Mãe)',
      relationship: 'Mãe',
      phone: '(19) 98111-9988'
    },
    profileType: 'psiquiatra',
    diagnosisHypothesis: 'Transtorno do Déficit de Atenção e Hiperatividade (TDAH) - Predomínio Desatento',
    cid11: '6A05.0',
    dsm5: '314.00 (F90.0)',
    medications: ['Lisdexanfetamina 30mg (manhã)'],
    allergies: ['Nenhuma'],
    notesCRP: 'Reavaliação periódica das notas acadêmicas e atenção sustentada.',
    riskAlert: 'estavel',
    status: 'ativo',
    lastSessionDate: '28/08/2026',
    nextSessionDate: '18/09/2026 às 11:00',
    consentSigned: true,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    evolutions: []
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'p-1',
    patientName: 'Carolina Mendes Silva',
    patientPhone: '(11) 98765-4321',
    date: 'Hoje',
    time: '15:00',
    durationMinutes: 50,
    modality: 'telemedicina',
    locationName: 'Sala Virtual Telemedicina HD E2EE',
    status: 'confirmado',
    value: 280
  },
  {
    id: 'apt-2',
    patientId: 'p-3',
    patientName: 'Mariana Duarte Castello',
    patientPhone: '(21) 99881-2244',
    date: 'Hoje',
    time: '17:30',
    durationMinutes: 50,
    modality: 'telemedicina',
    locationName: 'Sala Virtual Telemedicina HD E2EE',
    status: 'pendente',
    value: 300
  },
  {
    id: 'apt-3',
    patientId: 'p-2',
    patientName: 'Lucas Eduardo Prado',
    patientPhone: '(11) 97123-8899',
    date: 'Amanhã',
    time: '16:00',
    durationMinutes: 50,
    modality: 'presencial',
    locationName: 'Consultório Paulista - Sala 112',
    status: 'confirmado',
    value: 350
  },
  {
    id: 'apt-4',
    patientId: 'p-4',
    patientName: 'Gabriel Albuquerque Rocha',
    patientPhone: '(19) 98455-1100',
    date: 'Hoje',
    time: '19:00',
    durationMinutes: 50,
    modality: 'telemedicina',
    locationName: 'Sala Virtual Telemedicina HD E2EE',
    status: 'cancelado',
    value: 320
  },
  {
    id: 'apt-5',
    patientId: 'p-2',
    patientName: 'Lucas Eduardo Prado',
    patientPhone: '(11) 97123-8899',
    date: 'Hoje',
    time: '11:00',
    durationMinutes: 50,
    modality: 'presencial',
    locationName: 'Consultório Moema - Sala 03',
    status: 'confirmado',
    value: 350
  }
];

export const INITIAL_FINANCIAL: FinancialRecord[] = [
  {
    id: 'fin-1',
    patientName: 'Carolina Mendes Silva',
    patientCpf: '342.891.028-11',
    date: '07/09/2026',
    amount: 280.00,
    status: 'pago',
    method: 'pix',
    receiptNumber: 'REC-2026-0901',
    description: 'Sessão de Psicoterapia Individual • Telemedicina Psicool',
    deductibleIRPF: true
  },
  {
    id: 'fin-2',
    patientName: 'Lucas Eduardo Prado',
    patientCpf: '219.043.518-20',
    date: '01/09/2026',
    amount: 350.00,
    status: 'pago',
    method: 'cartao',
    receiptNumber: 'REC-2026-0902',
    description: 'Consulta Médica Psiquiátrica • Retorno Clínico',
    deductibleIRPF: true
  },
  {
    id: 'fin-3',
    patientName: 'Mariana Duarte Castello',
    patientCpf: '198.542.778-90',
    date: '07/09/2026',
    amount: 300.00,
    status: 'pendente',
    method: 'pix',
    receiptNumber: 'REC-2026-0903',
    description: 'Sessão de Psicoterapia • Manejo de Crise Burnout',
    deductibleIRPF: true
  },
  {
    id: 'fin-4',
    patientName: 'Gabriel Albuquerque Rocha',
    patientCpf: '451.902.338-04',
    date: '28/08/2026',
    amount: 320.00,
    status: 'pago',
    method: 'pix',
    receiptNumber: 'REC-2026-0889',
    description: 'Avaliação Neuropsiquiátrica de TDAH',
    deductibleIRPF: true
  }
];
