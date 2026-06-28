import React, { useState, useEffect } from 'react';
import { Button } from './UIComponents';
import Logo from './Logo';
import { ChevronLeft, ChevronRight, Sparkles, Target, Trophy, PenTool, Zap, MessageSquare, LineChart, Star, Mail, Instagram } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onRegister: () => void;
  onLogin: () => void;
  onAffiliate?: () => void;
  onPricing?: () => void;
  onTerms?: () => void;
  onPrivacy?: () => void;
}

const LandingPageV3: React.FC<LandingPageProps> = ({ onStart, onRegister, onLogin, onAffiliate, onPricing, onTerms, onPrivacy }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Missões Diárias",
      description: "Suba de nível estudando com missões que te mantêm focado todos os dias e recompensam sua constância.",
      image: "/WhatsApp Image 2026-03-27 at 14.31.25.jpeg",
      icon: <Target className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Mapa de Progresso",
      description: "Acompanhe sua proficiência em cada disciplina em tempo real e saiba exatamente o que reforçar para o ENEM.",
      image: "/WhatsApp Image 2026-03-27 at 14.32.02.jpeg",
      icon: <LineChart className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "Ranking Global",
      description: "Motive-se competindo com os melhores estudantes do Brasil em um ambiente gamificado e saudável.",
      image: "/WhatsApp Image 2026-03-27 at 14.32.31.jpeg",
      icon: <Trophy className="w-6 h-6" />,
      color: "from-amber-500 to-orange-600"
    },
    {
      title: "Redação IA",
      description: "Treine com temas inéditos, textos motivadores e cronômetro real para dominar o tempo oficial da prova.",
      image: "/WhatsApp Image 2026-03-27 at 14.36.02.jpeg",
      icon: <PenTool className="w-6 h-6" />,
      color: "from-pink-500 to-rose-600"
    },
    {
      title: "Nota Instantânea",
      description: "Receba sua pontuação TRI e feedback detalhado por competência segundos após terminar sua redação.",
      image: "/WhatsApp Image 2026-03-27 at 14.37.01.jpeg",
      icon: <Zap className="w-6 h-6" />,
      color: "from-purple-500 to-violet-600"
    },
    {
      title: "Mentor Particular IA",
      description: "Entenda cada erro com um feedback humanoide detalhado que aponta exatamente como elevar seu patamar.",
      image: "/WhatsApp Image 2026-03-27 at 14.37.26.jpeg",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "from-cyan-500 to-blue-600"
    },
    {
      title: "Análise Técnica",
      description: "Domine as competências do ENEM com correções profundas que ensinam a estruturar o texto perfeito.",
      image: "/WhatsApp Image 2026-03-27 at 14.37.58.jpeg",
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-indigo-500 to-purple-600"
    },
    {
      title: "Rumo à Nota 1000",
      description: "Acesse um banco de redações de excelência e aprimore sua proposta de intervenção com ajuda da IA.",
      image: "/WhatsApp Image 2026-03-27 at 14.38.27.jpeg",
      icon: <Star className="w-6 h-6" />,
      color: "from-yellow-500 to-orange-500"
    }
  ];



  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);


  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const testimonials = [
    {
      name: "Lucas Ferreira",
      role: "Medicina (USP)",
      text: "Eu gastava horas procurando questões. Aqui, a IA descobre o que eu não sei e gera questões EXATAS sobre minha dificuldade.",
      avatar: "👨‍⚕️"
    },
    {
      name: "Fernanda Costa",
      role: "Direito (UFRJ)",
      text: "O simulador SiSU foi um choque de realidade. Ele me mostrou que eu precisava focar em Humanas para passar. Deu certo!",
      avatar: "⚖️"
    },
    {
      name: "João Pedro",
      role: "Engenharia (UFMG)",
      text: "Gamificação genial. Eu sou viciado em subir de nível e quando vejo, já estudei 3 horas seguidas. Melhor que cursinho.",
      avatar: "💻"
    }
  ];

  const handleStartRedirect = (mode: 'login' | 'register' = 'login', openBlank: boolean = false) => {
    const hostname = window.location.hostname;
    const isRootDomain = hostname === 'www.studr.com.br' || hostname === 'studr.com.br';

    if (isRootDomain || openBlank) {
      const targetUrl = `https://app.studr.com.br?mode=${mode}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      mode === 'register' ? onRegister() : onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans selection:bg-blue-200 selection:text-blue-900">
      {/* Header */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="https://studr.com.br" className="flex items-center gap-2 cursor-pointer">
            <Logo className="h-8" />
          </a>
          <div className="flex gap-6 items-center">
            <button onClick={onPricing} className="text-gray-600 font-medium hover:text-enem-blue hidden md:block transition-colors">
              Planos
            </button>
            <button onClick={onAffiliate} className="text-purple-600 font-bold hover:text-purple-800 hidden md:block transition-colors flex items-center gap-1">
              <span>💸</span> Afiliados
            </button>
            <Button onClick={() => handleStartRedirect('login', true)} variant="primary" className="px-6 py-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-white bg-enem-blue">
              Acessar
            </Button>
          </div>
        </div>
      </header>

      {/* HERO SECTION - 2 Columns */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-b from-blue-50/50 via-white to-white overflow-hidden relative min-h-[90vh] flex items-center">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-enem-blue/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-enem-blue rounded-full text-sm font-bold border border-blue-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-enem-blue animate-pulse"></span> O futuro da preparação
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
              Sua aprovação <br/> guiada por <span className="text-transparent bg-clip-text bg-gradient-to-r from-enem-blue to-blue-400">Inteligência Artificial</span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
              Pare de perder tempo com simulados genéricos. A Studr mapeia suas falhas e cria trilhas de questões infinitas exclusivas para você.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button onClick={() => handleStartRedirect('register', true)} className="text-lg px-8 py-4 shadow-xl shadow-blue-500/20 bg-enem-blue hover:bg-blue-700 text-white font-bold rounded-2xl transform transition-transform hover:scale-105 uppercase tracking-tight">
                Iniciar Teste de 7 Dias
              </Button>
              <Button onClick={onPricing} variant="outline" className="text-lg px-8 py-4 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-2xl transition-colors">
                Ver Planos
              </Button>
            </div>
          </div>

          {/* Hero Video Mockup */}
          <div className="relative animate-fade-in lg:mt-0 mt-12 group perspective-1000 max-w-2xl mx-auto lg:mx-0">
            <div className="w-full aspect-[4/3] bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden transform transition-transform duration-700 group-hover:rotate-y-2 group-hover:rotate-x-1 ring-1 ring-white/10">
              <video
                src="/studr.mp4"
                controls
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
              >
                Seu navegador não suporta a reprodução de vídeos.
              </video>
              {/* Subtle glass overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
            </div>
            {/* Floating UI Elements Placeholders */}
            <div className="absolute -left-8 top-12 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-bounce-slow delay-100">
               <div className="text-sm font-bold text-slate-700">🎯 Precisão TRI</div>
               <div className="text-2xl font-black text-enem-blue">+150 pts</div>
            </div>
            <div className="absolute -right-6 bottom-20 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-bounce-slow delay-300">
               <div className="text-sm font-bold text-slate-700">✍️ Redação</div>
               <div className="text-2xl font-black text-green-500">Nota 960</div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Numbers Banner */}
      <section className="py-12 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
          <div>
            <div className="text-3xl md:text-4xl font-black text-white mb-1">+1M</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Questões Geradas</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-blue-400 mb-1">100%</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Foco no ENEM</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-yellow-400 mb-1">+20k</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Redações Corrigidas</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-green-400 mb-1">24/7</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">IA Disponível</div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 1 - Problema (Texto Direita, Img Esquerda) */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
             <img 
               src="/dobra-1.jpeg" 
               alt="Estudante frustrado com métodos tradicionais" 
               className="w-full aspect-square md:aspect-[4/3] object-cover rounded-[2.5rem] shadow-2xl border border-slate-100" 
             />
          </div>
          <div className="space-y-6 order-1 lg:order-2">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">Estudar sem direção é a receita para a reprovação.</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Muitos estudantes passam horas resolvendo listas gigantes e assistindo videoaulas que não precisam. O resultado? Cansaço excessivo e nenhuma evolução real na nota.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-start gap-4 text-slate-700">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center mt-1">✕</span>
                Apostilas desatualizadas que não seguem o padrão atual.
              </li>
              <li className="flex items-start gap-4 text-slate-700">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center mt-1">✕</span>
                Não saber quais disciplinas estão abaixando sua nota TRI.
              </li>
              <li className="flex items-start gap-4 text-slate-700">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center mt-1">✕</span>
                Pagar caro por cursinhos focados apenas na teoria, sem prática inteligente.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2 - Solução (Texto Esquerda, Img Direita) */}
      <section className="py-24 px-6 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="text-enem-blue font-bold uppercase tracking-widest text-sm">O Método Studr</div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">Uma IA que entende como seu cérebro aprende.</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Enquanto as outras plataformas te entregam listas prontas, a Studr adapta cada questão com base no seu erro anterior. Nossa arquitetura mapeia sua proficiência em micro-habilidades.
            </p>
            <Button onClick={() => onPricing?.()} className="mt-4 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg">Descubra a diferença</Button>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <img 
              src="/FT - SITE - STUDR.jpeg" 
              alt="Plataforma Studr" 
              className="relative w-full aspect-square md:aspect-[4/3] object-cover rounded-[2.5rem] shadow-2xl border border-slate-100" 
            />
          </div>
        </div>
      </section>

      {/* SEÇÃO 3 — CARROSSEL DE FUNCIONALIDADES (PREMIUM) */}
      <section className="py-24 px-6 bg-slate-900 overflow-hidden relative">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-enem-blue/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 space-y-4">
             <h2 className="text-3xl md:text-6xl font-black text-white tracking-tight">
               Tudo que você precisa em <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">1 lugar</span>
             </h2>
             <p className="text-xl text-slate-400 max-w-2xl mx-auto">
               A tecnologia que faltava para sua aprovação. Substitua múltiplas ferramentas por uma experiência única.
             </p>
          </div>

          <div className="relative group">
            {/* Main Content Area */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[3rem] p-8 md:p-12 shadow-2xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Side: Copy */}
                <div className="space-y-8 order-2 lg:order-1 transition-all duration-500 transform">
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${slides[currentSlide].color} shadow-lg shadow-blue-500/20`}>
                    {React.cloneElement(slides[currentSlide].icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8 text-white" })}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-4xl md:text-5xl font-black text-white leading-tight">
                      {slides[currentSlide].title}
                    </h3>
                    <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-lg">
                      {slides[currentSlide].description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                    <Button
                      onClick={onPricing}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] px-10 py-4 rounded-2xl font-black transition-all transform hover:scale-105 uppercase tracking-tight"
                    >
                      Experimentar Agora
                    </Button>
                    <div className="flex gap-2">
                       {slides.map((_, idx) => (
                         <button 
                           key={idx} 
                           onClick={() => setCurrentSlide(idx)}
                           className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-blue-400' : 'w-2 bg-slate-700'}`}
                         />
                       ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Image with Mockup Style */}
                <div className="order-1 lg:order-2 relative flex justify-center">
                   <div className="relative w-full max-w-[280px] aspect-[9/16] bg-slate-950 rounded-[3rem] p-2.5 shadow-[0_0_50px_rgba(59,130,246,0.2)] border-[8px] border-slate-800 overflow-hidden transform hover:-rotate-1 transition-transform duration-700">
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-800 rounded-b-3xl z-20"></div>
                      
                      <div className="w-full h-full rounded-[2rem] overflow-hidden relative bg-white">
                        <img 
                          key={currentSlide} 
                          src={slides[currentSlide].image} 
                          alt={slides[currentSlide].title}
                          className="w-full h-full object-contain object-top animate-fade-in-scale" 
                        />
                      </div>
                   </div>
                   
                   {/* Decorative elements */}
                   <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full"></div>
                   <div className="absolute -top-6 -left-6 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button 
              onClick={prevSlide}
              className="absolute left-[-20px] md:left-[-40px] top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white border border-white/10 transition-all opacity-0 group-hover:opacity-100 z-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-[-20px] md:right-[-40px] top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white border border-white/10 transition-all opacity-0 group-hover:opacity-100 z-30"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>


      {/* SEÇÃO 4 - TESTIMONIALS (Previously unused!) */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-100">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-center text-slate-900 mb-16">Eles confiaram na IA. <br/> <span className="text-enem-blue">Eles passaram.</span></h2>
            <div className="grid md:grid-cols-3 gap-8">
               {testimonials.map((t, idx) => (
                 <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-shadow">
                    <div className="flex text-yellow-400 mb-6">★★★★★</div>
                    <p className="text-slate-700 italic flex-1 leading-relaxed">"{t.text}"</p>
                    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                       <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl border border-blue-100">{t.avatar}</div>
                       <div>
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="text-sm text-enem-blue font-medium">{t.role}</div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-slate-900 relative overflow-hidden flex items-center justify-center min-h-[50vh]">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
           <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-enem-blue rounded-full blur-[120px] opacity-30"></div>
        </div>
        <div className="max-w-4xl mx-auto space-y-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Pronto para hackear a sua aprovação?
          </h2>
          <Button onClick={() => handleStartRedirect('register', true)} className="px-12 py-5 text-xl bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-black rounded-full shadow-[0_0_40px_rgba(250,204,21,0.3)] hover:scale-105 transition-all uppercase">
            COMEÇAR TESTE DE 7 DIAS
          </Button>
          <p className="text-slate-400 text-sm font-medium">Leva menos de 30 segundos. Teste tudo sem compromisso.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center text-center md:text-left">
          
          <div className="space-y-4">
            <a href="https://studr.com.br" className="inline-block">
              <Logo className="h-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all mx-auto md:mx-0" />
            </a>
            <p className="text-xs text-slate-500 max-w-xs mx-auto md:mx-0">
              Acompanhe sua evolução e domine o ENEM com a melhor Inteligência Artificial de preparação.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
             <div className="flex gap-6">
                <a href="https://www.instagram.com/studr.enem" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                   <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.tiktok.com/@studr.enem" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                </a>
                <a href="mailto:Suporte@studr.com.br" className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                   <Mail className="w-5 h-5" />
                </a>
             </div>
             <a href="mailto:Suporte@studr.com.br" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                Suporte@studr.com.br
             </a>
          </div>

          <div className="flex flex-col items-center md:items-end space-y-4">
            <div className="flex gap-6 text-sm text-slate-400 font-medium">
              <button onClick={onTerms} className="hover:text-white transition-colors">Termos</button>
              <button onClick={onPrivacy} className="hover:text-white transition-colors">Privacidade</button>
            </div>
            <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} Studr LTDA. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageV3;
