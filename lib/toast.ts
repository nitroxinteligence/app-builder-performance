import { toast } from "sonner";

export const notificar = {
  sucesso: (mensagem: string, descricao?: string) =>
    toast.success(mensagem, { description: descricao }),

  erro: (mensagem: string, descricao?: string) =>
    toast.error(mensagem, { description: descricao }),

  info: (mensagem: string, descricao?: string) =>
    toast.info(mensagem, { description: descricao }),

  carregando: (mensagem: string) => toast.loading(mensagem),

  promise: <T>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error: string }
  ) => toast.promise(promise, msgs),

  dispensar: (toastId?: string | number) => toast.dismiss(toastId),
};
