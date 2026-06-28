import React, { useState } from 'react';
import { Button, Card, Badge, LoadingSpinner } from './UIComponents';
import Logo from './Logo';

interface AffiliateProductData {
  checkoutUrl: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
}

interface AffiliateData {
  slug: string;
  affiliateName: string;
  monthly: AffiliateProductData;
  annual: AffiliateProductData;
  simulado: AffiliateProductData;
}

interface PricingPageProps {
  onBack: () => void;
  onSubscribe: () => void;
  isModal?: boolean;
  affiliateData?: AffiliateData | null;
}

function calcAffiliatePrice(base: number, data: AffiliateProductData): number {
  if (!data || !data.discountValue) return base;
  if (data.discountType === 'percent') return Math.max(0, base * (1 - data.discountValue / 100));
  return Math.max(0, base - data.discountValue);
}

const BASE_MONTHLY = 68.00;
const BASE_ANNUAL = 39.00;
const BASE_SIMULADO = 11.80;

const PricingPage: React.FC<PricingPageProps> = ({ onBack, onSubscribe, isModal = false, affiliateData = null }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  const isUpgradeOnly = typeof window !== 'undefined' ? localStorage.getItem('pricing_upgrade_only') === 'true' : false;

  const monthlyPrice = affiliateData ? calcAffiliatePrice(BASE_MONTHLY, affiliateData.monthly) : BASE_MONTHLY;
  const annualPriceMonthlyEquivalent = affiliateData ? calcAffiliatePrice(BASE_ANNUAL, affiliateData.annual) : BASE_ANNUAL;
  const simuladoPrice = affiliateData ? calcAffiliatePrice(BASE_SIMULADO, affiliateData.simulado) : BASE_SIMULADO;

  const currentPrice = billingCycle === 'monthly' ? monthlyPrice : annualPriceMonthlyEquivalent;
  const dailyCost = (currentPrice / 30).toFixed(2);

  const annualTotal = annualPriceMonthlyEquivalent * 12;
  const annualSavings = (monthlyPrice * 12) - annualTotal;
  const annualDiscountPct = Math.round((annualSavings / (monthlyPrice * 12)) * 100);

  const handleCheckout = (plan?: 'annual' | 'monthly' | 'mock') => {
    const KIWIFY_ANNUAL_URL = affiliateData?.annual.checkoutUrl || "https://pay.kiwify.com.br/XRDY3Pq"; // Plano Anual
    const KIWIFY_MONTHLY_URL = affiliateData?.monthly.checkoutUrl || "https://pay.kiwify.com.br/RgS7hZy"; // Plano Mensal
    const KIWIFY_MOCK_URL = affiliateData?.simulado.checkoutUrl || "https://pay.kiwify.com.br/FPVMgXp"; // Plano Simulado

    let checkoutUrl = '';
    if (plan === 'mock') {
      checkoutUrl = KIWIFY_MOCK_URL;
    } else {
      checkoutUrl = (plan || billingCycle) === 'annual' ? KIWIFY_ANNUAL_URL : KIWIFY_MONTHLY_URL;
    }

    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    setLoading(false);
  };

  const handleBack = () => {
    localStorage.removeItem('pricing_upgrade_only');
    onBack();
  };

  return (
    <div className={`${isModal ? '' : 'min-h-screen'} bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans transition-colors duration-300`}>
      {/* Header */}
      {!isModal && (
        <header className="fixed w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-50 border-b border-gray-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleBack}>
              <Logo className="h-8" />
            </div>
            <div className="flex gap-4 items-center">
              <button onClick={handleBack} className="text-gray-500 dark:text-slate-400 font-medium hover:text-enem-blue transition-colors">
                Voltar
              </button>
              <Button
                onClick={(e: any) => {
                  e.stopPropagation();
                  onSubscribe();
                }}
                variant="primary"
                className="px-6 py-2"
              >
                Entrar
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Hero */}
      <section className={`${isModal ? 'pt-4 pb-4' : 'pt-32 pb-8'} px-6 text-center`}>
        {!isModal && (
          <>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
              Sua Aprovação Exige <span className="text-transparent bg-clip-text bg-gradient-to-r from-enem-blue to-blue-500">Estratégia</span>.
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
              Chega de perder tempo com o método antigo. Tenha a IA ao seu lado na reta final para o ENEM por menos de R$ {dailyCost.replace('.', ',')} por dia.
            </p>
          </>
        )}

        {/* Affiliate discount banner */}
        {affiliateData && (
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-full px-4 py-2 text-sm font-bold mb-6">
            🎉 Preço especial via parceiro <span className="font-black">{affiliateData.affiliateName}</span>
          </div>
        )}

        {/* Toggle */}
        <div className={`flex items-center justify-center gap-4 ${isModal ? 'mb-6' : 'mb-12'}`}>
          <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Mensal</span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-16 h-8 bg-gray-200 dark:bg-slate-800 rounded-full p-1 relative transition-colors duration-300 focus:outline-none"
          >
            <div className={`w-6 h-6 bg-enem-blue rounded-full absolute top-1 left-1 transition-transform duration-300 ${billingCycle === 'annual' ? 'translate-x-8' : ''}`}></div>
          </button>
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${billingCycle === 'annual' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Anual</span>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Economize {annualDiscountPct}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-6">
        <div className={`max-w-7xl mx-auto grid ${isModal ? 'grid-cols-1 max-w-lg' : (isUpgradeOnly ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3')} gap-8 items-stretch`}>

          {/* Premium Plan (Aprovado) - Middle on Desktop, Top on Mobile */}
          <div className={`order-1 md:order-2 bg-white dark:bg-slate-900 ${isModal ? 'p-6' : 'p-8'} rounded-2xl border-2 border-enem-blue dark:border-blue-500 shadow-2xl relative flex flex-col justify-between group`}>
            {billingCycle === 'annual' && (
              <div className="absolute top-0 right-0 bg-yellow-400 text-enem-dark text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-tighter shadow-sm">
                Mais Vantajoso
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-enem-blue dark:text-blue-400 uppercase tracking-widest mb-2 text-sm">
                {billingCycle === 'monthly' ? '💡 Plano Mensal — Liberdade para começar' : '🔥 Plano Anual — Compromisso com seu crescimento'}
              </h3>
              <div className={`flex items-baseline gap-1 ${isModal ? 'mb-1' : 'mb-2'}`}>
                {affiliateData && currentPrice < (billingCycle === 'monthly' ? BASE_MONTHLY : BASE_ANNUAL) && (
                  <span className="text-sm line-through text-gray-400 mr-1">R$ {(billingCycle === 'monthly' ? BASE_MONTHLY : BASE_ANNUAL).toFixed(2).replace('.', ',')}</span>
                )}
                <span className="text-sm text-gray-500 dark:text-slate-500 font-medium mr-1">R$</span>
                <span className={`${isModal ? 'text-4xl' : 'text-5xl'} font-extrabold text-gray-900 dark:text-white`}>{currentPrice.toFixed(2).replace('.', ',')}</span>
                <span className="text-gray-400 dark:text-slate-500">/mês</span>
              </div>

              {billingCycle === 'annual' ? (
                <div className="text-xs text-green-600 dark:text-green-400 font-bold mb-6">
                  Cobrado anualmente (R$ {annualTotal.toFixed(0)}) • Economia de R$ {annualSavings.toFixed(0)}/ano
                </div>
              ) : (
                <div className="text-xs text-gray-400 dark:text-slate-500 mb-6">
                  Plano mensal flexível
                </div>
              )}

              <p className={`text-gray-500 dark:text-slate-400 text-sm ${isModal ? 'mb-4' : 'mb-8'} min-h-[40px]`}>
                {billingCycle === 'monthly'
                  ? 'Perfeito para quem quer dar o primeiro passo.'
                  : 'Aqui é onde a mágica acontece.'}
              </p>

              <Button
                onClick={() => handleCheckout()}
                loading={loading}
                variant="primary"
                className={`w-full ${isModal ? 'py-3 text-base' : 'py-4 text-lg'} bg-gradient-to-r from-enem-blue to-blue-600 hover:shadow-lg hover:scale-[1.02] transition-all font-black shadow-xl flex items-center justify-center gap-2`}
              >
                QUERO SER APROVADO
              </Button>
              <p className={`text-center text-xs text-enem-blue dark:text-blue-400 font-bold ${isModal ? 'mt-2 mb-4' : 'mt-3 mb-8'}`}>
                {billingCycle === 'monthly' ? '👉 Para quem está organizando sua rotina.' : '👉 Ideal para quem decidiu passar.'}
              </p>

              <ul className={`${isModal ? 'grid grid-cols-1 gap-y-2' : 'space-y-4'} text-[11px] font-medium text-gray-700 dark:text-slate-300`}>
                {billingCycle === 'monthly' ? (
                  <>
                    <li className="flex gap-3">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                      Acesso completo à plataforma
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                      Sem compromisso de longo prazo
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                      Cancele quando quiser
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex gap-3">
                      <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                      Tudo do plano mensal
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                      Economia significativa no valor total
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                      Menor custo por mês
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                      Foco e disciplina ao longo do ano
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                      Acesso contínuo, sem interrupções
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Simulado Plan */}
          {!isModal && (
            <div className="order-2 md:order-1 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-enem-yellow dark:border-yellow-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-enem-yellow dark:text-yellow-500 uppercase tracking-widest mb-2 text-sm">Plano Simulado</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  {affiliateData && simuladoPrice < BASE_SIMULADO && (
                    <span className="text-sm line-through text-gray-400 mr-1">R$ {BASE_SIMULADO.toFixed(2).replace('.', ',')}</span>
                  )}
                  <span className="text-sm text-gray-500 dark:text-slate-500 font-medium mr-1">R$</span>
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{simuladoPrice.toFixed(2).replace('.', ',')}</span>
                  <span className="text-gray-400 dark:text-slate-500">/mês</span>
                </div>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 min-h-[40px]">
                  Foco total em performance. Faça 1 simulado oficial por mês com correção TRI.
                </p>

                <Button onClick={() => handleCheckout('mock')} variant="primary" className="w-full py-3 mb-8 bg-enem-yellow hover:bg-yellow-500 text-slate-900 font-bold">
                  Assinar Simulado
                </Button>

                <ul className="space-y-4 text-sm text-gray-600 dark:text-slate-400">
                  <li className="flex gap-3">
                    <span className="text-enem-yellow dark:text-yellow-500 font-bold">✓</span>
                    1 Simulado Completo (180q)/mês
                  </li>
                  <li className="flex gap-3">
                    <span className="text-enem-yellow dark:text-yellow-500 font-bold">✓</span>
                    Cálculo Oficial TRI
                  </li>
                  <li className="flex gap-3 text-gray-400 dark:text-slate-600 line-through">
                    <span className="text-gray-300 dark:text-slate-700">✖</span>
                    Gerador de Questões IA
                  </li>
                  <li className="flex gap-3 text-gray-400 dark:text-slate-600 line-through">
                    <span className="text-gray-300 dark:text-slate-700">✖</span>
                    Correção de Redação IA
                  </li>
                  <li className="flex gap-3 text-gray-400 dark:text-slate-600 line-through">
                    <span className="text-gray-300 dark:text-slate-700">✖</span>
                    Tutor IA 24h
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Free Plan */}
          {!isUpgradeOnly && !isModal && (
            <div className="order-3 md:order-3 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-500 dark:text-slate-500 uppercase tracking-widest mb-2 text-sm">Plano Básico</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">7 Dias</span>
                  <span className="text-gray-400 dark:text-slate-500">/trial</span>
                </div>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 min-h-[40px]">
                  Ideal para conhecer a plataforma e fazer revisões pontuais.
                </p>

                <Button
                  type="button"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    const hostname = window.location.hostname;
                    if (hostname === 'www.studr.com.br' || hostname === 'studr.com.br') {
                      window.open('https://app.studr.com.br?mode=register', '_blank', 'noopener,noreferrer');
                    } else {
                      onSubscribe();
                    }
                  }}
                  variant="outline"
                  className="w-full py-3 mb-8 border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white font-bold"
                >
                  Começar Trial
                </Button>

                <ul className="space-y-4 text-sm text-gray-600 dark:text-slate-400">
                  <li className="flex gap-3">
                    <span className="text-enem-blue dark:text-blue-400 font-bold">✓</span>
                    Gerador de Questões (Limitado a 10/dia)
                  </li>
                  <li className="flex gap-3">
                    <span className="text-enem-blue dark:text-blue-400 font-bold">✓</span>
                    Simulado Rápido (1 por semana)
                  </li>
                  <li className="flex gap-3">
                    <span className="text-enem-blue dark:text-blue-400 font-bold">✓</span>
                    Acesso aos Mapas de Estudo (Online)
                  </li>
                  <li className="flex gap-3 text-gray-400 dark:text-slate-600 line-through">
                    <span className="text-gray-300 dark:text-slate-700">✖</span>
                    Correção de Redação IA
                  </li>
                  <li className="flex gap-3 text-gray-400 dark:text-slate-600 line-through">
                    <span className="text-gray-300 dark:text-slate-700">✖</span>
                    Tutor IA 24h
                  </li>
                </ul>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Guarantee - Hide in Modal for brevity */}
      {!isModal && (
        <section className="py-16 bg-blue-50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/20">
          <div className="max-w-3xl mx-auto text-center px-6">
            <div className="text-4xl mb-4">🛡️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Garantia de 7 Dias</h2>
            <p className="text-gray-600 dark:text-slate-400">
              Teste o Studr Ilimitado por 7 dias. Se você não sentir que está aprendendo mais rápido, nós devolvemos 100% do seu dinheiro. Sem perguntas.
            </p>
          </div>
        </section>
      )}

      {/* FAQ - Hide in Modal for brevity */}
      {!isModal && (
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Perguntas Frequentes</h2>
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm">
                <h4 className="font-bold text-gray-800 dark:text-slate-200 mb-2">Posso cancelar quando quiser?</h4>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Sim. Não existe fidelidade. Você pode cancelar sua assinatura a qualquer momento nas configurações do seu perfil e o acesso continua até o fim do ciclo pago.</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm">
                <h4 className="font-bold text-gray-800 dark:text-slate-200 mb-2">Quais formas de pagamento aceitas?</h4>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Aceitamos Cartão de Crédito (todas as bandeiras) e Pix com liberação imediata do acesso Pro.</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm">
                <h4 className="font-bold text-gray-800 dark:text-slate-200 mb-2">O trial expira?</h4>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Sim. Você tem 7 dias para testar a plataforma completa. Após esse período, é necessário assinar um dos nossos planos para continuar os estudos.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      {!isModal && (
        <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-12 text-center transition-colors">
          <p className="text-sm text-gray-500 dark:text-slate-500">© {new Date().getFullYear()} Studr. Todos os direitos reservados.</p>
          <p className="text-xs text-gray-400 dark:text-slate-600 mt-2">Dúvidas? Entre em contato com <strong>suporte@studr.com.br</strong></p>
        </footer>
      )}
    </div>
  );
};

export default PricingPage;
