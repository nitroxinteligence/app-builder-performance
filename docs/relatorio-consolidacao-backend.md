# Relatório de Consolidação do Backend

**Data:** 2026-01-28
**Projeto:** Builders Performance
**Versão do Schema:** 1.0.0

---

## 1. Resumo Executivo

Este relatório documenta a consolidação completa do schema de banco de dados do Builders Performance. Foram analisados os trabalhos de 3 agentes que criaram migrations separadas com diversos problemas, e um único arquivo SQL consolidado foi criado para substituí-los.

### Resultado Final

- **4 arquivos SQL deletados** (com erros)
- **1 arquivo SQL consolidado** criado com todas as tabelas
- **9 tabelas** implementadas cobrindo todas as funcionalidades
- **10 funções PostgreSQL** para lógica de negócio
- **2 views** para consultas comuns
- **RLS completo** em todas as tabelas

---

## 2. Análise dos Problemas Encontrados

### 2.1 Conflito de Nomenclatura

| Arquivo | Nomenclatura | Problema |
|---------|--------------|----------|
| `types/database.ts` | Português (`usuarios`, `tarefas`, `pendencias`) | Incompatível com migrations |
| `lib/supabase/types.ts` | Inglês (`users`, `tasks`, `focus_sessions`) | Correto |
| `docs/schema-referencia.md` | Português | Incompatível |
| Migrations 001-003 | Inglês | Correto |

**Decisão:** Mantido inglês como padrão (consistente com Supabase).

### 2.2 UUIDs Inválidos

O arquivo `docs/schema-referencia.md` usava UUIDs em formato texto inválido:

```sql
-- ERRADO (schema-referencia.md)
INSERT INTO usuarios (id, ...) VALUES ('user-mock-001', ...);

-- CORRETO (migration consolidada)
INSERT INTO users (id, ...) VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, ...);
```

### 2.3 Tabelas Faltantes

A página `/habitos` não tinha nenhuma tabela implementada nas migrations anteriores. Os dados estavam todos mockados em `app/habitos/dados-habitos.ts`.

**Tabelas criadas:**
- `habit_categories` - Categorias de hábitos
- `habits` - Hábitos diários
- `habit_checks` - Marcações diárias
- `goals` - Metas do ano
- `development_objectives` - Plano de desenvolvimento individual

### 2.4 Tabela `pending_items` Ausente

A interface `Pendencia` em `types/database.ts` não tinha tabela correspondente nas migrations.

### 2.5 Duplicação de Código

Havia código duplicado entre:
- `000_full_migration.sql`
- `001_create_users_table.sql`
- `002_create_tasks_table.sql`
- `003_create_focus_sessions_table.sql`

---

## 3. Arquivos Afetados

### 3.1 Arquivos Deletados

| Arquivo | Motivo da Remoção |
|---------|-------------------|
| `supabase/migrations/000_full_migration.sql` | Duplicado, substituído |
| `supabase/migrations/001_create_users_table.sql` | Parcial, substituído |
| `supabase/migrations/002_create_tasks_table.sql` | Parcial, substituído |
| `supabase/migrations/003_create_focus_sessions_table.sql` | Parcial, substituído |

### 3.2 Arquivo Criado

| Arquivo | Descrição |
|---------|-----------|
| `supabase/migrations/000_consolidated_schema.sql` | Schema completo e consolidado |

---

## 4. Schema Final do Banco de Dados

### 4.1 Diagrama de Relacionamentos

```
┌─────────────────────────────────────────────────────────────────────┐
│                              USERS                                   │
│  (id, email, name, total_xp, level, streaks, etc.)                  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│    TASKS      │     │ FOCUS_SESSIONS  │     │  PENDING_ITEMS      │
│  (Kanban)     │     │    (Timer)      │     │  (Pendências)       │
└───────┬───────┘     └─────────────────┘     └─────────────────────┘
        │
        └────────────────┐
                         ▼
               ┌─────────────────┐
               │ FOCUS_SESSIONS  │
               │   (task_id FK)  │
               └─────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                              USERS                                   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────────┐   ┌───────────────┐   ┌─────────────────────────┐
│ HABIT_CATEGORIES  │   │    GOALS      │   │ DEVELOPMENT_OBJECTIVES  │
│   (Categorias)    │   │ (Metas Ano)   │   │  (Plano Individual)     │
└─────────┬─────────┘   └───────────────┘   └─────────────────────────┘
          │
          ▼
┌─────────────────┐
│    HABITS       │
│  (Hábitos)      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  HABIT_CHECKS   │
│ (Marcações)     │
└─────────────────┘
```

