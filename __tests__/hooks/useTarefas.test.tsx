import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// Mock the auth provider
const mockUser = { id: 'test-user-123' }
vi.mock('@/lib/providers/auth-provider', () => ({
  useAuth: () => ({
    user: mockUser,
    session: null,
    isLoading: false,
    signOut: vi.fn(),
  }),
}))

// Mock the supabase client
const mockSelect = vi.fn()
const mockFrom = vi.fn(() => ({
  select: mockSelect,
}))
const mockSelectChain = {
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}))

// Import after mocks are set up
const { useTarefas } = await import('@/hooks/useTarefas')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useTarefas (integration)', () => {
  it('fetches tasks for authenticated user', async () => {
    const mockTarefas = [
      {
        id: '1',
        user_id: 'test-user-123',
        titulo: 'Tarefa 1',
        coluna: 'a_fazer',
        prioridade: 'media',
        ordem: 1,
        created_at: '2026-01-01',
      },
      {
        id: '2',
        user_id: 'test-user-123',
        titulo: 'Tarefa 2',
        coluna: 'em_andamento',
        prioridade: 'alta',
        ordem: 2,
        created_at: '2026-01-02',
      },
    ]

    mockSelect.mockReturnValue({
      ...mockSelectChain,
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockTarefas,
            error: null,
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useTarefas(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].titulo).toBe('Tarefa 1')
    expect(result.current.data?.[1].titulo).toBe('Tarefa 2')
  })

  it('handles supabase error', async () => {
    mockSelect.mockReturnValue({
      ...mockSelectChain,
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useTarefas(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toContain('Erro ao buscar tarefas')
  })

  it('includes userId in query key for cache isolation', () => {
    mockSelect.mockReturnValue({
      ...mockSelectChain,
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    })

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    renderHook(() => useTarefas(), { wrapper })

    // Verify the query was registered with userId in the key
    const queries = queryClient.getQueryCache().getAll()
    const tarefasQuery = queries.find((q) =>
      q.queryKey[0] === 'tarefas' && q.queryKey[1] === 'test-user-123'
    )
    expect(tarefasQuery).toBeDefined()
  })
})
