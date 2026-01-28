export type IntegracaoCalendario = "Google" | "Outlook" | "Manual";

export type StatusEvento = "confirmado" | "pendente" | "foco";

export type EventoAgenda = {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  categoria: string;
  local: string;
  status: StatusEvento;
  calendario: IntegracaoCalendario;
};

export const categoriasAgenda = [
  { id: "reuniao", titulo: "Reunião" },
  { id: "foco", titulo: "Bloco de foco" },
  { id: "aula", titulo: "Aula / Mentoria" },
  { id: "pessoal", titulo: "Pessoal" },
] as const;

export const eventosAgenda: EventoAgenda[] = [
  {
    id: "alinhamento",
    titulo: "Reunião de alinhamento",
    descricao: "Sprint e prioridades da semana.",
    data: "2025-02-14",
    horarioInicio: "09:00",
    horarioFim: "09:45",
    categoria: "Reunião",
    local: "Google Meet",
    status: "confirmado",
    calendario: "Google",
  },
  {
    id: "foco-manha",
    titulo: "Deep work",
    descricao: "Bloco de foco para entregas principais.",
    data: "2025-02-14",
    horarioInicio: "10:00",
    horarioFim: "12:00",
    categoria: "Bloco de foco",
    local: "Sala silenciosa",
    status: "foco",
    calendario: "Manual",
  },
  {
    id: "cliente",
    titulo: "Call com cliente",
    descricao: "Revisão do dashboard e próximos passos.",
    data: "2025-02-14",
    horarioInicio: "15:30",
    horarioFim: "16:15",
    categoria: "Reunião",
    local: "Zoom",
    status: "confirmado",
    calendario: "Outlook",
  },
  {
    id: "mentoria",
    titulo: "Mentoria Builder",
    descricao: "Plano individual e hábitos da semana.",
    data: "2025-02-15",
    horarioInicio: "11:00",
    horarioFim: "11:40",
    categoria: "Aula / Mentoria",
    local: "Google Meet",
    status: "pendente",
    calendario: "Google",
  },
  {
    id: "treino",
    titulo: "Treino funcional",
    descricao: "Cardio + mobilidade.",
    data: "2025-02-15",
    horarioInicio: "18:30",
    horarioFim: "19:20",
    categoria: "Pessoal",
    local: "Academia",
    status: "confirmado",
    calendario: "Manual",
  },
];
