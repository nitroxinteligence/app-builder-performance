export type Aula = {
  id: string;
  titulo: string;
  descricao: string;
  duracao: string;
  xp: string;
  concluida?: boolean;
};

export type Modulo = {
  id: string;
  titulo: string;
  descricao: string;
  aulas: Aula[];
};

export type Curso = {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  categoria: string;
  nivel: string;
  destaque?: boolean;
  modulos: Modulo[];
};

export const cursos: Curso[] = [
  {
    id: "curso-1",
    slug: "builders-performance-junior",
    titulo: "Builders Performance Júnior",
    descricao:
      "Fundamentos de produtividade, rotina e performance para iniciar sua jornada.",
    categoria: "Produtividade",
    nivel: "Iniciante",
    destaque: true,
    modulos: [
      {
        id: "mod-1",
        titulo: "Boas-vindas",
        descricao: "Entenda o método e a visão do Builder Performance.",
        aulas: [
          {
            id: "intro",
            titulo: "Introdução ao programa",
            descricao: "Panorama do curso e da sua evolução.",
            duracao: "06:20",
            xp: "+10 XP",
            concluida: true,
          },
          {
            id: "metodo",
            titulo: "O método Builder",
            descricao: "Como as camadas de rotina se conectam.",
            duracao: "09:15",
            xp: "+15 XP",
            concluida: true,
          },
        ],
      },
      {
        id: "mod-2",
        titulo: "Rotina que funciona",
        descricao: "Estruturação diária e energia sustentável.",
        aulas: [
          {
            id: "rituais",
            titulo: "Rituais diários",
            descricao: "Manhãs e finais de dia com consistência.",
            duracao: "12:40",
            xp: "+20 XP",
          },
          {
            id: "ambiente",
            titulo: "Ambiente e foco",
            descricao: "Como preparar o espaço para alta performance.",
            duracao: "10:05",
            xp: "+20 XP",
          },
          {
            id: "energia",
            titulo: "Gestão de energia",
            descricao: "Alavancas simples para render mais.",
            duracao: "08:50",
            xp: "+15 XP",
          },
        ],
      },
    ],
  },
  {
    id: "curso-2",
    slug: "imersao-produto-rapido",
    titulo: "Imersão Produto Rápido",
    descricao:
      "Planejamento e execução para tirar ideias do papel com velocidade.",
    categoria: "Execução",
    nivel: "Intermediário",
    destaque: true,
    modulos: [
      {
        id: "mod-1",
        titulo: "Alinhamento estratégico",
        descricao: "Clareza de objetivo e foco de entrega.",
        aulas: [
          {
            id: "objetivos",
            titulo: "Definindo objetivos",
            descricao: "Direção clara antes de construir.",
            duracao: "11:10",
            xp: "+20 XP",
            concluida: true,
          },
          {
            id: "roadmap",
            titulo: "Roadmap em 3 semanas",
            descricao: "Plano enxuto com entregas reais.",
            duracao: "14:02",
            xp: "+25 XP",
          },
        ],
      },
      {
        id: "mod-2",
        titulo: "Entrega contínua",
        descricao: "Cadência, feedback e evolução.",
        aulas: [
          {
            id: "feedback",
            titulo: "Loop de feedback",
            descricao: "Feedback rápido para decisão rápida.",
            duracao: "09:30",
            xp: "+15 XP",
          },
          {
            id: "ritmo",
            titulo: "Ritmo de execução",
            descricao: "Como manter velocidade sem burnout.",
            duracao: "13:45",
            xp: "+25 XP",
          },
        ],
      },
    ],
  },
  {
    id: "curso-3",
    slug: "foco-profundo",
    titulo: "Foco Profundo",
    descricao:
      "Treinamento prático para sessões de deep work e produtividade sustentada.",
    categoria: "Foco",
    nivel: "Intermediário",
    modulos: [
      {
        id: "mod-1",
        titulo: "Fundamentos do foco",
        descricao: "O que rouba sua atenção e como recuperar.",
        aulas: [
          {
            id: "distracoes",
            titulo: "Mapa de distrações",
            descricao: "Identifique seus principais gatilhos.",
            duracao: "07:40",
            xp: "+10 XP",
          },
          {
            id: "setup",
            titulo: "Setup de imersão",
            descricao: "Prepare a mente e o ambiente.",
            duracao: "10:20",
            xp: "+15 XP",
          },
        ],
      },
      {
        id: "mod-2",
        titulo: "Sessões guiadas",
        descricao: "Rotinas para entrar em flow rapidamente.",
        aulas: [
          {
            id: "pomodoro-avancado",
            titulo: "Pomodoro avançado",
            descricao: "Como customizar ciclos sem perder ritmo.",
            duracao: "12:05",
            xp: "+20 XP",
          },
          {
            id: "recuperacao",
            titulo: "Recuperação ativa",
            descricao: "Pausas que recuperam energia de verdade.",
            duracao: "08:55",
            xp: "+15 XP",
          },
        ],
      },
    ],
  },
  {
    id: "curso-4",
    slug: "rotina-para-builders",
    titulo: "Rotina para Builders",
    descricao:
      "Crie sistemas pessoais para evoluir hábitos, tarefas e metas.",
    categoria: "Rotina",
    nivel: "Avançado",
    modulos: [
      {
        id: "mod-1",
        titulo: "Arquitetura da rotina",
        descricao: "Estruture sua semana com intenção.",
        aulas: [
          {
            id: "planejamento",
            titulo: "Planejamento semanal",
            descricao: "Priorização e execução realista.",
            duracao: "13:25",
            xp: "+25 XP",
          },
          {
            id: "revisao",
            titulo: "Revisões de progresso",
            descricao: "Como ajustar o rumo toda semana.",
            duracao: "10:10",
            xp: "+20 XP",
          },
        ],
      },
      {
        id: "mod-2",
        titulo: "Hábitos que sustentam",
        descricao: "Mantenha consistência ao longo dos meses.",
        aulas: [
          {
            id: "gatilhos",
            titulo: "Gatilhos e recompensas",
            descricao: "Estruture hábitos fáceis de cumprir.",
            duracao: "09:40",
            xp: "+15 XP",
          },
        ],
      },
    ],
  },
];

export const obterResumoCurso = (curso: Curso) => {
  const totalAulas = curso.modulos.reduce(
    (total, modulo) => total + modulo.aulas.length,
    0
  );
  const aulasConcluidas = curso.modulos.reduce(
    (total, modulo) =>
      total + modulo.aulas.filter((aula) => aula.concluida).length,
    0
  );
  const progresso = totalAulas
    ? Math.round((aulasConcluidas / totalAulas) * 100)
    : 0;

  return { totalAulas, aulasConcluidas, progresso };
};