### 4.2 Tabelas por Página

| Página | Tabelas |
|--------|---------|
| `/tarefas` | `tasks`, `pending_items` |
| `/foco` | `focus_sessions`, `tasks` (FK opcional) |
| `/habitos` | `habit_categories`, `habits`, `habit_checks`, `goals`, `development_objectives` |
| Todas | `users` |

### 4.3 Enums Criados

| Enum | Valores | Uso |
|------|---------|-----|
| `task_priority` | baixa, media, alta, urgente | Prioridade de tarefas |
| `task_status` | pendente, em_progresso, em_revisao, concluido | Status de tarefas |
| `kanban_column` | backlog, a_fazer, em_andamento, concluido | Colunas do Kanban |
| `focus_mode` | pomodoro, deep_work, flowtime, custom | Modos de foco |
| `session_status` | active, paused, completed, cancelled | Status de sessão |
| `goal_status` | a_fazer, em_andamento, concluido | Status de metas |
| `objective_category` | pessoal, profissional, estudos, saude, financeiro | Categorias de objetivos |

---

## 5. Funções PostgreSQL Implementadas

### 5.1 Sistema de XP e Níveis

| Função | Descrição | Retorno |
|--------|-----------|---------|
| `calculate_level(xp)` | Calcula nível baseado no XP | INTEGER |
| `add_user_xp(user_id, xp)` | Adiciona XP e atualiza nível | TABLE(new_total_xp, new_level, level_up) |

**Fórmula de Nível:**
```
level = floor(sqrt(xp / 100)) + 1

Level 1:  0-99 XP
Level 2:  100-399 XP
Level 3:  400-899 XP
Level 4:  900-1599 XP
...
```

### 5.2 Sistema de Foco

| Função | Descrição |
|--------|-----------|
| `calculate_focus_xp(seconds)` | Calcula XP (1 XP/minuto) |
| `add_task_time(task_id, minutes)` | Adiciona tempo à tarefa |
| `complete_focus_session(...)` | Finaliza sessão, dá XP, atualiza tarefa |
| `get_focus_stats(user_id)` | Estatísticas de foco do usuário |
| `cancel_active_sessions(user_id)` | Cancela sessões ativas |

### 5.3 Sistema de Hábitos

| Função | Descrição |
|--------|-----------|
| `check_habit(habit_id, user_id, date)` | Marca hábito como feito, calcula streak, dá XP |
| `get_habit_streak(habit_id)` | Retorna streak atual do hábito |

**Bônus de Streak:**
```
XP = base_xp + min(base_xp, base_xp * (streak - 1) / 10)

Exemplo (base 15 XP):
- Streak 1:  15 XP
- Streak 5:  15 + 6 = 21 XP
- Streak 10: 15 + 13 = 28 XP
- Streak 11+: 15 + 15 = 30 XP (máximo)
```

---

## 6. Row Level Security (RLS)

### 6.1 Políticas Implementadas

Todas as tabelas seguem o mesmo padrão de políticas:

| Política | Permissão | Condição |
|----------|-----------|----------|
| `*_select_own` | SELECT | `auth.uid() = user_id` |
| `*_insert_own` | INSERT | `auth.uid() = user_id` |
| `*_update_own` | UPDATE | `auth.uid() = user_id` |
| `*_delete_own` | DELETE | `auth.uid() = user_id` |
| `*_service_role_all` | ALL | `true` (apenas service_role) |

### 6.2 Índices para Performance RLS

Índices criados nas colunas `user_id` de todas as tabelas para otimizar as políticas RLS:

```sql
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
-- ... etc
```

---

## 7. Seed Data para Desenvolvimento

### 7.1 Usuário Mock

| Campo | Valor |
|-------|-------|
| ID | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| Email | `mock@buildersperformance.com` |
| Nome | `Mateus Pereira` |
| XP Total | 2150 |
| Nível | 7 |
| Streak Atual | 12 dias |
| Maior Streak | 28 dias |

### 7.2 Dados de Exemplo

| Tabela | Quantidade | Descrição |
|--------|------------|-----------|
| `tasks` | 5 | Tarefas do Kanban em diferentes colunas |
| `pending_items` | 3 | Pendências rápidas |
| `habit_categories` | 3 | Saúde, Produtividade, Bem-estar |
| `habits` | 8 | Hábitos diários com streaks variados |
| `goals` | 4 | Metas do ano (1 concluída) |
| `development_objectives` | 4 | Objetivos de desenvolvimento |

