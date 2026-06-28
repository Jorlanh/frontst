import { AreaOfKnowledge } from './types';

export const SUBJECT_AREAS = [
  { id: AreaOfKnowledge.EXATAS, name: 'Exatas', icon: '📐' },
  { id: AreaOfKnowledge.NATUREZA, name: 'Natureza', icon: '🧬' },
  { id: AreaOfKnowledge.HUMANAS, name: 'Humanas', icon: '🏛️' },
  { id: AreaOfKnowledge.LINGUAGENS, name: 'Linguagens', icon: '📖' },
];

export const GAMIFICATION_SUBJECTS = {
  [AreaOfKnowledge.LINGUAGENS]: [
    "Português", "Literatura", "Inglês", "Espanhol", "Artes", "Educação Física", "Tecnologias da Informação"
  ],
  [AreaOfKnowledge.HUMANAS]: [
    "História", "Geografia", "Filosofia", "Sociologia"
  ],
  [AreaOfKnowledge.NATUREZA]: [
    "Química", "Física", "Biologia"
  ],
  [AreaOfKnowledge.EXATAS]: [
    "Matemática"
  ]
};

// Lista limpa e única para os botões do HomeView
export const SPECIFIC_SUBJECTS = [
  { name: 'Matemática', area: AreaOfKnowledge.EXATAS },
  { name: 'Física', area: AreaOfKnowledge.NATUREZA },
  { name: 'Química', area: AreaOfKnowledge.NATUREZA },
  { name: 'Biologia', area: AreaOfKnowledge.NATUREZA },
  { name: 'História', area: AreaOfKnowledge.HUMANAS },
  { name: 'Geografia', area: AreaOfKnowledge.HUMANAS },
  { name: 'Filosofia', area: AreaOfKnowledge.HUMANAS },
  { name: 'Sociologia', area: AreaOfKnowledge.HUMANAS },
  { name: 'Português', area: AreaOfKnowledge.LINGUAGENS },
  { name: 'Literatura', area: AreaOfKnowledge.LINGUAGENS },
  { name: 'Inglês', area: AreaOfKnowledge.LINGUAGENS },
  { name: 'Espanhol', area: AreaOfKnowledge.LINGUAGENS },
  { name: 'Artes', area: AreaOfKnowledge.LINGUAGENS },
  { name: 'Educação Física', area: AreaOfKnowledge.LINGUAGENS },
  { name: 'Tecnologias da Informação', area: AreaOfKnowledge.LINGUAGENS },
];

export const SUBJECT_TOPICS: Record<string, string[]> = {
  "Português": ["Gramática", "Interpretação de Texto", "Gêneros Textuais", "Variação Linguística", "Figuras de Linguagem"],
  "Literatura": ["Quinhentismo e Barroco", "Arcadismo e Romantismo", "Realismo e Naturalismo", "Modernismo", "Literatura Contemporânea"],
  "Inglês": ["Interpretação de Texto", "Vocabulário", "Tempos Verbais"],
  "Espanhol": ["Interpretação de Texto", "Falsos Amigos", "Gramática Básica"],
  "Artes": ["História da Arte", "Movimentos Artísticos", "Arte Contemporânea"],
  "Educação Física": ["Corpo e Cultura", "Esporte e Sociedade", "Saúde e Lazer"],
  "História": ["Brasil Colônia", "Brasil Império", "Brasil República", "Antiguidade Clássica", "Idade Média", "Guerra Fria"],
  "Geografia": ["Geografia do Brasil", "Geopolítica", "Meio Ambiente", "Espaço Agrário e Urbano"],
  "Filosofia": ["Socráticos", "Platão e Aristóteles", "Ética e Política", "Existencialismo"],
  "Sociologia": ["Cidadania", "Cultura e Identidade", "Trabalho e Produção"],
  "Física": ["Mecânica", "Termologia", "Óptica", "Eletricidade", "Ondulatória"],
  "Química": ["Química Geral", "Físico-Química", "Química Orgânica", "Meio Ambiente"],
  "Biologia": ["Citologia", "Genética", "Evolução", "Ecologia", "Fisiologia Humana"],
  "Matemática": ["Álgebra", "Geometria", "Tratamento de Informação", "Razão e Proporção", "Funções"]
};

export const STUDY_GUIDE_SUBJECTS = Object.keys(SUBJECT_TOPICS);

export const MOCK_UNIVERSITIES = [
  "USP", "UFRJ", "UFMG", "UNICAMP", "UNESP", "UFRGS", "UFPE", "UNB"
];

export const MOCK_COURSES = [
  "Medicina", "Direito", "Engenharia de Software", "Psicologia", "Economia", "Administração", "Biologia"
];

// XP Constants
export const XP_VALUES = {
  CORRECT_ANSWER: 1,
  WRONG_ANSWER: -0.5,
  DAILY_META_BONUS: 2,
  WEEKLY_QUESTIONS_BONUS: 10,
  WEEKLY_ESSAY_BONUS: 12,
  WEEKLY_MOCK_BONUS: 15,
  FULL_MOCK_BONUS: 16,
  ESSAY_SUBMITTED: 12
};

