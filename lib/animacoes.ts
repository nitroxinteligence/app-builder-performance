import type { Variants, Transition } from "framer-motion"

// ---------------------------------------------------------------------------
// Transicoes base
// ---------------------------------------------------------------------------

export const transicaoPadrao: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
}

export const transicaoRapida: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
}

export const transicaoSuave: Transition = {
  duration: 0.2,
  ease: "easeOut",
}

export const transicaoMedia: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
}

export const transicaoLenta: Transition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1],
}

// ---------------------------------------------------------------------------
// Hover & Clique
// ---------------------------------------------------------------------------

export const variantesHover = {
  escala: {
    transition: transicaoRapida,
  },
  escalaComSombra: {
    transition: transicaoRapida,
  },
} as const

export const variantesClique = {
  escala: {
    transition: transicaoRapida,
  },
} as const

// ---------------------------------------------------------------------------
// Entrada basica (fade-in + slide-up)
// ---------------------------------------------------------------------------

export const variantesEntrada: Variants = {
  oculto: {
    opacity: 0,
    y: 8,
  },
  visivel: {
    opacity: 1,
    y: 0,
    transition: transicaoSuave,
  },
}

export const variantesFadeIn: Variants = {
  oculto: { opacity: 0 },
  visivel: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
}

// ---------------------------------------------------------------------------
// Pagina: container com stagger nos filhos
// ---------------------------------------------------------------------------

export const variantesPagina: Variants = {
  oculto: { opacity: 0 },
  visivel: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.06,
    },
  },
}

export const variantesFilhoPagina: Variants = {
  oculto: { opacity: 0, y: 12 },
  visivel: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  },
}

// ---------------------------------------------------------------------------
// Lista: container com stagger para itens
// ---------------------------------------------------------------------------

export const variantesLista: Variants = {
  oculto: { opacity: 0 },
  visivel: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export const variantesItemLista: Variants = {
  oculto: { opacity: 0, x: -8 },
  visivel: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
}

// ---------------------------------------------------------------------------
// Escala (para badges, conquistas, celebracoes)
// ---------------------------------------------------------------------------

export const variantesEscala: Variants = {
  oculto: { opacity: 0, scale: 0.8 },
  visivel: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 20,
    },
  },
}

// ---------------------------------------------------------------------------
// Notificacao XP (slide-in de cima + fade-out)
// ---------------------------------------------------------------------------

export const variantesNotificacaoXp: Variants = {
  oculto: { opacity: 0, y: -20, scale: 0.9 },
  visivel: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  saindo: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.2, ease: "easeIn" },
  },
}

// ---------------------------------------------------------------------------
// Level Up (celebracao com bounce)
// ---------------------------------------------------------------------------

export const variantesLevelUp: Variants = {
  oculto: { opacity: 0, scale: 0.5 },
  visivel: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
    },
  },
}

// ---------------------------------------------------------------------------
// Streak Fogo (pulso sutil)
// ---------------------------------------------------------------------------

export const variantesStreakFogo: Variants = {
  oculto: { opacity: 0, scale: 0.8 },
  visivel: {
    opacity: 1,
    scale: [1, 1.15, 1],
    transition: {
      scale: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1.2,
        ease: "easeInOut",
      },
      opacity: { duration: 0.3 },
    },
  },
}

// ---------------------------------------------------------------------------
// Badge Unlock (pop-in com rotacao)
// ---------------------------------------------------------------------------

export const variantesBadgeUnlock: Variants = {
  oculto: { opacity: 0, scale: 0, rotate: -30 },
  visivel: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
}

// ---------------------------------------------------------------------------
// Shimmer pulse (para skeletons aprimorados)
// ---------------------------------------------------------------------------

export const variantesShimmer: Variants = {
  oculto: { opacity: 0.5 },
  visivel: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}
