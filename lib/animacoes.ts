import type { Variants, Transition } from "framer-motion"

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

export const variantesHover = {
  escala: {
    transition: transicaoRapida,
  },
  escalaComSombra: {
    boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -6px rgba(0, 0, 0, 0.1)",
    transition: transicaoRapida,
  },
} as const

export const variantesClique = {
  escala: {
    transition: transicaoRapida,
  },
} as const

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