export const ESSAY_MODEL_THEMES = [
  "Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil (2023)",
  "Desafios para a valorização de comunidades e povos tradicionais no Brasil (2022)",
  "Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil (2021)",
  "O estigma associado às doenças mentais na sociedade brasileira (2020)",
  "Democratização do acesso ao cinema no Brasil (2019)",
  "Manipulação do comportamento do usuário pelo controle de dados na internet (2018)",
  "Desafios para a formação educacional de surdos no Brasil (2017)",
  "Caminhos para combater a intolerância religiosa no Brasil (2016)",
  "A persistência da violência contra a mulher na sociedade brasileira (2015)",
  "Publicidade infantil em questão no Brasil (2014)",
  "Efeitos da implantação da Lei Seca no Brasil (2013)",
  "Movimento imigratório para o Brasil no século XXI (2012)",
  "Viver em rede no século XXI: os limites entre o público e o privado (2011)",
  "O trabalho na construção da dignidade humana (2010)",
  "O indivíduo frente à ética nacional (2009)",
  "Como preservar a floresta Amazônica (2008)",
  "O desafio de se conviver com a diferença (2007)",
  "O poder de transformação da leitura (2006)",
  "O trabalho infantil na sociedade brasileira (2005)",
  "Como garantir a liberdade de informação e evitar abusos nos meios de comunicação (2004)",
  "A violência na sociedade brasileira: como mudar as regras desse jogo (2003)",
  "O direito de votar: como fazer dessa conquista um meio para promover as transformações sociais de que o Brasil necessita? (2002)",
  "Desenvolvimento e preservação ambiental: como conciliar os interesses em conflito? (2001)",
  "Direitos da criança e do adolescente: como enfrentar esse desafio nacional? (2000)",
  "Cidadania e participação social (1999)",
  "Viver e aprender (1998)",
  "Os desafios da saúde pública frente a novas epidemias",
  "Os impactos da inteligência artificial no mercado de trabalho",
  "A importância da ciência para o desenvolvimento autônomo do Brasil",
  "Evasão escolar no ensino médio brasileiro: causas e consequências",
  "O combate ao desperdício de alimentos no Brasil",
  "A importância da vacinação para a saúde pública brasileira",
  "Os desafios da inclusão digital para idosos no Brasil",
  "A democratização do acesso ao esporte como ferramenta de inclusão social",
  "O impacto do lixo eletrônico no meio ambiente brasileiro",
  "A valorização do patrimônio histórico e cultural brasileiro",
  "Os perigos da automedicação na sociedade brasileira contemporânea",
  "A questão da obesidade infantil no Brasil: causas e consequências",
  "Os desafios da mobilidade urbana sustentável nas grandes cidades",
  "A influência dos influenciadores digitais no comportamento de consumo dos jovens",
  "O combate ao bullying e cyberbullying nas escolas brasileiras",
  "A importância da doação de órgãos e tecidos no Brasil",
  "O desafio da reintegração social de ex-presidiários no Brasil",
  "A crise hídrica e a necessidade de preservação dos recursos naturais",
  "O papel da escola na formação da educação financeira dos jovens",
  "A acessibilidade para pessoas com deficiência física nas cidades brasileiras",
  "Os impactos do trabalho informal na economia e na vida do trabalhador",
  "A prevenção ao suicídio e a valorização da vida entre os jovens",
  "O combate ao turismo sexual e à exploração infantil no Brasil",
  "A importância da reciclagem e da coleta seletiva para o futuro do planeta",
  "Os desafios para a garantia da segurança alimentar no Brasil",
  "A disseminação de fake news e seus impactos na democracia",
  "A precarização das relações de trabalho na era dos aplicativos (Uberização)",
  "O aumento da população em situação de rua nos centros urbanos",
  "A violência obstétrica e os direitos da gestante no Brasil",
  "O papel da tecnologia na democratização da educação a distância",
  "A preservação da fauna brasileira e o combate ao tráfico de animais",
  "Os desafios para a erradicação do analfabetismo funcional no Brasil",
  "A saúde mental do trabalhador brasileiro na sociedade de desempenho",
  "O consumo consciente e a redução do uso de plásticos descartáveis",
  "O esporte como ferramenta de inclusão social de pessoas com deficiência",
  "A importância do saneamento básico para a saúde da população brasileira",
  "A cultura do cancelamento e seus efeitos na sociedade contemporânea",
  "Os desafios da adoção de crianças e adolescentes no Brasil",
  "A gravidez na adolescência e seus impactos na educação e na sociedade",
  "O combate à pirataria e a valorização da propriedade intelectual",
  "A importância da amamentação para a saúde materna e infantil",
  "Os desafios para o combate ao trabalho escravo contemporâneo no Brasil",
  "A valorização da cultura indígena e a preservação de suas tradições",
  "O impacto das mudanças climáticas na agricultura brasileira",
  "A importância da leitura na formação crítica do cidadão",
  "Os desafios da mobilidade urbana e o uso de bicicletas como transporte",
  "A inclusão de pessoas com autismo no mercado de trabalho e na sociedade",
  "O combate à violência doméstica contra crianças e adolescentes",
  "A importância da preservação das abelhas para a biodiversidade",
  "Os desafios do sistema prisional brasileiro e a ressocialização",
  "A influência da mídia na formação dos padrões de beleza",
  "O combate ao sedentarismo e a promoção de hábitos saudáveis",
  "A importância da preservação dos biomas brasileiros (Cerrado, Caatinga, etc)",
  "Os desafios da educação inclusiva para alunos com altas habilidades",
  "A questão dos refugiados e a acolhida humanitária no Brasil",
  "O impacto da poluição sonora na saúde e no bem-estar da população",
  "A importância do voluntariado para a construção de uma sociedade solidária",
  "Os desafios para a implementação da economia circular no Brasil",
  "A valorização do professor e os desafios da docência no Brasil"
];

