
import React from 'react';
import { Button, Card } from './UIComponents';
import Logo from './Logo';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
            <p className="text-gray-500 mb-8 text-sm">Última atualização: 10/01/2026</p>

            <div className="space-y-8 text-gray-700 leading-relaxed">
              <p>
                Esta Política de Privacidade descreve como nós (“Plataforma”, “Aplicativo”, “Serviço” ou “Empresa”) coletamos, utilizamos, armazenamos, compartilhamos e protegemos seus dados pessoais. A utilização do aplicativo implica aceitação integral desta Política.
              </p>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">1. Quais dados coletamos</h2>
                
                <h3 className="font-bold text-gray-900 mt-4 mb-2">1.1. Dados fornecidos pelo usuário</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Nome completo</li>
                  <li>E-mail</li>
                  <li>Senha (criptografada)</li>
                  <li>Foto de perfil (opcional)</li>
                  <li>Dados acadêmicos (curso desejado, universidades de interesse, ano de estudo)</li>
                  <li>Redações enviadas para correção</li>
                  <li>Mensagens enviadas ao chatbot</li>
                </ul>

                <h3 className="font-bold text-gray-900 mt-4 mb-2">1.2. Dados coletados automaticamente</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Modelo do dispositivo</li>
                  <li>Sistema operacional</li>
                  <li>Endereço IP</li>
                  <li>Identificadores de dispositivo</li>
                  <li>Dados de navegação no app</li>
                  <li>Horários de uso</li>
                  <li>Cookies ou tecnologias similares</li>
                </ul>

                <h3 className="font-bold text-gray-900 mt-4 mb-2">1.3. Dados usados para desempenho acadêmico</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Respostas de questões</li>
                  <li>Resultados de simulados</li>
                  <li>Notas simuladas e estatísticas</li>
                  <li>Histórico de estudos</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">2. Como utilizamos seus dados</h2>
                <p className="mb-2">Seus dados são utilizados para:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Criar e gerenciar sua conta</li>
                  <li>Personalizar sua experiência de estudo</li>
                  <li>Gerar simulados, notas estimadas e estatísticas</li>
                  <li>Atribuir posicionamento no ranking global</li>
                  <li>Melhorar o desempenho dos algoritmos da plataforma</li>
                  <li>Realizar correção de redação por IA</li>
                  <li>Enviar comunicações importantes, como avisos de alterações, notificações e suporte</li>
                  <li>Garantir segurança e prevenção contra fraudes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">3. Base legal para tratamento (LGPD)</h2>
                <p className="mb-2">Tratamos seus dados com base em:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Consentimento</li>
                  <li>Execução de contrato (fornecimento do serviço)</li>
                  <li>Legítimo interesse (melhorias, segurança, análises internas)</li>
                  <li>Cumprimento de obrigações legais, quando aplicável</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">4. Compartilhamento de dados</h2>
                <p className="mb-2">Não vendemos dados pessoais. Podemos compartilhar dados apenas com:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Serviços terceiros essenciais, como:
                    <ul className="list-circle pl-5 mt-1 text-sm">
                      <li>provedores de nuvem</li>
                      <li>serviços de pagamento</li>
                      <li>sistemas de autenticação</li>
                      <li>análises de desempenho</li>
                    </ul>
                  </li>
                  <li>Autoridades governamentais, se houver ordem judicial ou obrigação legal</li>
                  <li>Parceiros acadêmicos, somente com consentimento explícito do usuário</li>
                </ul>
                <p className="mt-2 font-semibold">Nenhum dado é compartilhado com anunciantes externos.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">5. Armazenamento e segurança dos dados</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Dados são armazenados em servidores seguros e criptografados.</li>
                  <li>Senhas são protegidas por hash.</li>
                  <li>Apenas pessoal autorizado tem acesso restrito às informações.</li>
                  <li>Utilizamos protocolos de segurança e proteção contra ataques.</li>
                </ul>
                <p className="mt-2 text-sm italic">Embora adotemos medidas avançadas, nenhum sistema é 100% livre de riscos.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">6. Seus direitos (LGPD)</h2>
                <p className="mb-2">O usuário pode, a qualquer momento:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>confirmar existência de tratamento</li>
                  <li>solicitar acesso aos dados</li>
                  <li>corrigir dados incompletos ou desatualizados</li>
                  <li>solicitar exclusão da conta e dos dados (exceto os que precisamos manter por obrigação legal)</li>
                  <li>revogar consentimento</li>
                  <li>solicitar portabilidade</li>
                </ul>
                <p className="mt-2">As solicitações podem ser feitas pelo e-mail de suporte do aplicativo.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">7. Dados de redação e chatbot</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Os textos enviados para correção de redação são utilizados apenas para avaliação e melhoria dos algoritmos.</li>
                  <li>O conteúdo enviado ao chatbot pode ser utilizado para aperfeiçoamento do sistema.</li>
                  <li>Nenhum conteúdo é divulgado publicamente.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">8. Cookies e tecnologias similares</h2>
                <p className="mb-2">Utilizamos cookies e identificadores para:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>lembrar preferências</li>
                  <li>melhorar performance</li>
                  <li>entender comportamento de uso</li>
                  <li>proteger sua conta</li>
                </ul>
                <p className="mt-2">O usuário pode bloquear cookies, mas algumas funcionalidades podem ser afetadas.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">9. Retenção dos dados</h2>
                <p className="mb-2">Os dados são mantidos enquanto a conta estiver ativa, ou forem necessários para cumprir obrigações legais.</p>
                <p className="mb-1">Ao excluir a conta:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>históricos, simulados, redações e estatísticas são apagados</li>
                  <li>backups podem permanecer pelo prazo legal</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">10. Serviços terceirizados</h2>
                <p>Podemos utilizar APIs, inteligência artificial e serviços externos. Cada serviço possui sua própria política de privacidade.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">11. Transferência internacional de dados</h2>
                <p>Se os dados forem armazenados em servidores fora do Brasil, garantiremos medidas adequadas de proteção e seguiremos diretrizes da LGPD para transferência internacional.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">12. Alterações nesta Política</h2>
                <p>Podemos atualizar esta Política a qualquer momento. Alterações serão comunicadas por e-mail, notificação no app ou dentro da própria plataforma. O uso contínuo após mudanças significa aceitação das novas regras.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-enem-blue mb-3">13. Contato e suporte</h2>
                <p>
                  Para dúvidas, solicitações ou exercício de direitos, entre em contato através do e-mail: <a href="mailto:suporte@studr.com.br" className="text-enem-blue font-bold hover:underline">suporte@studr.com.br</a>.
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

export default PrivacyPolicy;
