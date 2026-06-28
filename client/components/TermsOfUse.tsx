
import React from 'react';
import { Button, Card } from './UIComponents';
import Logo from './Logo';

interface TermsOfUseProps {
  onBack: () => void;
}

const TermsOfUse: React.FC<TermsOfUseProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <Logo className="h-7" />
          </div>
          <Button onClick={onBack} variant="outline" className="text-sm">
            Voltar
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
            <p className="text-gray-500 mb-8 text-sm">Última atualização: 10/01/2026</p>

            <div className="space-y-8 text-gray-700 leading-relaxed">
              <p>
                Bem-vindo ao <strong>Studr</strong> (“Plataforma”). Ao criar uma conta, acessar ou utilizar qualquer funcionalidade, você concorda integralmente com estes Termos de Uso, com a Política de Privacidade e com todas as demais regras exibidas dentro do aplicativo.
              </p>
              <p className="font-bold text-red-600">
                Se você não concorda com qualquer parte deste termo, não utilize a plataforma.
              </p>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">1. Sobre a Plataforma</h2>
                <p className="mb-2">A Plataforma disponibiliza ferramentas de preparação para o ENEM, incluindo, mas não se limitando a:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>banco de questões por matéria;</li>
                  <li>simulados com TRI;</li>
                  <li>cálculo estimado de nota;</li>
                  <li>ranking global;</li>
                  <li>resumos e materiais de estudo;</li>
                  <li>chatbot educacional;</li>
                  <li>correção automatizada de redação;</li>
                  <li>recursos de desempenho e progresso.</li>
                </ul>
                <p className="mt-2 text-sm italic">A Plataforma não possui qualquer vínculo oficial com o Ministério da Educação (MEC), INEP ou Governo Federal.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">2. Cadastro e Conta de Usuário</h2>
                <p className="mb-2">Para utilizar a Plataforma, o usuário deve:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>fornecer informações verdadeiras e atualizadas;</li>
                  <li>manter a segurança da conta;</li>
                  <li>não compartilhar senha com terceiros;</li>
                  <li>ser maior de 13 anos ou utilizar sob supervisão legal.</li>
                </ul>
                <p className="mt-2">A Plataforma pode suspender ou encerrar contas em caso de: violação destes Termos, uso indevido, fraude ou comportamentos que prejudiquem outros usuários ou o funcionamento do sistema.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">3. Pagamentos e Planos</h2>
                <p className="mb-2">O aplicativo pode oferecer plano gratuito, mensal, anual e compras avulsas. Ao adquirir um plano pago, o usuário:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>autoriza a cobrança recorrente;</li>
                  <li>entende que valores podem ser atualizados mediante aviso prévio;</li>
                  <li>reconhece que tarifas de terceiros (Google/Apple) podem aplicar políticas próprias.</li>
                </ul>
                <p className="mt-2">Cancelamentos seguem as regras da loja de aplicativos utilizada para a assinatura.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">4. Simulados, Pontuações e Cálculos</h2>
                <p className="mb-2">Os resultados apresentados nos simulados, análises e previsões de nota:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>são estimativas baseadas em modelos de correção próprios;</li>
                  <li>não garantem desempenho real no ENEM;</li>
                  <li>não representam promessa ou asseguramento de aprovação.</li>
                </ul>
                <p className="mt-2">A Plataforma não se responsabiliza por divergências entre notas simuladas e resultados oficiais.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">5. Conteúdos e Materiais</h2>
                <p className="mb-2">Todos os conteúdos disponibilizados:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>são protegidos por direitos autorais;</li>
                  <li>não podem ser copiados, distribuídos, revendidos ou reutilizados sem autorização formal;</li>
                  <li>incluem textos, questões, vídeos, resumos, algoritmos, gráficos e funcionalidades.</li>
                </ul>
                <p className="mt-2">Questões com base em provas anteriores preservam seus respectivos direitos dos autores originais.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">6. Correção de Redação por IA</h2>
                <p className="mb-2">A correção automática:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>utiliza algoritmos treinados para interpretar competências da redação ENEM;</li>
                  <li>pode não refletir com precisão a correção oficial feita pelo INEP;</li>
                  <li>deve ser utilizada apenas como apoio educacional.</li>
                </ul>
                <p className="mt-2">A Plataforma não garante resultados oficiais similares aos apresentados pela IA.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">7. Ranking Global</h2>
                <p className="mb-2">A classificação dos usuários:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>é baseada em métricas internas;</li>
                  <li>pode sofrer variações conforme atualizações;</li>
                  <li>exibe empates quando usuários possuem pontuações iguais;</li>
                  <li>não representa ranking oficial de desempenho.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">8. Uso Adequado</h2>
                <p className="mb-2">O usuário se compromete a não:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>burlar sistemas, rankings, simulados ou regras;</li>
                  <li>usar a plataforma para fins ilegais;</li>
                  <li>enviar conteúdo ofensivo, discriminatório ou impróprio;</li>
                  <li>tentar acessar áreas restritas ou manipular servidores.</li>
                </ul>
                <p className="mt-2 font-semibold">Violação pode resultar em suspensão imediata.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">9. Limitação de Responsabilidade</h2>
                <p className="mb-2">A Plataforma não se responsabiliza por:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>falhas de internet, hardware, software ou dispositivos do usuário;</li>
                  <li>decisões tomadas com base em dados estimados;</li>
                  <li>perdas financeiras, acadêmicas ou de qualquer natureza derivadas do uso do app.</li>
                </ul>
                <p className="mt-2">O uso é feito sob responsabilidade do usuário.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">10. Atualizações e Modificações</h2>
                <p>A Plataforma poderá atualizar conteúdo, funcionalidades ou interface, modificar estes Termos de Uso e alterar planos, preços e regras mediante aviso prévio. O uso contínuo após alterações significa aceitação das mudanças.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">11. Privacidade e Proteção de Dados</h2>
                <p>O tratamento de dados segue as normas da LGPD. O usuário pode consultar a Política de Privacidade para detalhes sobre coleta, armazenamento e uso de informações.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">12. Propriedade Intelectual</h2>
                <p>Todos os elementos da Plataforma são de propriedade da empresa responsável ou licenciados. Não é permitido reproduzir, modificar ou utilizar qualquer parte sem permissão expressa.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">13. Encerramento</h2>
                <p>O usuário pode excluir sua conta a qualquer momento. A plataforma pode encerrar contas que violem estes termos ou prejudiquem o funcionamento do sistema.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">14. Contato e Suporte</h2>
                <p>
                  Para dúvidas, solicitações de suporte ou questões relacionadas a estes Termos de Uso, entre em contato através do e-mail: <a href="mailto:suporte@studr.com.br" className="text-enem-blue font-bold hover:underline">suporte@studr.com.br</a>.
                </p>
              </section>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
              <Button onClick={onBack} className="px-8">Li e concordo</Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TermsOfUse;
