import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import {
  EstadoVazio,
  EstadoVazioTarefas,
  EstadoVazioHabitos,
  EstadoVazioGenerico,
} from '@/componentes/ui/estado-vazio'

describe('EstadoVazio snapshot', () => {
  it('renders base component with title and description', () => {
    const { container } = render(
      <EstadoVazio
        titulo="Sem dados"
        descricao="Nenhum item disponivel."
      />
    )
    expect(container).toMatchSnapshot()
  })

  it('renders EstadoVazioTarefas variant', () => {
    const { container } = render(<EstadoVazioTarefas />)
    expect(container).toMatchSnapshot()
  })

  it('renders EstadoVazioHabitos variant', () => {
    const { container } = render(<EstadoVazioHabitos />)
    expect(container).toMatchSnapshot()
  })

  it('renders EstadoVazioGenerico variant with defaults', () => {
    const { container } = render(<EstadoVazioGenerico />)
    expect(container).toMatchSnapshot()
  })
})
