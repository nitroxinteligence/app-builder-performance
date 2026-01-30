# Builders Performance - Documentacao do Schema do Banco de Dados

**Versao:** 2.0.0
**Data:** 2026-01-29
**Banco:** PostgreSQL 17 (Supabase)
**Migrations:** `supabase/migrations/implementados/`

---

## Indice

1. [Enums](#enums)
2. [Tabelas](#tabelas)
3. [Views](#views)
4. [Funcoes](#funcoes)
5. [Triggers](#triggers)
6. [Indexes](#indexes)
7. [Politicas RLS](#politicas-rls)
8. [Diagrama de Relacionamentos](#diagrama-de-relacionamentos)
9. [Historico de Migrations](#historico-de-migrations)

---

## Enums

### `task_priority`
Prioridade das tarefas.
| Valor     | Descricao       |
|-----------|-----------------|
| `baixa`   | Prioridade baixa |
| `media`   | Prioridade media |
| `alta`    | Prioridade alta  |
| `urgente` | Urgente          |

### `task_status`
Status da tarefa.
| Valor          | Descricao       |
|----------------|-----------------|
| `pendente`     | Pendente         |
| `em_progresso` | Em progresso     |
| `em_revisao`   | Em revisao       |
| `concluido`    | Concluido        |

### `kanban_column`
Colunas do quadro Kanban.
| Valor          | Descricao     |
|----------------|---------------|
| `backlog`      | Backlog       |
| `a_fazer`      | A fazer       |
| `em_andamento` | Em andamento  |
| `concluido`    | Concluido     |

### `focus_mode`
Modos de foco disponiveis.
| Valor       | Descricao  |
|-------------|------------|
| `pomodoro`  | Pomodoro   |
| `deep_work` | Deep Work  |
| `flowtime`  | Flowtime   |
| `custom`    | Custom     |

### `session_status`
Status da sessao de foco.
| Valor       | Descricao  |
|-------------|------------|
| `active`    | Ativa      |
| `paused`    | Pausada    |
| `completed` | Completa   |
| `cancelled` | Cancelada  |

### `goal_status`
Status de metas (usado apenas na tabela `objectives` apos migration 005).
| Valor          | Descricao    |
|----------------|--------------|
| `a_fazer`      | A fazer      |
| `em_andamento` | Em andamento |
| `concluido`    | Concluido    |

**Nota:** A tabela `goals` teve o campo `status` alterado para TEXT na migration 005, com valores: `nao_iniciada`, `em_andamento`, `pausada`, `atrasada`, `concluida`.

### `objective_category`
Categorias de objetivos de desenvolvimento.
| Valor          | Descricao     |
|----------------|---------------|
| `pessoal`      | Pessoal       |
| `profissional` | Profissional  |
| `estudos`      | Estudos       |
| `saude`        | Saude         |
| `financeiro`   | Financeiro    |

### `event_status`
Status de eventos da agenda.
| Valor        | Descricao  |
|--------------|------------|
| `confirmado` | Confirmado |
| `pendente`   | Pendente   |
| `foco`       | Foco       |

### `calendar_integration`
Fonte de integracao do calendario.
| Valor     | Descricao |
|-----------|-----------|
| `Manual`  | Manual    |
| `Google`  | Google    |
| `Outlook` | Outlook   |

### `course_level`
Nivel do curso.
| Valor           | Descricao     |
|-----------------|---------------|
| `iniciante`     | Iniciante     |
| `intermediario` | Intermediario |
| `avancado`      | Avancado      |

### `course_status`
Status de publicacao do curso.
| Valor       | Descricao |
|-------------|-----------|
| `rascunho`  | Rascunho  |
| `publicado` | Publicado |
| `arquivado` | Arquivado |

---

## Tabelas

### `users` - Usuarios
Tabela principal de usuarios do sistema, sincronizada com `auth.users` via trigger.

| Coluna           | Tipo         | Nullable | Default             | Descricao                              |
|------------------|--------------|----------|---------------------|----------------------------------------|
| `id`             | UUID         | NOT NULL | `gen_random_uuid()` | PK, sincronizado com auth.users.id     |
| `email`          | TEXT         | NOT NULL | -                   | Email unico do usuario                 |
| `name`           | TEXT         | NOT NULL | -                   | Nome do usuario                        |
| `avatar_url`     | TEXT         | NULL     | -                   | URL do avatar                          |
| `total_xp`       | INTEGER      | NOT NULL | 0                   | Total de XP acumulado                  |
| `level`          | INTEGER      | NOT NULL | 1                   | Nivel atual (calculado via XP)         |
| `streak_shields` | INTEGER      | NOT NULL | 2                   | Protecoes de streak (max 2/semana)     |
| `current_streak` | INTEGER      | NOT NULL | 0                   | Streak atual em dias                   |
| `longest_streak` | INTEGER      | NOT NULL | 0                   | Maior streak historico                 |
| `created_at`     | TIMESTAMPTZ  | NOT NULL | `NOW()`             | Data de criacao                        |
| `updated_at`     | TIMESTAMPTZ  | NOT NULL | `NOW()`             | Ultima atualizacao (trigger)           |

**Constraints:** PK(id), UNIQUE(email)

---

### `tasks` - Tarefas do Kanban
Tarefas do quadro Kanban na pagina `/tarefas`.

| Coluna            | Tipo            | Nullable | Default             | Descricao                          |
|-------------------|-----------------|----------|---------------------|------------------------------------|
| `id`              | UUID            | NOT NULL | `gen_random_uuid()` | PK                                 |
| `user_id`         | UUID            | NOT NULL | -                   | FK -> users(id) ON DELETE CASCADE  |
| `titulo`          | TEXT            | NOT NULL | -                   | Titulo da tarefa                   |
| `descricao`       | TEXT            | NULL     | -                   | Descricao opcional                 |
| `prioridade`      | task_priority   | NOT NULL | `'media'`           | Prioridade da tarefa               |
| `status`          | task_status     | NOT NULL | `'pendente'`        | Status da tarefa                   |
| `coluna`          | kanban_column   | NOT NULL | `'backlog'`         | Coluna atual no Kanban             |
| `data_limite`     | TIMESTAMPTZ     | NULL     | -                   | Data limite                        |
| `xp_recompensa`   | INTEGER         | NOT NULL | 10                  | XP ganho ao completar              |
| `projeto_id`      | UUID            | NULL     | -                   | FK para projetos (futuro)          |
| `tags`            | TEXT[]          | -        | `'{}'`              | Tags da tarefa                     |
| `estimativa_tempo` | INTEGER        | NULL     | -                   | Estimativa em minutos              |
| `tempo_gasto`     | INTEGER         | NOT NULL | 0                   | Tempo gasto em minutos             |
| `ordem`           | INTEGER         | NOT NULL | 0                   | Ordem no Kanban                    |
| `concluida_em`    | TIMESTAMPTZ     | NULL     | -                   | Data de conclusao                  |
| `created_at`      | TIMESTAMPTZ     | NOT NULL | `NOW()`             | Data de criacao                    |
| `updated_at`      | TIMESTAMPTZ     | NOT NULL | `NOW()`             | Ultima atualizacao (trigger)       |

**Constraints:** PK(id), FK(user_id -> users.id CASCADE)

---

### `pending_items` - Pendencias
Pendencias rapidas que podem virar tarefas no Kanban.

| Coluna            | Tipo            | Nullable | Default             | Descricao                          |
|-------------------|-----------------|----------|---------------------|------------------------------------|
| `id`              | UUID            | NOT NULL | `gen_random_uuid()` | PK                                 |
| `user_id`         | UUID            | NOT NULL | -                   | FK -> users(id) ON DELETE CASCADE  |
| `titulo`          | TEXT            | NOT NULL | -                   | Titulo da pendencia                |
| `descricao`       | TEXT            | NULL     | -                   | Descricao opcional                 |
| `prioridade`      | task_priority   | NOT NULL | `'media'`           | Prioridade                         |
| `categoria`       | TEXT            | NULL     | -                   | Categoria livre                    |
| `prazo`           | TEXT            | NULL     | -                   | Prazo em texto (Hoje, Amanha...)   |
| `data_vencimento` | TIMESTAMPTZ     | NULL     | -                   | Data de vencimento                 |
| `created_at`      | TIMESTAMPTZ     | NOT NULL | `NOW()`             | Data de criacao                    |
| `updated_at`      | TIMESTAMPTZ     | NOT NULL | `NOW()`             | Ultima atualizacao (trigger)       |

**Constraints:** PK(id), FK(user_id -> users.id CASCADE)

---

### `focus_sessions` - Sessoes de Foco
Sessoes de foco do timer na pagina `/foco`.

| Coluna             | Tipo            | Nullable | Default             | Descricao                          |
|--------------------|-----------------|----------|---------------------|------------------------------------|
| `id`               | UUID            | NOT NULL | `gen_random_uuid()` | PK                                 |
| `user_id`          | UUID            | NOT NULL | -                   | FK -> users(id) ON DELETE CASCADE  |
| `task_id`          | UUID            | NULL     | -                   | FK -> tasks(id) ON DELETE SET NULL |
| `modo`             | focus_mode      | NOT NULL | -                   | Modo de foco usado                 |
| `duracao_planejada` | INTEGER        | NOT NULL | -                   | Duracao planejada em segundos      |
| `duracao_real`     | INTEGER         | NOT NULL | 0                   | Duracao real em segundos           |
| `xp_ganho`         | INTEGER         | NOT NULL | 0                   | XP ganho na sessao                 |
| `started_at`       | TIMESTAMPTZ     | NOT NULL | `NOW()`             | Inicio da sessao                   |
| `ended_at`         | TIMESTAMPTZ     | NULL     | -                   | Fim da sessao                      |
| `pausas`           | JSONB           | NOT NULL | `'[]'`              | Array de pausas (JSON)             |
| `status`           | session_status  | NOT NULL | `'active'`          | Status da sessao                   |
| `created_at`       | TIMESTAMPTZ     | NOT NULL | `NOW()`             | Data de criacao                    |

**Constraints:** PK(id), FK(user_id -> users.id CASCADE), FK(task_id -> tasks.id SET NULL)

**Nota:** Esta tabela NAO possui `updated_at`.

---

### `habit_categories` - Categorias de Habitos
Categorias para agrupar habitos (Saude, Produtividade, etc).

| Coluna       | Tipo        | Nullable | Default             | Descricao                          |
|--------------|-------------|----------|---------------------|------------------------------------|
| `id`         | UUID        | NOT NULL | `gen_random_uuid()` | PK                                 |
| `user_id`    | UUID        | NOT NULL | -                   | FK -> users(id) ON DELETE CASCADE  |
| `nome`       | TEXT        | NOT NULL | -                   | Nome da categoria (renomeado de `titulo` na migration 006) |
| `descricao`  | TEXT        | NULL     | -                   | Descricao (adicionado na migration 006)                    |
| `icone`      | TEXT        | NOT NULL | `'circle'`          | Icone da categoria                 |
| `cor`        | TEXT        | -        | `'#6366f1'`         | Cor da categoria                   |
| `ordem`      | TEXT        | NOT NULL | `'0'`               | Ordem (alterado de INTEGER para TEXT na migration 006)     |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()`             | Data de criacao                    |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()`             | Ultima atualizacao (trigger)       |

**Constraints:** PK(id), FK(user_id -> users.id CASCADE)

---

### `habits` - Habitos
Habitos diarios/recorrentes do usuario na pagina `/habitos`.

| Coluna            | Tipo        | Nullable | Default             | Descricao                          |
|-------------------|-------------|----------|---------------------|------------------------------------|
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                                 |
| `user_id`         | UUID        | NOT NULL | -                   | FK -> users(id) ON DELETE CASCADE  |
| `categoria_id`    | UUID        | NULL     | -                   | FK -> habit_categories(id) SET NULL (renomeado de `category_id`) |
| `titulo`          | TEXT        | NOT NULL | -                   | Titulo do habito                   |
| `descricao`       | TEXT        | NULL     | -                   | Descricao                          |
| `icone`           | TEXT        | NOT NULL | `'check'`           | Icone do habito (migration 006)    |
| `cor`             | TEXT        | NULL     | -                   | Cor do habito (migration 006)      |
| `dificuldade`     | TEXT        | NOT NULL | `'medio'`           | Dificuldade (migration 006)        |
| `frequencia`      | TEXT        | NOT NULL | `'diario'`          | Frequencia do habito               |
| `dias_semana`     | INTEGER[]   | -        | `'{1,2,3,4,5,6,0}'` | Dias da semana (0=dom, 6=sab)     |
| `horario_lembrete` | TIME       | NULL     | -                   | Horario do lembrete                |
| `xp_por_check`   | INTEGER     | NOT NULL | 15                  | XP por marcacao                    |
| `streak_atual`    | INTEGER     | NOT NULL | 0                   | Streak atual                       |
| `maior_streak`    | INTEGER     | NOT NULL | 0                   | Maior streak historico             |
| `total_conclusoes` | INTEGER    | NOT NULL | 0                   | Total de conclusoes (migration 006)|
| `objetivo_id`     | UUID        | NULL     | -                   | FK para objectives (migration 006) |
| `ativo`           | BOOLEAN     | NOT NULL | `true`              | Habito ativo                       |
| `ordem`           | TEXT        | NOT NULL | `'0'`               | Ordem (alterado de INTEGER para TEXT na migration 006) |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `NOW()`             | Data de criacao                    |
| `updated_at`      | TIMESTAMPTZ | NOT NULL | `NOW()`             | Ultima atualizacao (trigger)       |

**Constraints:** PK(id), FK(user_id -> users.id CASCADE), FK(categoria_id -> habit_categories.id SET NULL)

---

### `habit_history` - Historico de Habitos
Registro de habitos completados por dia (renomeado de `habit_checks` na migration 004).

| Coluna       | Tipo        | Nullable | Default             | Descricao                          |
|--------------|-------------|----------|---------------------|------------------------------------|
| `id`         | UUID        | NOT NULL | `gen_random_uuid()` | PK                                 |
| `habito_id`  | UUID        | NOT NULL | -                   | FK -> habits(id) ON DELETE CASCADE (renomeado de `habit_id`) |
| `user_id`    | UUID        | NOT NULL | -                   | FK -> users(id) ON DELETE CASCADE  |
| `data`       | DATE        | NOT NULL | `CURRENT_DATE`      | Data do check (renomeado de `check_date`) |
| `concluido`  | BOOLEAN     | NOT NULL | `true`              | Se foi concluido (migration 004)   |
| `horario`    | TIME        | NULL     | -                   | Horario (migration 004)            |
| `xp_ganho`   | INTEGER     | NOT NULL | 0                   | XP ganho                           |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()`             | Data de criacao                    |

**Constraints:** PK(id), UNIQUE(habito_id, data), FK(habito_id -> habits.id CASCADE), FK(user_id -> users.id CASCADE)

**Nota:** Esta tabela NAO possui `updated_at`.

---

### `goals` - Metas
Metas prioritarias do ano na pagina `/habitos` - aba Metas.

| Coluna            | Tipo        | Nullable | Default                         | Descricao                          |
|-------------------|-------------|----------|---------------------------------|------------------------------------|
| `id`              | UUID        | NOT NULL | `gen_random_uuid()`             | PK                                 |
| `user_id`         | UUID        | NOT NULL | -                               | FK -> users(id) ON DELETE CASCADE  |
| `titulo`          | TEXT        | NOT NULL | -                               | Titulo da meta                     |
| `descricao`       | TEXT        | NULL     | -                               | Descricao                          |
| `progresso_atual` | INTEGER     | NOT NULL | 0                               | Progresso atual                    |
| `progresso_total` | INTEGER     | NOT NULL | 100                             | Progresso total                    |
| `unidade`         | TEXT        | -        | `'unidades'`                    | Unidade de medida                  |
| `status`          | TEXT        | NOT NULL | `'nao_iniciada'`                | Status (alterado de enum para TEXT na migration 005) |
| `prazo`           | TEXT        | NULL     | -                               | Prazo em texto                     |
| `data_limite`     | TIMESTAMPTZ | NULL     | -                               | Data limite                        |
| `xp_recompensa`   | INTEGER     | NOT NULL | 100                             | XP ao concluir                     |
| `concluida_em`    | TIMESTAMPTZ | NULL     | -                               | Data de conclusao                  |
| `categoria`       | TEXT        | NULL     | -                               | Categoria (migration 005)          |
| `cor`             | TEXT        | NOT NULL | `'#6366f1'`                     | Cor (migration 005)                |
| `icone`           | TEXT        | NOT NULL | `'target'`                      | Icone (migration 005)              |
| `tags`            | TEXT[]      | -        | `'{}'`                          | Tags (migration 005)               |
| `ano`             | INTEGER     | NOT NULL | `EXTRACT(YEAR FROM NOW())`      | Ano (migration 005)                |
| `trimestre`       | INTEGER     | NULL     | -                               | Trimestre (migration 005)          |
| `data_inicio`     | TIMESTAMPTZ | NULL     | -                               | Data inicio (migration 005)        |
| `data_fim`        | TIMESTAMPTZ | NULL     | -                               | Data fim (migration 005)           |
| `prioridade`      | TEXT        | NOT NULL | `'media'`                       | Prioridade (migration 005)         |
| `visibilidade`    | TEXT        | NOT NULL | `'privada'`                     | Visibilidade (migration 005)       |
| `notas_progresso` | TEXT        | NULL     | -                               | Notas de progresso (migration 005) |
| `ordem`           | TEXT        | NOT NULL | `'0'`                           | Ordem (migration 005)              |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `NOW()`                         | Data de criacao                    |
| `updated_at`      | TIMESTAMPTZ | NOT NULL | `NOW()`                         | Ultima atualizacao (trigger)       |

**Constraints:** PK(id), FK(user_id -> users.id CASCADE)

---

### `goal_milestones` - Marcos de Metas
Marcos (milestones) dentro de cada meta.

| Coluna           | Tipo        | Nullable | Default             | Descricao                          |
|------------------|-------------|----------|---------------------|------------------------------------|
| `id`             | UUID        | NOT NULL | `gen_random_uuid()` | PK                                 |
| `meta_id`        | UUID        | NOT NULL | -                   | FK -> goals(id) ON DELETE CASCADE  |
| `titulo`         | TEXT        | NOT NULL | -                   | Titulo do marco                    |
| `descricao`      | TEXT        | NULL     | -                   | Descricao                          |
| `concluido`      | BOOLEAN     | NOT NULL | `false`             | Se foi concluido                   |
| `data_conclusao` | TIMESTAMPTZ | NULL     | -                   | Data de conclusao                  |
| `ordem`          | INTEGER     | NOT NULL | 0                   | Ordem de exibicao                  |
| `created_at`     | TIMESTAMPTZ | NOT NULL | `NOW()`             | Data de criacao                    |
| `updated_at`     | TIMESTAMPTZ | NOT NULL | `NOW()`             | Ultima atualizacao (trigger)       |

**Constraints:** PK(id), FK(meta_id -> goals.id CASCADE)

---

### `objectives` - Objetivos de Desenvolvimento
Objetivos de desenvolvimento individual (renomeado de `development_objectives` na migration 004).

| Coluna            | Tipo              | Nullable | Default             | Descricao                          |
|-------------------|-------------------|----------|---------------------|------------------------------------|
| `id`              | UUID              | NOT NULL | `gen_random_uuid()` | PK                                 |
| `user_id`         | UUID              | NOT NULL | -                   | FK -> users(id) ON DELETE CASCADE  |
| `titulo`          | TEXT              | NOT NULL | -                   | Titulo do objetivo                 |
| `descricao`       | TEXT              | NULL     | -                   | Descricao                          |
| `categoria`       | objective_category| NOT NULL | `'pessoal'`         | Categoria (mantido)                |
| `progresso_atual` | INTEGER           | NOT NULL | 0                   | Progresso atual                    |
| `progresso_total` | INTEGER           | NOT NULL | 10                  | Progresso total                    |
| `status`          | goal_status       | NOT NULL | `'a_fazer'`         | Status do objetivo                 |
| `habitos_chave`   | TEXT[]            | -        | `'{}'`              | Habitos chave (mantido)            |
| `xp_recompensa`   | INTEGER           | NOT NULL | 50                  | XP ao concluir                     |
| `concluida_em`    | TIMESTAMPTZ       | NULL     | -                   | Data de conclusao                  |
| `cor`             | TEXT              | NULL     | -                   | Cor (migration 004)                |
| `tags`            | TEXT[]            | -        | `'{}'`              | Tags (migration 004)               |
| `data_inicio`     | TIMESTAMPTZ       | NULL     | -                   | Data inicio (migration 004)        |
| `data_fim`        | TIMESTAMPTZ       | NULL     | -                   | Data fim (migration 004)           |
| `prioridade`      | TEXT              | NOT NULL | `'media'`           | Prioridade (migration 004)         |
| `arquivado`       | BOOLEAN           | NOT NULL | `false`             | Se esta arquivado (migration 004)  |
| `coluna_id`       | UUID              | NULL     | -                   | FK -> objective_columns(id) SET NULL (migration 004) |
| `meta_id`         | UUID              | NULL     | -                   | FK -> goals(id) SET NULL (migration 004) |
| `ordem`           | TEXT              | NOT NULL | `'0'`               | Ordem (migration 004)              |
| `created_at`      | TIMESTAMPTZ       | NOT NULL | `NOW()`             | Data de criacao                    |
| `updated_at`      | TIMESTAMPTZ       | NOT NULL | `NOW()`             | Ultima atualizacao (trigger)       |

**Constraints:** PK(id), FK(user_id -> users.id CASCADE), FK(coluna_id -> objective_columns.id SET NULL), FK(meta_id -> goals.id SET NULL)

---

### `objective_columns` - Colunas Kanban de Objetivos
Colunas Kanban personalizaveis para organizar objetivos.

| Coluna       | Tipo        | Nullable | Default             | Descricao                          |
|--------------|-------------|----------|---------------------|------------------------------------|
| `id`         | UUID        | NOT NULL | `gen_random_uuid()` | PK                                 |
| `user_id`    | UUID        | NOT NULL | -                   | FK -> users(id) ON DELETE CASCADE  |
| `titulo`     | TEXT        | NOT NULL | -                   | Titulo da coluna                   |
| `descricao`  | TEXT        | NULL     | -                   | Descricao                          |
| `icone`      | TEXT        | NOT NULL | `'folder'`          | Icone da coluna                    |
| `cor`        | TEXT        | NOT NULL | `'#6366f1'`         | Cor da coluna                      |
| `ordem`      | TEXT        | NOT NULL | `'0'`               | Ordem (string para ordenacao lexicografica) |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()`             | Data de criacao                    |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()`             | Ultima atualizacao (trigger)       |

**Constraints:** PK(id), FK(user_id -> users.id CASCADE)

---

### `events` - Eventos da Agenda
Eventos da pagina `/agenda`.

| Coluna           | Tipo                  | Nullable | Default             | Descricao                          |
|------------------|-----------------------|----------|---------------------|------------------------------------|
| `id`             | UUID                  | NOT NULL | `gen_random_uuid()` | PK                                 |
| `user_id`        | UUID                  | NOT NULL | -                   | FK -> users(id) ON DELETE CASCADE  |
| `titulo`         | TEXT                  | NOT NULL | -                   | Titulo do evento                   |
| `descricao`      | TEXT                  | NULL     | -                   | Descricao                          |
| `data`           | DATE                  | NOT NULL | -                   | Data do evento                     |
| `horario_inicio` | TIME                  | NOT NULL | -                   | Horario de inicio                  |
| `horario_fim`    | TIME                  | NOT NULL | -                   | Horario de fim                     |
| `categoria`      | TEXT                  | NOT NULL | `'Reuniao'`         | Categoria do evento                |
| `local`          | TEXT                  | NULL     | -                   | Local                              |
| `status`         | event_status          | NOT NULL | `'confirmado'`      | Status do evento                   |
| `calendario`     | calendar_integration  | NOT NULL | `'Manual'`          | Fonte do calendario                |
| `created_at`     | TIMESTAMPTZ           | NOT NULL | `NOW()`             | Data de criacao                    |
| `updated_at`     | TIMESTAMPTZ           | NOT NULL | `NOW()`             | Ultima atualizacao (trigger)       |

**Constraints:** PK(id), FK(user_id -> users.id CASCADE)

---

### `courses` - Cursos
Cursos disponiveis na plataforma.

| Coluna       | Tipo          | Nullable | Default             | Descricao                          |
|--------------|---------------|----------|---------------------|------------------------------------|
| `id`         | UUID          | NOT NULL | `gen_random_uuid()` | PK                                 |
| `slug`       | TEXT          | NOT NULL | -                   | Slug unico do curso                |
| `titulo`     | TEXT          | NOT NULL | -                   | Titulo do curso                    |
| `descricao`  | TEXT          | NULL     | -                   | Descricao                          |
| `categoria`  | TEXT          | NOT NULL | -                   | Categoria do curso                 |
| `nivel`      | course_level  | NOT NULL | `'iniciante'`       | Nivel de dificuldade               |
| `imagem_url` | TEXT          | NULL     | -                   | URL da imagem de capa              |
| `destaque`   | BOOLEAN       | NOT NULL | `false`             | Se e curso em destaque             |
| `status`     | course_status | NOT NULL | `'publicado'`       | Status de publicacao               |
| `ordem`      | INTEGER       | NOT NULL | 0                   | Ordem de exibicao                  |
| `created_at` | TIMESTAMPTZ   | NOT NULL | `NOW()`             | Data de criacao                    |
| `updated_at` | TIMESTAMPTZ   | NOT NULL | `NOW()`             | Ultima atualizacao (trigger)       |

**Constraints:** PK(id), UNIQUE(slug)

---

### `course_modules` - Modulos de Cursos
Modulos dentro de cada curso.

| Coluna       | Tipo        | Nullable | Default             | Descricao                          |
|--------------|-------------|----------|---------------------|------------------------------------|
| `id`         | UUID        | NOT NULL | `gen_random_uuid()` | PK                                 |
| `course_id`  | UUID        | NOT NULL | -                   | FK -> courses(id) ON DELETE CASCADE|
| `titulo`     | TEXT        | NOT NULL | -                   | Titulo do modulo                   |
| `descricao`  | TEXT        | NULL     | -                   | Descricao                          |
| `ordem`      | INTEGER     | NOT NULL | 0                   | Ordem no curso                     |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()`             | Data de criacao                    |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()`             | Ultima atualizacao (trigger)       |

**Constraints:** PK(id), FK(course_id -> courses.id CASCADE)

---

### `lessons` - Aulas
Aulas dentro de cada modulo.

| Coluna            | Tipo        | Nullable | Default             | Descricao                          |
|-------------------|-------------|----------|---------------------|------------------------------------|
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | PK                                 |
| `module_id`       | UUID        | NOT NULL | -                   | FK -> course_modules(id) CASCADE   |
| `titulo`          | TEXT        | NOT NULL | -                   | Titulo da aula                     |
| `descricao`       | TEXT        | NULL     | -                   | Descricao                          |
| `duracao_segundos` | INTEGER    | NOT NULL | 0                   | Duracao em segundos                |
| `xp_recompensa`   | INTEGER    | NOT NULL | 10                  | XP ao concluir                     |
| `video_url`       | TEXT        | NULL     | -                   | URL do video                       |
| `ordem`           | INTEGER     | NOT NULL | 0                   | Ordem no modulo                    |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `NOW()`             | Data de criacao                    |
| `updated_at`      | TIMESTAMPTZ | NOT NULL | `NOW()`             | Ultima atualizacao (trigger)       |

**Constraints:** PK(id), FK(module_id -> course_modules.id CASCADE)

---

### `lesson_progress` - Progresso nas Aulas
Progresso do usuario em cada aula.

| Coluna         | Tipo        | Nullable | Default             | Descricao                          |
|----------------|-------------|----------|---------------------|------------------------------------|
| `id`           | UUID        | NOT NULL | `gen_random_uuid()` | PK                                 |
| `user_id`      | UUID        | NOT NULL | -                   | FK -> users(id) ON DELETE CASCADE  |
| `lesson_id`    | UUID        | NOT NULL | -                   | FK -> lessons(id) ON DELETE CASCADE|
| `concluida`    | BOOLEAN     | NOT NULL | `false`             | Se a aula foi concluida            |
| `xp_ganho`     | INTEGER     | NOT NULL | 0                   | XP ganho                           |
| `concluida_em` | TIMESTAMPTZ | NULL     | -                   | Data de conclusao                  |
| `created_at`   | TIMESTAMPTZ | NOT NULL | `NOW()`             | Data de criacao                    |
| `updated_at`   | TIMESTAMPTZ | NOT NULL | `NOW()`             | Ultima atualizacao (trigger)       |

**Constraints:** PK(id), UNIQUE(user_id, lesson_id), FK(user_id -> users.id CASCADE), FK(lesson_id -> lessons.id CASCADE)

---

## Views

### `focus_sessions_with_task`
Sessoes de foco com dados da tarefa associada.

```sql
SELECT
  fs.id, fs.user_id, fs.task_id, fs.modo, fs.duracao_planejada, fs.duracao_real,
  fs.xp_ganho, fs.started_at, fs.ended_at, fs.pausas, fs.status, fs.created_at,
  t.titulo as task_titulo, t.prioridade as task_prioridade, t.coluna as task_coluna
FROM focus_sessions fs
LEFT JOIN tasks t ON fs.task_id = t.id;
```

### `habits_today`
Habitos ativos do dia com status de conclusao e dados da categoria (recriada na migration 006).

```sql
SELECT
  h.id, h.user_id, h.categoria_id, h.titulo, h.descricao, h.frequencia,
  h.dias_semana, h.icone, h.cor, h.dificuldade, h.streak_atual, h.maior_streak, h.ativo, h.ordem,
  hc.nome as category_nome, hc.icone as category_icone, hc.cor as category_cor,
  CASE WHEN hh.id IS NOT NULL THEN true ELSE false END as feito_hoje
FROM habits h
LEFT JOIN habit_categories hc ON h.categoria_id = hc.id
LEFT JOIN habit_history hh ON h.id = hh.habito_id AND hh.data = CURRENT_DATE
WHERE h.ativo = true;
```

---

## Funcoes

### `update_updated_at_column()`
**Trigger function.** Atualiza o campo `updated_at` automaticamente antes de UPDATE.
- **Linguagem:** plpgsql
- **Retorno:** TRIGGER

### `calculate_level(xp INTEGER) -> INTEGER`
Calcula o nivel a partir do XP. Formula: `FLOOR(SQRT(xp / 100)) + 1`
- **Linguagem:** plpgsql IMMUTABLE

### `add_user_xp(p_user_id UUID, p_xp_amount INTEGER) -> TABLE`
Adiciona XP ao usuario e atualiza o nivel se necessario.
- **Retorno:** `(new_total_xp INTEGER, new_level INTEGER, level_up BOOLEAN)`
- **Seguranca:** SECURITY DEFINER

### `add_task_time(p_task_id UUID, p_minutes INTEGER) -> INTEGER`
Adiciona tempo gasto a uma tarefa.
- **Retorno:** Novo `tempo_gasto`
- **Seguranca:** SECURITY DEFINER

### `calculate_focus_xp(duration_seconds INTEGER) -> INTEGER`
Calcula XP de foco. Formula: `FLOOR(duration_seconds / 60)` (1 XP por minuto)
- **Linguagem:** plpgsql IMMUTABLE

### `complete_focus_session(p_session_id UUID, p_duration_real INTEGER, p_ended_at TIMESTAMPTZ) -> TABLE`
Completa uma sessao de foco, calcula XP e atualiza o usuario.
- **Retorno:** `(session_id UUID, xp_earned INTEGER, new_total_xp INTEGER, new_level INTEGER, level_up BOOLEAN)`
- **Seguranca:** SECURITY DEFINER

### `get_focus_stats(p_user_id UUID) -> TABLE`
Retorna estatisticas de foco do usuario.
- **Retorno:** `(total_sessions, total_seconds, total_xp, average_session_seconds, sessions_today, seconds_today, sessions_this_week, seconds_this_week)`
- **Seguranca:** SECURITY DEFINER, STABLE

### `cancel_active_sessions(p_user_id UUID) -> INTEGER`
Cancela todas as sessoes ativas/pausadas do usuario.
- **Seguranca:** SECURITY DEFINER

### `check_habit(p_habit_id UUID, p_user_id UUID, p_date DATE) -> TABLE`
Marca um habito como concluido, calcula streak e XP com bonus.
- **Retorno:** `(streak_atual INTEGER, xp_ganho INTEGER, new_total_xp INTEGER, new_level INTEGER, level_up BOOLEAN)`
- **Seguranca:** SECURITY DEFINER

### `get_habit_streak(p_habit_id UUID) -> INTEGER`
Calcula o streak atual de um habito contando dias consecutivos.
- **Estabilidade:** STABLE

### `handle_new_user() -> TRIGGER`
Sincroniza `auth.users` com `public.users` no signup.
- **Seguranca:** SECURITY DEFINER

### `complete_lesson(p_user_id UUID, p_lesson_id UUID) -> TABLE`
Completa uma aula, concede XP (idempotente).
- **Retorno:** `(xp_ganho INTEGER, new_total_xp INTEGER, new_level INTEGER, level_up BOOLEAN)`
- **Seguranca:** SECURITY DEFINER

### `get_course_progress(p_user_id UUID, p_course_id UUID) -> TABLE`
Retorna progresso de um usuario em um curso.
- **Retorno:** `(total_aulas BIGINT, aulas_concluidas BIGINT, progresso_percentual INTEGER)`
- **Seguranca:** SECURITY DEFINER, STABLE

---

## Triggers

| Trigger                                     | Tabela              | Evento        | Funcao                           |
|---------------------------------------------|---------------------|---------------|----------------------------------|
| `update_users_updated_at`                   | `users`             | BEFORE UPDATE | `update_updated_at_column()`     |
| `update_tasks_updated_at`                   | `tasks`             | BEFORE UPDATE | `update_updated_at_column()`     |
| `update_pending_items_updated_at`           | `pending_items`     | BEFORE UPDATE | `update_updated_at_column()`     |
| `update_habit_categories_updated_at`        | `habit_categories`  | BEFORE UPDATE | `update_updated_at_column()`     |
| `update_habits_updated_at`                  | `habits`            | BEFORE UPDATE | `update_updated_at_column()`     |
| `update_goals_updated_at`                   | `goals`             | BEFORE UPDATE | `update_updated_at_column()`     |
| `update_objectives_updated_at`              | `objectives`        | BEFORE UPDATE | `update_updated_at_column()`     |
| `update_objective_columns_updated_at`       | `objective_columns` | BEFORE UPDATE | `update_updated_at_column()`     |
| `update_goal_milestones_updated_at`         | `goal_milestones`   | BEFORE UPDATE | `update_updated_at_column()`     |
| `update_events_updated_at`                  | `events`            | BEFORE UPDATE | `update_updated_at_column()`     |
| `update_courses_updated_at`                 | `courses`           | BEFORE UPDATE | `update_updated_at_column()`     |
| `update_course_modules_updated_at`          | `course_modules`    | BEFORE UPDATE | `update_updated_at_column()`     |
| `update_lessons_updated_at`                 | `lessons`           | BEFORE UPDATE | `update_updated_at_column()`     |
| `update_lesson_progress_updated_at`         | `lesson_progress`   | BEFORE UPDATE | `update_updated_at_column()`     |
| `on_auth_user_created`                      | `auth.users`        | AFTER INSERT  | `handle_new_user()`              |

---

## Indexes

### users
| Index              | Colunas  |
|--------------------|----------|
| `idx_users_email`  | `email`  |

### tasks
| Index                      | Colunas             |
|----------------------------|---------------------|
| `idx_tasks_user_id`        | `user_id`           |
| `idx_tasks_coluna`         | `coluna`            |
| `idx_tasks_status`         | `status`            |
| `idx_tasks_prioridade`     | `prioridade`        |
| `idx_tasks_data_limite`    | `data_limite`       |
| `idx_tasks_user_coluna`    | `user_id, coluna`   |

### pending_items
| Index                          | Colunas   |
|--------------------------------|-----------|
| `idx_pending_items_user_id`    | `user_id` |

### focus_sessions
| Index                              | Colunas             |
|------------------------------------|---------------------|
| `idx_focus_sessions_user_id`       | `user_id`           |
| `idx_focus_sessions_task_id`       | `task_id`           |
| `idx_focus_sessions_status`        | `status`            |
| `idx_focus_sessions_started_at`    | `started_at`        |
| `idx_focus_sessions_user_status`   | `user_id, status`   |

### habit_categories
| Index                              | Colunas   |
|------------------------------------|-----------|
| `idx_habit_categories_user_id`     | `user_id` |

### habits
| Index                        | Colunas            |
|------------------------------|---------------------|
| `idx_habits_user_id`         | `user_id`           |
| `idx_habits_user_ativo`      | `user_id, ativo`    |
| `idx_habits_categoria_id`    | `categoria_id`      |
| `idx_habits_objetivo_id`     | `objetivo_id`       |
| `idx_habits_dificuldade`     | `dificuldade`       |

### habit_history
| Index                            | Colunas           |
|----------------------------------|-------------------|
| `idx_habit_history_habito_id`    | `habito_id`       |
| `idx_habit_history_user_id`      | `user_id`         |
| `idx_habit_history_data`         | `data`            |
| `idx_habit_history_user_data`    | `user_id, data`   |

### goals
| Index                | Colunas   |
|----------------------|-----------|
| `idx_goals_user_id`  | `user_id` |
| `idx_goals_status`   | `status`  |
| `idx_goals_ordem`    | `ordem`   |
| `idx_goals_ano`      | `ano`     |

### goal_milestones
| Index                              | Colunas     |
|------------------------------------|-------------|
| `idx_goal_milestones_meta_id`      | `meta_id`   |
| `idx_goal_milestones_concluido`    | `concluido` |

### objectives
| Index                         | Colunas       |
|-------------------------------|---------------|
| `idx_objectives_user_id`      | `user_id`     |
| `idx_objectives_status`       | `status`      |
| `idx_objectives_coluna_id`    | `coluna_id`   |
| `idx_objectives_meta_id`      | `meta_id`     |
| `idx_objectives_prioridade`   | `prioridade`  |

### objective_columns
| Index                                | Colunas   |
|--------------------------------------|-----------|
| `idx_objective_columns_user_id`      | `user_id` |
| `idx_objective_columns_ordem`        | `ordem`   |

### events
| Index                      | Colunas           |
|----------------------------|-------------------|
| `idx_events_user_id`       | `user_id`         |
| `idx_events_data`          | `data`            |
| `idx_events_user_data`     | `user_id, data`   |
| `idx_events_status`        | `status`          |

### courses
| Index                      | Colunas     |
|----------------------------|-------------|
| `idx_courses_slug`         | `slug`      |
| `idx_courses_categoria`    | `categoria` |
| `idx_courses_destaque`     | `destaque`  |
| `idx_courses_status`       | `status`    |

### course_modules
| Index                            | Colunas             |
|----------------------------------|---------------------|
| `idx_course_modules_course_id`   | `course_id`         |
| `idx_course_modules_ordem`       | `course_id, ordem`  |

### lessons
| Index                    | Colunas            |
|--------------------------|--------------------|
| `idx_lessons_module_id`  | `module_id`        |
| `idx_lessons_ordem`      | `module_id, ordem` |

### lesson_progress
| Index                                | Colunas             |
|--------------------------------------|---------------------|
| `idx_lesson_progress_user_id`        | `user_id`           |
| `idx_lesson_progress_lesson_id`      | `lesson_id`         |
| `idx_lesson_progress_user_lesson`    | `user_id, lesson_id`|

---

## Politicas RLS

Todas as tabelas possuem RLS habilitado. O padrao geral e:

| Operacao | Regra                                           |
|----------|-------------------------------------------------|
| SELECT   | `auth.uid() = user_id` (para tabelas com user_id) |
| INSERT   | `auth.uid() = user_id`                          |
| UPDATE   | `auth.uid() = user_id` (USING + WITH CHECK)     |
| DELETE   | `auth.uid() = user_id`                          |
| ALL (service_role) | `true` (acesso total)              |

**Excecoes:**
- **`goal_milestones`**: RLS verifica via subquery na tabela `goals` (JOIN para verificar `user_id`)
- **`courses`**: SELECT permitido para **todos** (inclusive `anon`) quando `status = 'publicado'`
- **`course_modules`**: SELECT permitido para todos quando o curso pai esta publicado
- **`lessons`**: SELECT permitido para todos (via subquery module -> course) quando publicado
- **`lesson_progress`**: Apenas o proprio usuario (padrao normal)

---

## Diagrama de Relacionamentos

```
                    auth.users
                        |
                        | on_auth_user_created (trigger)
                        v
                    +-------+
                    | users |
                    +-------+
                        |
        +-------+-------+-------+-------+-------+-------+
        |       |       |       |       |       |       |
        v       v       v       v       v       v       v
    +-------+ +-----+ +------+ +-----+ +-----+ +-----+ +------+
    | tasks | |pend.| |focus_| |habit_| |habit| |goals| |object|
    |       | |items| |sess. | |categ.| |  s  | |     | |ives  |
    +-------+ +-----+ +------+ +-----+ +-----+ +-----+ +------+
        |                 |       |       |       |       |   |
        |                 |       +-->----+       |       |   |
        |                 |               |       v       |   |
        |                 |               |  +--------+   |   |
        +-------<---------+               |  |habit_  |   |   |
        (task_id)                          |  |history |   |   |
                                           |  +--------+   |   |
                                           |               |   |
                                           +--<---(cat_id)-+   |
                                                   |            |
                                                   v            |
                                            +----------+        |
                                            |goal_mile-|        |
                                            |stones    |        |
                                            +----------+        |
                                                                |
                                            +----------+        |
                                            |objective_|<-------+
                                            |columns   |(coluna_id)
                                            +----------+
                                                    
    +--------+     +---------+     +---------+     +----------+
    |courses |---->|course_  |---->| lessons |<----| lesson_  |
    |        |     |modules  |     |         |     | progress |
    +--------+     +---------+     +---------+     +----------+
                                                       |
                                                       v
                                                    +-------+
                                                    | users |
                                                    +-------+

    +--------+
    | events |-----> users (user_id)
    +--------+
```

---

## Historico de Migrations

| Arquivo                          | Descricao                                                |
|----------------------------------|----------------------------------------------------------|
| `000_consolidated_schema.sql`    | Schema completo consolidado: tabelas, enums, indexes, RLS, funcoes, triggers, views, seed data |
| `001_auth_profiles_trigger.sql`  | Trigger para sincronizar auth.users -> public.users      |
| `002_create_admin_user.sql`      | Criacao do usuario admin com credenciais geradas          |
| `003_reset_admin_password.sql`   | Reset de senha do admin                                  |
| `004_fix_database_naming.sql`    | Renomeia habit_checks -> habit_history, development_objectives -> objectives, cria goal_milestones e objective_columns |
| `005_fix_goals_schema.sql`       | Adiciona colunas faltantes em goals, muda status de enum para TEXT |
| `006_fix_habits_schema.sql`      | Adiciona colunas em habits (icone, cor, dificuldade, etc), renomeia category_id -> categoria_id, titulo -> nome em habit_categories |
| `007_create_events_table.sql`    | Cria tabela events para a agenda                         |
| `007_create_courses_schema.sql`  | Cria tabelas de cursos (courses, course_modules, lessons, lesson_progress) |

**Nota:** Existem dois arquivos com prefixo `007_`, o que pode causar conflitos de ordenacao.