---

## 8. Views Criadas

### 8.1 `focus_sessions_with_task`

Combina sessões de foco com informações da tarefa vinculada:

```sql
SELECT
  fs.*,
  t.titulo as task_titulo,
  t.prioridade as task_prioridade,
  t.coluna as task_coluna
FROM focus_sessions fs
LEFT JOIN tasks t ON fs.task_id = t.id;
```

### 8.2 `habits_today`

Mostra hábitos ativos com status de conclusão do dia atual:

```sql
SELECT
  h.*,
  hc.titulo as category_titulo,
  hc.icone as category_icone,
  hc.cor as category_cor,
  CASE WHEN hcheck.id IS NOT NULL THEN true ELSE false END as feito_hoje
FROM habits h
LEFT JOIN habit_categories hc ON h.category_id = hc.id
LEFT JOIN habit_checks hcheck ON h.id = hcheck.habit_id AND hcheck.check_date = CURRENT_DATE
WHERE h.ativo = true;
```

---

## 9. Próximos Passos

### 9.1 Imediatos (Para rodar o backend)

1. **Executar migration no Supabase:**
   ```bash
   # No SQL Editor do Supabase Dashboard
   # Copie e cole todo o conteúdo de:
   supabase/migrations/000_consolidated_schema.sql
   ```

2. **Verificar variáveis de ambiente:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xzonhnpjlcinsknqyyap.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   MOCK_USER_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
   ```

### 9.2 Curto Prazo

| Tarefa | Prioridade | Descrição |
|--------|------------|-----------|
| Atualizar `types/database.ts` | Alta | Sincronizar com schema em inglês |
| Criar hooks para hábitos | Alta | `useHabits`, `useHabitCategories`, `useGoals` |
| Criar Server Actions para hábitos | Alta | CRUD completo para `/habitos` |
| Integrar UI de hábitos | Média | Remover dados mockados |

### 9.3 Médio Prazo

| Tarefa | Descrição |
|--------|-----------|
| Implementar auth real | Substituir mock user por Supabase Auth |
| Adicionar Realtime | Sincronização live de dados |
| Implementar streaks automáticos | Cron job para resetar streaks quebrados |
| Sistema de notificações | Lembretes de hábitos |

---

## 10. Verificação do Schema

### 10.1 Testar Localmente

```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

-- Verificar usuário mock
SELECT * FROM users WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Verificar hábitos
SELECT h.titulo, hc.titulo as categoria, h.streak_atual
FROM habits h
JOIN habit_categories hc ON h.category_id = hc.id
WHERE h.user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Testar função de XP
SELECT * FROM add_user_xp('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 50);

-- Testar estatísticas de foco
SELECT * FROM get_focus_stats('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
```

### 10.2 Resultado Esperado

```
 table_name
---------------------------
 development_objectives
 focus_sessions
 goals
 habit_categories
 habit_checks
 habits
 pending_items
 tasks
 users
(9 rows)
```

---

## 11. Conclusão

A consolidação foi concluída com sucesso. O schema agora:

- Suporta **todas as 3 páginas** (`/tarefas`, `/foco`, `/habitos`)
- Usa **UUIDs válidos** com `gen_random_uuid()`
- Tem **RLS completo** para segurança multi-tenant
- Inclui **funções de negócio** para XP, níveis, streaks
- É **idempotente** (pode ser executado múltiplas vezes)
- Tem **seed data** para desenvolvimento

### Checklist Final

- [x] Analisar problemas nas migrations existentes
- [x] Criar migration consolidada única
- [x] Deletar migrations antigas com erros
- [x] Gerar relatório de consolidação
- [x] Incluir todas as tabelas para `/tarefas`
- [x] Incluir todas as tabelas para `/foco`
- [x] Incluir todas as tabelas para `/habitos`
- [x] Criar funções PostgreSQL necessárias
- [x] Criar views úteis
- [x] Configurar RLS em todas as tabelas
- [x] Adicionar índices para performance
- [x] Incluir seed data de desenvolvimento

---

**Arquivo de migration:** `supabase/migrations/000_consolidated_schema.sql`
**Linhas de código:** ~800 linhas SQL
**Tabelas:** 9
**Funções:** 10
**Views:** 2
**Políticas RLS:** 45
