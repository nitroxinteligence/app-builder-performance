import {
  BarChart3,
  BookOpenText,
  ClipboardList,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";

export type AutorMensagem = "assistente" | "usuario";

export type MensagemAssistente = {
  id: string;
  autor: AutorMensagem;
  conteudo: string;
  detalhes?: string[];
  acoes?: string[];
};

export type ConversaAssistente = {
  id: string;
  titulo: string;
  ultimaMensagem: string;
  atualizadoEm: string;
  mensagens: MensagemAssistente[];
};

export type SugestaoRapida = {
  id: string;
  texto: string;
};

export type CartaoSugestao = {
  id: string;
  titulo: string;
  descricao: string;
  itens: string[];
  acao: string;
  icone: LucideIcon;
};

export const sugestoesRapidas: SugestaoRapida[] = [
  { id: "foco-semana", texto: "Como foi meu foco essa semana?" },
  { id: "planejar", texto: "Planejar minhas tarefas de amanhã." },
  { id: "metas", texto: "Revisar progresso nas metas do mês." },
  { id: "deep-work", texto: "Bloquear 9h-11h para deep work." },
];

export const mensagensIniciais: MensagemAssistente[] = [
  {
    id: "m1",
    autor: "assistente",
    conteudo: "Como posso te ajudar hoje, Mateus?",
    detalhes: [
      "Analisar seu foco e produtividade",
      "Planejar suas tarefas e semana",
      "Revisar progresso nas metas",
      "Dar insights sobre seus hábitos",
      "Analisar suas finanças",
    ],
  },
  {
    id: "m2",
    autor: "usuario",
    conteudo: "Como foi meu foco essa semana?",
  },
  {
    id: "m3",
    autor: "assistente",
    conteudo:
      "Essa semana você focou 12h35min — 23% acima da semana passada!",
    detalhes: [
      "Melhor dia: Quarta (3h20min)",
      "Pior dia: Segunda (45min)",
      "Horário mais produtivo: 9h-11h",
    ],
    acoes: ["Sim, criar bloqueio", "Não, obrigado"],
  },
];

export const cartoesSugestao: CartaoSugestao[] = [
  {
    id: "explicar",
    titulo: "Explicar conceitos",
    descricao: "Simplifique temas difíceis rapidamente.",
    itens: ["Resumo objetivo", "Exemplos práticos"],
    acao: "Explique um conceito para mim",
    icone: BookOpenText,
  },
  {
    id: "planejar",
    titulo: "Criar um plano",
    descricao: "Monte um roteiro com etapas claras.",
    itens: ["Checklists", "Prioridades"],
    acao: "Crie um plano de ação para minha semana",
    icone: ClipboardList,
  },
  {
    id: "ideias",
    titulo: "Brainstorm",
    descricao: "Gere ideias criativas rapidamente.",
    itens: ["Alternativas", "Sugestões rápidas"],
    acao: "Me dê ideias para novos hábitos",
    icone: Gamepad2,
  },
  {
    id: "insights",
    titulo: "Insights visuais",
    descricao: "Transforme dados em decisões.",
    itens: ["Tendências", "Alertas"],
    acao: "Analise meu foco da semana",
    icone: BarChart3,
  },
];

export const conversasIniciais: ConversaAssistente[] = [
  {
    id: "c1",
    titulo: "Nova conversa",
    ultimaMensagem: "Vamos começar uma nova conversa.",
    atualizadoEm: "Agora",
    mensagens: [
      {
        id: "c1-1",
        autor: "assistente",
        conteudo: "Olá! Como posso te ajudar hoje?",
      },
    ],
  },
  {
    id: "c2",
    titulo: "Planejamento diário",
    ultimaMensagem: "Quer que eu priorize suas tarefas de amanhã?",
    atualizadoEm: "Ontem",
    mensagens: [
      {
        id: "c2-1",
        autor: "usuario",
        conteudo: "Planejar minhas tarefas de amanhã.",
      },
      {
        id: "c2-2",
        autor: "assistente",
        conteudo:
          "Claro! Posso ordenar por impacto e energia. Quer seguir por prioridade ou por prazo?",
        acoes: ["Prioridade", "Prazo"],
      },
    ],
  },
  {
    id: "c3",
    titulo: "Hábitos e consistência",
    ultimaMensagem: "Seus hábitos tiveram 85% de consistência.",
    atualizadoEm: "2 dias",
    mensagens: [
      {
        id: "c3-1",
        autor: "usuario",
        conteudo: "Como estão meus hábitos?",
      },
      {
        id: "c3-2",
        autor: "assistente",
        conteudo:
          "Você manteve 85% de consistência nos últimos 30 dias. Quer um plano para subir para 90%?",
        acoes: ["Criar plano", "Não agora"],
      },
    ],
  },
];
