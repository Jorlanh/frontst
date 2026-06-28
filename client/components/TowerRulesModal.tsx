import React from 'react';

import {
  Modal,
  Button
} from './UIComponents';

import {
  Sword,
  Clock,
  TrendingUp,
  Map,
  Brain,
  Crown,
  Flame,
  Zap,
  ChevronRight,
  Siren
} from 'lucide-react';

interface TowerRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TowerRulesModal({
  isOpen,
  onClose
}: TowerRulesModalProps) {

  const districts = [
    {
      title: 'Distrito I — Despertar',
      desc: 'Os fundamentos da disciplina. O jogador começa fraco.',
      color: 'text-cyan-300',
      border: 'border-cyan-500/20'
    },
    {
      title: 'Distrito II — Ascensão',
      desc: 'A dificuldade textual aumenta e a TRI começa a punir erros.',
      color: 'text-blue-300',
      border: 'border-blue-500/20'
    },
    {
      title: 'Distrito III — Colapso',
      desc: 'Fadiga mental, pressão emocional e provas gigantescas.',
      color: 'text-red-300',
      border: 'border-red-500/20'
    },
    {
      title: 'Distrito IV — Elite Nacional',
      desc: 'Questões semelhantes às mais difíceis do ENEM.',
      color: 'text-yellow-300',
      border: 'border-yellow-500/20'
    },
    {
      title: 'Distrito V — Torre Suprema',
      desc: 'A IA começa a analisar comportamento cognitivo.',
      color: 'text-fuchsia-300',
      border: 'border-fuchsia-500/20'
    },
    {
      title: 'Distrito VI — Torre dos 1000',
      desc: 'O ápice absoluto da evolução intelectual.',
      color: 'text-emerald-300',
      border: 'border-emerald-500/20'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Jornada TRI — Evolução Absoluta"
      size="xl"
    >

      <div className="relative overflow-hidden bg-[#060816]">

        {/* BACKGROUND */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">

          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[180px]" />

          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-700/20 blur-[180px]" />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/10 blur-[220px]" />

        </div>

        {/* CONTENT */}
        <div className="
          relative
          z-10
          p-6
          space-y-6
          max-h-[80vh]
          overflow-y-auto
          custom-scrollbar
        ">

          {/* HERO */}
          <div className="text-center">

            <div className="
              relative
              w-28
              h-28
              mx-auto
              rounded-[2rem]
              bg-gradient-to-br
              from-cyan-400
              via-blue-500
              to-indigo-700
              flex
              items-center
              justify-center
              text-5xl
              shadow-[0_0_60px_rgba(34,211,238,0.35)]
              mb-6
              border
              border-cyan-400/20
            ">

              🗼

              <div className="
                absolute
                inset-0
                rounded-[2rem]
                border
                border-cyan-300/20
                animate-pulse
              " />

            </div>

            <h1 className="
              text-5xl
              font-black
              uppercase
              tracking-tight
              bg-gradient-to-r
              from-cyan-300
              via-white
              to-blue-500
              bg-clip-text
              text-transparent
              drop-shadow-[0_0_25px_rgba(34,211,238,0.35)]
            ">

              A GIGANTESCA TORRE DA EVOLUÇÃO

            </h1>

            <p className="
              mt-6
              text-slate-200
              max-w-3xl
              mx-auto
              leading-relaxed
              text-sm
            ">

              Você não está entrando em um aplicativo de estudos.

              <br /><br />

              Você está entrando em uma guerra psicológica rumo aos 1000 pontos no ENEM.

              Cada prédio representa sua evolução mental, emocional e cognitiva.

              <br /><br />

              A cada subida:
              mais pressão,
              mais fadiga,
              mais dificuldade,
              mais resistência.

            </p>

          </div>

          {/* ALERT */}
          <div className="
            rounded-3xl
            p-6
            bg-gradient-to-br
            from-red-500/15
            to-red-900/10
            border
            border-red-500/30
            shadow-[0_0_40px_rgba(239,68,68,0.15)]
          ">

            <div className="flex items-start gap-4">

              <Siren
                className="text-red-400 mt-1"
                size={30}
              />

              <div>

                <h2 className="
                  text-red-300
                  font-black
                  uppercase
                  text-xl
                ">

                  Aviso do Sistema

                </h2>

                <p className="
                  text-slate-200
                  text-sm
                  mt-3
                  leading-relaxed
                ">

                  A Jornada TRI foi criada para simular:
                  pressão real,
                  desgaste mental,
                  fadiga cognitiva,
                  gestão de tempo,
                  resistência emocional
                  e evolução extrema de performance.

                  <br /><br />

                  Conforme você sobe:
                  o sistema se torna mais agressivo,
                  mais inteligente
                  e mais implacável.

                </p>

              </div>

            </div>

          </div>

          {/* DISTRITOS */}
          <section className="space-y-5">

            <div className="flex items-center gap-3">

              <Map
                className="text-cyan-300"
                size={28}
              />

              <h2 className="
                text-2xl
                font-black
                uppercase
                text-white
              ">

                Distritos da Jornada

              </h2>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {districts.map((district, index) => (

                <div
                  key={index}
                  className={`
                    rounded-3xl
                    border
                    ${district.border}
                    bg-[#0B1020]
                    p-5
                    shadow-[0_0_30px_rgba(0,0,0,0.35)]
                    transition-all
                    duration-300
                    hover:scale-[1.01]
                  `}
                >

                  <div className="flex items-center gap-2 mb-3">

                    <ChevronRight
                      className={district.color}
                      size={18}
                    />

                    <h3 className="
                      font-black
                      uppercase
                      text-white
                      text-sm
                    ">

                      {district.title}

                    </h3>

                  </div>

                  <p className="
                    text-sm
                    text-slate-300
                    leading-relaxed
                  ">

                    {district.desc}

                  </p>

                </div>

              ))}

            </div>

          </section>

          {/* QUESTÕES */}
          <section className="
            rounded-3xl
            border
            border-[#1B2440]
            bg-[#0B1020]
            p-6
            shadow-[0_0_30px_rgba(0,0,0,0.35)]
          ">

            <div className="flex items-center gap-3 mb-4">

              <TrendingUp
                className="text-cyan-300"
                size={28}
              />

              <h2 className="
                text-2xl
                font-black
                uppercase
                text-white
              ">

                Escalonamento Cognitivo

              </h2>

            </div>

            <p className="
              text-sm
              text-slate-200
              leading-relaxed
              mb-5
            ">

              A evolução NÃO consiste apenas em aumentar questões.

              <br /><br />

              O sistema aumenta:
              dificuldade cognitiva,
              interpretação,
              pegadinhas TRI,
              interdisciplinaridade,
              pressão psicológica,
              velocidade exigida
              e resistência mental.

            </p>

            <div className="space-y-3">

              {[
                ['Prédio 1', '5 Questões'],
                ['Prédio 10', '12 Questões'],
                ['Prédio 25', '22 Questões'],
                ['Prédio 40', '35 Questões'],
                ['Prédio 60', '60 Questões'],
                ['Prédio 80', '90 Questões'],
                ['Prédio 100', '180 Questões + Simulado Final']
              ].map((item, index) => (

                <div
                  key={index}
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    bg-[#11182D]
                    border
                    border-[#26304F]
                    hover:border-cyan-400/40
                    transition-all
                    duration-300
                    px-4
                    py-4
                  "
                >

                  <span className="
                    text-sm
                    font-bold
                    text-slate-200
                  ">
                    {item[0]}
                  </span>

                  <span className="
                    text-cyan-300
                    font-black
                  ">
                    {item[1]}
                  </span>

                </div>

              ))}

            </div>

          </section>

          {/* REDAÇÃO */}
          <section className="
            bg-gradient-to-br
            from-red-500/15
            to-[#1A0D12]
            border
            border-red-500/30
            rounded-3xl
            p-6
            shadow-[0_0_50px_rgba(239,68,68,0.12)]
          ">

            <div className="flex items-center gap-3 mb-4">

              <Clock
                className="text-red-300"
                size={28}
              />

              <h2 className="
                text-2xl
                font-black
                uppercase
                text-red-200
              ">

                Redação: Morte Súbita

              </h2>

            </div>

            <p className="
              text-sm
              text-slate-200
              leading-relaxed
              mb-5
            ">

              A redação é o CHEFÃO FINAL de cada prédio.

              <br /><br />

              Ela possui:
              tempo limite,
              pressão psicológica,
              envio automático
              e análise emocional em tempo real.

            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="
                rounded-2xl
                bg-[#111827]
                border
                border-[#2A344F]
                p-5
              ">

                <div className="
                  text-xs
                  text-slate-400
                  mb-2
                  uppercase
                ">
                  Iniciante
                </div>

                <div className="
                  text-4xl
                  font-black
                  text-white
                ">
                  90min
                </div>

              </div>

              <div className="
                rounded-2xl
                bg-[#111827]
                border
                border-[#2A344F]
                p-5
              ">

                <div className="
                  text-xs
                  text-yellow-300
                  mb-2
                  uppercase
                ">
                  Avançado
                </div>

                <div className="
                  text-4xl
                  font-black
                  text-yellow-300
                ">
                  50min
                </div>

              </div>

              <div className="
                rounded-2xl
                bg-gradient-to-br
                from-red-500/20
                to-red-900/20
                border
                border-red-500/40
                shadow-[0_0_30px_rgba(239,68,68,0.15)]
                p-5
              ">

                <div className="
                  text-xs
                  text-red-300
                  mb-2
                  uppercase
                ">
                  Elite Suprema
                </div>

                <div className="
                  text-4xl
                  font-black
                  text-red-400
                ">
                  30min
                </div>

              </div>

            </div>

          </section>

          {/* IA */}
          <section className="
            rounded-3xl
            border
            border-[#1B2440]
            bg-[#0B1020]
            p-6
            shadow-[0_0_30px_rgba(0,0,0,0.35)]
          ">

            <div className="flex items-center gap-3 mb-4">

              <Brain
                className="text-fuchsia-300"
                size={28}
              />

              <h2 className="
                text-2xl
                font-black
                uppercase
                text-white
              ">

                IA Cognitiva Viva

              </h2>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {[
                'Detecta fadiga mental',
                'Analisa padrão cognitivo',
                'Detecta chute TRI',
                'Cria questões inéditas',
                'Adapta dificuldade em tempo real',
                'Monitora velocidade de leitura',
                'Gera revisões automáticas',
                'Prevê esquecimentos'
              ].map((item, index) => (

                <div
                  key={index}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    bg-[#11182D]
                    border
                    border-[#26304F]
                    hover:border-fuchsia-400/40
                    transition-all
                    duration-300
                    px-4
                    py-4
                  "
                >

                  <Zap
                    className="text-fuchsia-300"
                    size={18}
                  />

                  <span className="
                    text-sm
                    text-slate-200
                  ">
                    {item}
                  </span>

                </div>

              ))}

            </div>

          </section>

          {/* CLASSES */}
          <section className="
            rounded-3xl
            border
            border-[#1B2440]
            bg-[#0B1020]
            p-6
            shadow-[0_0_30px_rgba(0,0,0,0.35)]
          ">

            <div className="flex items-center gap-3 mb-5">

              <Sword
                className="text-yellow-300"
                size={28}
              />

              <h2 className="
                text-2xl
                font-black
                uppercase
                text-white
              ">

                Classes Cognitivas

              </h2>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {[
                'Executor de Exatas',
                'Estrategista Humanas',
                'Arquiteto da Redação',
                'Mestre da Natureza',
                'Especialista em Linguagens'
              ].map((item, index) => (

                <div
                  key={index}
                  className="
                    rounded-2xl
                    border
                    border-[#26304F]
                    bg-[#11182D]
                    hover:border-yellow-400/40
                    transition-all
                    duration-300
                    p-4
                  "
                >

                  <div className="flex items-center gap-3">

                    <Crown
                      className="text-yellow-300"
                      size={20}
                    />

                    <span className="
                      font-black
                      text-white
                      uppercase
                      text-sm
                    ">

                      {item}

                    </span>

                  </div>

                </div>

              ))}

            </div>

          </section>

          {/* FINAL */}
          <section className="
            rounded-3xl
            border
            border-cyan-500/20
            bg-gradient-to-br
            from-cyan-500/10
            to-blue-900/10
            p-8
            text-center
            shadow-[0_0_50px_rgba(34,211,238,0.12)]
          ">

            <Flame
              className="mx-auto text-cyan-300 mb-5"
              size={42}
            />

            <h2 className="
              text-4xl
              font-black
              uppercase
              bg-gradient-to-r
              from-cyan-300
              to-blue-500
              bg-clip-text
              text-transparent
            ">

              O Objetivo Final

            </h2>

            <p className="
              mt-5
              text-slate-200
              leading-relaxed
              max-w-2xl
              mx-auto
            ">

              Você começou como um estudante comum.

              <br /><br />

              Agora precisa sobreviver:
              à pressão,
              à fadiga,
              ao tempo,
              ao colapso emocional,
              à TRI,
              aos simulados extremos
              e à gigantesca Torre da Evolução.

              <br /><br />

              Apenas os mais resistentes alcançarão:
              a lendária nota 1000.

            </p>

          </section>

          {/* CTA */}
          <div className="pt-4">

            <Button
              onClick={onClose}
              className="
                w-full
                h-14
                rounded-2xl
                font-black
                uppercase
                tracking-wider
                bg-gradient-to-r
                from-cyan-400
                via-blue-500
                to-violet-600
                text-white
                shadow-[0_0_40px_rgba(34,211,238,0.35)]
                hover:brightness-110
                hover:shadow-[0_0_50px_rgba(34,211,238,0.45)]
                active:scale-[0.99]
                transition-all
                duration-300
              "
            >

              Entrar na Jornada TRI

            </Button>

          </div>

        </div>

      </div>

    </Modal>
  );
}