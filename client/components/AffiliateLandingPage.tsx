
import React from 'react';
import { Button, Card } from './UIComponents';
import Logo from './Logo';

interface AffiliateLandingPageProps {
  onBack: () => void;
  onApply: () => void;
  onLogin: () => void;
}

const AffiliateLandingPage: React.FC<AffiliateLandingPageProps> = ({ onBack, onApply, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="fixed w-full bg-slate-900/90 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <div className="flex items-center gap-2">
              <Logo className="h-7" variant="white" showText={false} />
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Studr<span className="text-purple-400">.Partners</span>
              </span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={onBack} className="text-gray-400 hover:text-white text-sm font-medium transition-colors hidden md:block">
              Voltar para o App
            </button>
            <Button
              onClick={onLogin}
              variant="primary"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white border-none shadow-[0_0_15px_rgba(147,51,234,0.5)]"
            >
              Login Afiliado
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] opacity-20 -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20 -z-10"></div>

        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-purple-300 rounded-full text-sm font-bold mb-4">
            🚀 Programa de Parceria Oficial
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Transforme sua Audiência em <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Renda Recorrente.
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            O produto educacional mais viral do momento. Indique uma tecnologia que os alunos <strong>já querem usar</strong> e ganhe comissões vitalícias enquanto eles estudam.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4 pt-6">
            <Button
              onClick={onApply}
              className="text-lg px-10 py-5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-extrabold rounded-xl transform transition-transform hover:scale-105 shadow-xl"
            >
              QUERO SER PARCEIRO
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-2">20%</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Comissão Recorrente</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-400 mb-2">R$ 1.2k</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Ganho Médio (Iniciante)</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">30 Dias</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Duração do Cookie</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-yellow-400 mb-2">Diário</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Saque Disponível</div>
          </div>
        </div>
      </section>

      {/* Why Promote? */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Por que promover o Studr?</h2>
            <p className="text-gray-400 text-lg">Não vendemos cursos chatos. Vendemos a aprovação via tecnologia.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800 border-slate-700 p-8 hover:bg-slate-750 transition-colors">
              <div className="text-4xl mb-6">🔥</div>
              <h3 className="text-xl font-bold text-white mb-3">Alta Conversão</h3>
              <p className="text-gray-400 leading-relaxed">
                A promessa de "Correção de Redação Instantânea" e "Simulador SiSU" gera curiosidade imediata. O cadastro gratuito converte 3x mais que cursos tradicionais.
              </p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-8 hover:bg-slate-750 transition-colors">
              <div className="text-4xl mb-6">💎</div>
              <h3 className="text-xl font-bold text-white mb-3">LTV Estendido</h3>
              <p className="text-gray-400 leading-relaxed">
                Diferente de cursos que vendem uma vez, o aluno assina o plano mensal/anual. Você recebe comissão TODOS os meses em que a assinatura estiver ativa.
              </p>
            </Card>
            <Card className="bg-slate-800 border-slate-700 p-8 hover:bg-slate-750 transition-colors">
              <div className="text-4xl mb-6">🎨</div>
              <h3 className="text-xl font-bold text-white mb-3">Material Pronto</h3>
              <p className="text-gray-400 leading-relaxed">
                Entregamos criativos validados: vídeos para Reels/TikTok, banners para Stories e copys de e-mail que convertem. É só copiar e colar.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-purple-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Como Funciona</h2>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-slate-700 via-purple-500 to-slate-700 -translate-y-1/2 z-0"></div>

            <div className="grid md:grid-cols-3 gap-12 relative z-10">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-slate-900 border-2 border-purple-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-6 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  1
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Cadastro Grátis</h3>
                <p className="text-gray-400 text-sm">Inscreva-se na nossa plataforma de parceiros em menos de 2 minutos.</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-slate-900 border-2 border-purple-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-6 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  2
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Pegue seu Link</h3>
                <p className="text-gray-400 text-sm">Receba um link de rastreamento exclusivo e materiais de divulgação prontos.</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-slate-900 border-2 border-purple-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-6 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  3
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Receba Pix</h3>
                <p className="text-gray-400 text-sm">Acompanhe suas vendas em tempo real e saque seus lucros direto via Pix.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ for Affiliates */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Dúvidas Comuns</h2>

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h4 className="font-bold text-white mb-2">Preciso ter muitos seguidores?</h4>
              <p className="text-gray-400 text-sm">Não. Temos afiliados que vendem muito através de tráfego pago (Google/Facebook Ads) ou grupos de estudo no WhatsApp/Telegram.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h4 className="font-bold text-white mb-2">Como é feito o rastreamento?</h4>
              <p className="text-gray-400 text-sm">Usamos cookies de 30 dias com tecnologia de "Last Click". Se a pessoa clicar no seu link e comprar em até um mês, a comissão é sua.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h4 className="font-bold text-white mb-2">Vocês fornecem criativos?</h4>
              <p className="text-gray-400 text-sm">Sim! Temos um Drive atualizado semanalmente com vídeos, banners e copys validadas para você usar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-6 bg-gradient-to-t from-purple-900 to-slate-900 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-extrabold text-white mb-6">Pronto para faturar com IA?</h2>
          <Button
            onClick={onApply}
            className="text-xl px-12 py-6 bg-green-500 hover:bg-green-400 text-white font-extrabold rounded-full shadow-[0_0_30px_rgba(34,197,94,0.4)] transform transition-transform hover:scale-105"
          >
            QUERO MEU LINK DE AFILIADO
          </Button>
          <p className="mt-4 text-gray-500 text-sm">Vagas limitadas para o lote atual de parceiros.</p>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-slate-950 py-8 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Studr Partners. Todos os direitos reservados.</p>
        <button onClick={onBack} className="mt-2 hover:text-white transition-colors underline">Voltar para área do estudante</button>
      </footer>

    </div>
  );
};

export default AffiliateLandingPage;
