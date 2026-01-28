export const CHAVE_EVENTOS_AGENDA = "agenda-eventos";
export const CHAVE_PENDENCIAS_TAREFAS = "tarefas-pendencias";
export const CHAVE_HABITOS_CATEGORIAS = "habitos-categorias";

export const lerLocalStorage = <T>(chave: string): T | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const valor = window.localStorage.getItem(chave);
    if (!valor) {
      return null;
    }
    return JSON.parse(valor) as T;
  } catch {
    return null;
  }
};

export const salvarLocalStorage = <T>(chave: string, valor: T) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Silencioso para evitar quebra em modo privado.
  }
};
