'use client'

import * as React from 'react'
import {
  DialogoAlerta,
  DialogoAlertaConteudo,
  DialogoAlertaCabecalho,
  DialogoAlertaRodape,
  DialogoAlertaTitulo,
  DialogoAlertaDescricao,
  DialogoAlertaAcao,
  DialogoAlertaCancelar,
} from '@/componentes/ui/dialogo-alerta'
import { estilosBotao } from '@/componentes/ui/botao'
import { cn } from '@/lib/utilidades'

export interface PropsConfirmar {
  aberto: boolean
  onAbertoMudar?: (aberto: boolean) => void
  titulo?: string
  descricao?: string
  textoConfirmar?: string
  textoCancelar?: string
  destrutivo?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

const Confirmar = React.forwardRef<
  React.ElementRef<typeof DialogoAlertaConteudo>,
  PropsConfirmar
>(
  (
    {
      aberto,
      onAbertoMudar,
      titulo = 'Tem certeza?',
      descricao = 'Esta acao nao pode ser desfeita.',
      textoConfirmar = 'Confirmar',
      textoCancelar = 'Cancelar',
      destrutivo = false,
      onConfirmar,
      onCancelar,
    },
    ref
  ) => {
    const handleAbertoMudar = React.useCallback(
      (novoAberto: boolean) => {
        if (!novoAberto) {
          onCancelar()
        }
        onAbertoMudar?.(novoAberto)
      },
      [onCancelar, onAbertoMudar]
    )

    return (
      <DialogoAlerta open={aberto} onOpenChange={handleAbertoMudar}>
        <DialogoAlertaConteudo ref={ref}>
          <DialogoAlertaCabecalho>
            <DialogoAlertaTitulo>{titulo}</DialogoAlertaTitulo>
            <DialogoAlertaDescricao>{descricao}</DialogoAlertaDescricao>
          </DialogoAlertaCabecalho>
          <DialogoAlertaRodape>
            <DialogoAlertaCancelar onClick={onCancelar}>
              {textoCancelar}
            </DialogoAlertaCancelar>
            <DialogoAlertaAcao
              onClick={onConfirmar}
              className={cn(
                destrutivo && estilosBotao({ variant: 'destructive' })
              )}
            >
              {textoConfirmar}
            </DialogoAlertaAcao>
          </DialogoAlertaRodape>
        </DialogoAlertaConteudo>
      </DialogoAlerta>
    )
  }
)

Confirmar.displayName = 'Confirmar'

export interface PropsConfirmarExclusao
  extends Omit<
    PropsConfirmar,
    'titulo' | 'descricao' | 'textoConfirmar' | 'destrutivo'
  > {
  titulo?: string
  descricao?: string
  textoConfirmar?: string
  nomeItem?: string
}

function ConfirmarExclusao({
  titulo = 'Excluir item',
  descricao,
  textoConfirmar = 'Excluir',
  nomeItem,
  ...props
}: PropsConfirmarExclusao) {
  const descricaoFinal =
    descricao ||
    (nomeItem
      ? `Tem certeza que deseja excluir "${nomeItem}"? Esta acao nao pode ser desfeita.`
      : 'Tem certeza que deseja excluir este item? Esta acao nao pode ser desfeita.')

  return (
    <Confirmar
      titulo={titulo}
      descricao={descricaoFinal}
      textoConfirmar={textoConfirmar}
      destrutivo
      {...props}
    />
  )
}

ConfirmarExclusao.displayName = 'ConfirmarExclusao'

export { Confirmar, ConfirmarExclusao }
