import React, { useState } from 'react';
import { 
  Check, 
  Crown, 
  Sparkles, 
  Video, 
  FileText, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  ExternalLink, 
  X, 
  Lock,
  QrCode,
  CheckCircle2
} from 'lucide-react';

interface PlansAndPricingProps {
  onPlanSelected?: (plan: 'mensal' | 'anual') => void;
}

export const PlansAndPricing: React.FC<PlansAndPricingProps> = ({ onPlanSelected }) => {
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<'mensal' | 'anual' | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'modal' | 'success'>('modal');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');

  const plans = [
    {
      id: 'mensal' as const,
      name: 'Plano Mensal PSICOOL Premium',
      tagline: 'Ideal para profissionais que desejam flexibilidade total',
      price: 'R$ 49,00',
      period: '/ mês',
      annualEquivalent: 'Cobrado mensalmente',
      badge: null,
      mercadoPagoLink: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=psicool-mensal-49',
      features: [
        'Acesso ilimitado à Alegra AI (sem trava de 30 msgs)',
        'Telemedicina por Vídeo sem limite de tempo (HD 1080p)',
        'Emissão de Documentos e Laudos ilimitados',
        'Modo Split-Screen de Anotações Simultâneas',
        'Prontuário Eletrônico conforme normas CFP e CFM',
        'Segurança e Criptografia ponta-a-ponta (LGPD)',
        'Cancelamento simples a qualquer momento',
      ],
      ctaText: 'Assinar Plano Mensal',
      highlighted: false,
    },
    {
      id: 'anual' as const,
      name: 'Plano Anual PSICOOL Premium',
      tagline: 'Melhor Custo-Benefício para o seu consultório',
      price: 'R$ 679,00',
      period: '/ ano',
      annualEquivalent: 'Equivale a R$ 56,58 / mês • Economia de 2 meses',
      badge: 'Melhor Custo-Benefício',
      mercadoPagoLink: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=psicool-anual-679',
      features: [
        'Tudo incluso no plano mensal com economia anual',
        'Acesso ilimitado à Alegra AI (sem trava de 30 msgs)',
        'Telemedicina por Vídeo sem limite de tempo (HD 1080p)',
        'Emissão de Documentos e Laudos ilimitados',
        'Modo Split-Screen de Anotações Simultâneas',
        'Assinatura Digital de Atestados e Laudos (ICP-Brasil)',
        'Backup Diário Automatizado na Nuvem',
        'Suporte Prioritário VIP via WhatsApp dedicado',
      ],
      ctaText: 'Garantir Plano Anual com Desconto',
      highlighted: true,
    },
  ];

  const handleOpenCheckout = (planId: 'mensal' | 'anual') => {
    setSelectedPlanForCheckout(planId);
    setCheckoutStep('modal');
    if (onPlanSelected) {
      onPlanSelected(planId);
    }
  };

  const handleSimulatePayment = () => {
    setCheckoutStep('success');
    setTimeout(() => {
      setSelectedPlanForCheckout(null);
    }, 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#120b24] border border-[#bf5af2]/50 text-xs font-bold text-purple-200 mb-4 shadow-[0_0_15px_rgba(191,90,242,0.25)]">
          <Crown className="w-4 h-4 text-[#ff007f]" />
          <span>Checkout Pro Mercado Pago • Acesso Imediato</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Eleve seu Consultório com{' '}
          <span className="bg-gradient-to-r from-[#bf5af2] to-[#ff007f] bg-clip-text text-transparent">
            Alegra AI & Telemedicina
          </span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-purple-300/70">
          Sem burocracia, com Prontuário Padrão CFP/CRM e Telemedicina de alta resolução nativa.
          Escolha o plano ideal para a sua prática clínica.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            id={`pricing-card-${plan.id}`}
            className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
              plan.highlighted
                ? 'bg-gradient-to-b from-[#180e2e] via-[#120b24] to-[#1a0a2a] border-2 border-[#ff007f] shadow-[0_0_35px_rgba(255,0,127,0.25)] scale-[1.02]'
                : 'bg-[#120b24] border border-[#2a1b4e] hover:border-[#bf5af2]/60 shadow-xl'
            }`}
          >
            {/* Best Value Badge */}
            {plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white text-xs font-extrabold uppercase tracking-wider shadow-[0_0_15px_rgba(255,0,127,0.5)]">
                {plan.badge}
              </div>
            )}

            <div>
              {/* Plan Title & Tagline */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-purple-300/70">{plan.tagline}</p>
              </div>

              {/* Exact Price */}
              <div className="flex items-baseline gap-1 my-6">
                <span className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm font-semibold text-purple-300">{plan.period}</span>
              </div>

              <div className="text-xs font-medium text-emerald-400 mb-6 bg-emerald-950/40 border border-emerald-800/40 rounded-xl px-3 py-1.5 w-fit">
                {plan.annualEquivalent}
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-6 border-t border-[#2a1b4e] mb-8">
                <div className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                  Recursos inclusos:
                </div>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <div className="p-0.5 rounded-full bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white mt-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button (Simulates Mercado Pago Checkout Pro Redirection) */}
            <div>
              <button
                id={`checkout-btn-${plan.id}`}
                onClick={() => handleOpenCheckout(plan.id)}
                className={`w-full py-3.5 sm:py-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white shadow-[0_0_25px_rgba(255,0,127,0.45)] hover:brightness-110'
                    : 'bg-[#1e123a] hover:bg-[#28174e] text-white border border-[#bf5af2]/50 hover:border-[#bf5af2]'
                }`}
              >
                <span>{plan.ctaText}</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-purple-400/60">
                <Lock className="w-3 h-3" />
                <span>Checkout Pro Mercado Pago Seguro • 7 dias de garantia</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Comparison with Sintropia Banner */}
      <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#120b24] via-[#1a0f35] to-[#120b24] border border-[#bf5af2]/40 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-[#ff007f] uppercase tracking-wider">
              Por que o Psicool supera a Sintropia?
            </span>
            <h4 className="text-lg sm:text-xl font-bold text-white">
              Telemedicina Integrada Nativamente ao Prontuário em Split-Screen
            </h4>
            <p className="text-xs sm:text-sm text-purple-300/70 max-w-xl">
              Enquanto outras plataformas exigem que você use o Google Meet ou Zoom separadamente e copie anotações depois, o Psicool coloca o streaming de vídeo HD e o co-piloto Alegra AI lado a lado na mesma tela.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="p-3 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] text-center">
              <div className="text-xs text-purple-400/70">Sintropia</div>
              <div className="text-sm font-bold text-slate-400">Vídeo Externo</div>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-r from-[#bf5af2]/20 to-[#ff007f]/20 border border-[#bf5af2] text-center shadow-[0_0_15px_rgba(191,90,242,0.3)]">
              <div className="text-xs text-[#ff007f] font-bold">Psicool</div>
              <div className="text-sm font-extrabold text-white">Vídeo + IA Nativo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mercado Pago Checkout Pro Simulation Modal */}
      {selectedPlanForCheckout && (
        <div 
          id="mercadopago-modal-overlay"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-3xl bg-[#120b24] border border-[#bf5af2] p-6 shadow-[0_0_50px_rgba(191,90,242,0.3)] relative animate-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setSelectedPlanForCheckout(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#1c1236] text-purple-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {checkoutStep === 'modal' ? (
              <div>
                {/* Header with Mercado Pago styling */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2a1b4e]">
                  <div className="w-8 h-8 rounded-xl bg-[#009ee3] flex items-center justify-center font-bold text-white text-xs">
                    MP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Mercado Pago Checkout Pro</div>
                    <div className="text-[10px] text-purple-300/70">Ambiente seguro com criptografia SSL</div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <span className="text-xs text-purple-300">Você está assinando:</span>
                  <h4 className="text-lg font-extrabold text-white mt-0.5">
                    {selectedPlanForCheckout === 'mensal' ? 'Plano Mensal Psicool Premium' : 'Plano Anual Psicool Premium'}
                  </h4>
                  <div className="text-2xl font-black text-[#ff007f] mt-1">
                    {selectedPlanForCheckout === 'mensal' ? 'R$ 49,00 / mês' : 'R$ 679,00 / ano'}
                  </div>
                </div>

                {/* Payment Options (PIX vs Cartão) */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'pix'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-[#180e2e] border-[#2a1b4e] text-slate-300'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>PIX Imediato</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('cartao')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'cartao'
                        ? 'bg-[#ff007f]/20 border-[#ff007f] text-pink-300 shadow-[0_0_10px_rgba(255,0,127,0.3)]'
                        : 'bg-[#180e2e] border-[#2a1b4e] text-slate-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cartão de Crédito</span>
                  </button>
                </div>

                {paymentMethod === 'pix' ? (
                  <div className="p-4 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] text-center space-y-2 mb-4">
                    <div className="text-xs font-semibold text-purple-300">
                      Chave PIX Copia e Cola gerada pelo Mercado Pago:
                    </div>
                    <div className="font-mono text-[11px] bg-[#180e2e] p-2 rounded-lg text-emerald-400 break-all select-all">
                      00020126580014br.gov.bcb.pix0136psicool-checkout-pro-{selectedPlanForCheckout}-mp520400005303986
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Aprovação instantânea • Liberação imediata da Alegra AI
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#0b0616] border border-[#2a1b4e] space-y-2 mb-4 text-xs">
                    <div className="text-purple-300 font-semibold">
                      Parcelamento no Cartão de Crédito:
                    </div>
                    <div className="text-slate-300">
                      {selectedPlanForCheckout === 'anual' 
                        ? 'Em até 12x de R$ 68,20 no cartão de crédito' 
                        : 'R$ 49,00 à vista / renovação mensal automática'}
                    </div>
                  </div>
                )}

                <button
                  id="confirm-checkout-btn"
                  onClick={handleSimulatePayment}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#bf5af2] to-[#ff007f] text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(255,0,127,0.5)] hover:brightness-110 active:scale-95 transition-all"
                >
                  Concluir Pagamento no Mercado Pago
                </button>

                <p className="text-[10px] text-center text-purple-400/50 mt-3">
                  Transação protegida pela Garantia de Compra do Mercado Pago.
                </p>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">
                  Assinatura Psicool Pro Confirmada!
                </h4>
                <p className="text-xs text-purple-200 max-w-xs mx-auto">
                  Seu consultório agora conta com Alegra AI ilimitada, telemedicina HD e emissão de laudos sem restrições.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
