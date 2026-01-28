export type EtapaOnboarding = {
  id: string;
  titulo: string;
  descricao: string;
  videoUrl: string;
  layout: "centro" | "dividido";
  botao?: string;
};

const VIDEO_DEMO =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const etapasOnboarding: EtapaOnboarding[] = [
  {
    id: "bem-vindo",
    titulo: "Bem-vindo ao Builders Performance",
    descricao:
      "Prepare sua rotina para máxima clareza, foco e resultados todos os dias.",
    videoUrl: VIDEO_DEMO,
    layout: "centro",
    botao: "Começar",
  },
  {
    id: "visao-geral",
    titulo: "Visão geral",
    descricao:
      "Entenda como o Builders Performance conecta foco, tarefas, hábitos e agenda em um único fluxo.",
    videoUrl: VIDEO_DEMO,
    layout: "dividido",
  },
  {
    id: "tarefas",
    titulo: "Tarefas e produtividade",
    descricao:
      "Organize prioridades no Kanban, capture pendências e conclua tarefas com clareza.",
    videoUrl: VIDEO_DEMO,
    layout: "dividido",
  },
  {
    id: "foco",
    titulo: "Foco imersivo",
    descricao:
      "Crie sessões de foco, acompanhe o timer e mantenha sua energia no ritmo certo.",
    videoUrl: VIDEO_DEMO,
    layout: "dividido",
  },
  {
    id: "habitos",
    titulo: "Hábitos e metas",
    descricao:
      "Construa consistência diária e acompanhe metas pessoais e profissionais.",
    videoUrl: VIDEO_DEMO,
    layout: "dividido",
  },
  {
    id: "agenda",
    titulo: "Agenda inteligente",
    descricao:
      "Planeje eventos e blocos de foco para manter sua semana sob controle.",
    videoUrl: VIDEO_DEMO,
    layout: "dividido",
  },
  {
    id: "assistente",
    titulo: "Assistant Builder",
    descricao:
      "Tenha um copiloto de produtividade para decisões e prioridades do dia.",
    videoUrl: VIDEO_DEMO,
    layout: "dividido",
  },
  {
    id: "cursos",
    titulo: "Aprendizado contínuo",
    descricao:
      "Acompanhe cursos e aulas para evoluir junto com sua jornada Builder.",
    videoUrl: VIDEO_DEMO,
    layout: "dividido",
  },
];
