# Schema de Referência para Supabase

Este documento contém o schema de banco de dados para criar as tabelas diretamente no Supabase.

## SQL para criar as tabelas

```sql
-- ==========================================
-- ENUMS
-- ==========================================
CREATE TYPE prioridade_tarefa AS ENUM ('alta', 'media', 'baixa');
CREATE TYPE estagio_tarefa AS ENUM ('a-fazer', 'em-progresso', 'concluido');

-- ==========================================
-- TABELA: usuarios
-- ==========================================
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  avatar_url TEXT,
  nivel INTEGER DEFAULT 1,
  xp_total INTEGER DEFAULT 0,
  xp_atual INTEGER DEFAULT 0,
  xp_proximo_nivel INTEGER DEFAULT 100,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- TABELA: tarefas
-- ==========================================
CREATE TABLE tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  prioridade prioridade_tarefa DEFAULT 'media',
  estagio estagio_tarefa DEFAULT 'a-fazer',
  categoria TEXT,
  prazo TEXT,
  data_vencimento TIMESTAMPTZ,
  xp INTEGER DEFAULT 25,
  concluida BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0,
  concluida_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now(),

  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_tarefas_usuario_estagio ON tarefas(usuario_id, estagio);
CREATE INDEX idx_tarefas_usuario_concluida ON tarefas(usuario_id, concluida);

-- ==========================================
-- TABELA: pendencias
-- ==========================================
CREATE TABLE pendencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  prioridade prioridade_tarefa DEFAULT 'media',
  categoria TEXT,
  prazo TEXT,
  data_vencimento TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now(),

  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_pendencias_usuario ON pendencias(usuario_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pendencias ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (usuário vê apenas seus próprios dados)
CREATE POLICY "Usuários podem ver seus próprios dados"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para tarefas
CREATE POLICY "Usuários podem ver suas próprias tarefas"
  ON tarefas FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar suas próprias tarefas"
  ON tarefas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar suas próprias tarefas"
  ON tarefas FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar suas próprias tarefas"
  ON tarefas FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas para pendencias
CREATE POLICY "Usuários podem ver suas próprias pendências"
  ON pendencias FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar suas próprias pendências"
  ON pendencias FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem atualizar suas próprias pendências"
  ON pendencias FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem deletar suas próprias pendências"
  ON pendencias FOR DELETE
  USING (auth.uid() = usuario_id);

-- ==========================================
-- TRIGGER para atualizado_em
-- ==========================================
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usuarios_atualizado_em
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER tarefas_atualizado_em
  BEFORE UPDATE ON tarefas
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER pendencias_atualizado_em
  BEFORE UPDATE ON pendencias
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();
```

## Dados de Seed (para desenvolvimento)

```sql
-- Usuário mock para desenvolvimento
INSERT INTO usuarios (id, email, nome, nivel, xp_total, xp_atual, xp_proximo_nivel)
VALUES (
  'user-mock-001',
  'mateus@builders.dev',
  'Mateus Pereira',
  7,
  2150,
  2150,
  3200
);

-- Tarefas iniciais
INSERT INTO tarefas (titulo, prioridade, estagio, prazo, xp, categoria, ordem, usuario_id)
VALUES
  ('Finalizar relatório', 'alta', 'a-fazer', 'Hoje', 50, 'Financeiro', 0, 'user-mock-001'),
  ('Preparar apresentação', 'alta', 'a-fazer', 'Hoje', 40, 'Apresentações', 1, 'user-mock-001'),
  ('Responder emails', 'media', 'a-fazer', 'Amanhã', 20, 'Comunicação', 2, 'user-mock-001'),
  ('Revisar documento', 'media', 'em-progresso', 'Amanhã', 30, 'Documentos', 0, 'user-mock-001'),
  ('Planejar sprint', 'baixa', 'em-progresso', 'Sexta', 20, 'Planejamento', 1, 'user-mock-001'),
  ('Checklist diário', 'baixa', 'concluido', 'Hoje', 15, 'Rotina', 0, 'user-mock-001');

-- Pendências iniciais
INSERT INTO pendencias (titulo, prazo, prioridade, categoria, usuario_id)
VALUES
  ('Revisar notas da reunião', 'Hoje', 'media', 'Reuniões', 'user-mock-001'),
  ('Atualizar backlog', 'Amanhã', 'alta', 'Planejamento', 'user-mock-001'),
  ('Enviar feedback', 'Sexta', 'baixa', 'Comunicação', 'user-mock-001');
```

## Tipos TypeScript (para usar com Supabase)

```typescript
// types/database.ts

export type Prioridade = 'alta' | 'media' | 'baixa'
export type Estagio = 'a-fazer' | 'em-progresso' | 'concluido'

export interface Usuario {
  id: string
  email: string
  nome: string
  avatar_url: string | null
  nivel: number
  xp_total: number
  xp_atual: number
  xp_proximo_nivel: number
  criado_em: string
  atualizado_em: string
}

export interface Tarefa {
  id: string
  titulo: string
  descricao: string | null
  prioridade: Prioridade
  estagio: Estagio
  categoria: string | null
  prazo: string | null
  data_vencimento: string | null
  xp: number
  concluida: boolean
  ordem: number
  concluida_em: string | null
  criado_em: string
  atualizado_em: string
  usuario_id: string
}

export interface Pendencia {
  id: string
  titulo: string
  descricao: string | null
  prioridade: Prioridade
  categoria: string | null
  prazo: string | null
  data_vencimento: string | null
  criado_em: string
  atualizado_em: string
  usuario_id: string
}

// Tipos para criação (sem campos automáticos)
export type TarefaCreate = Omit<Tarefa, 'id' | 'criado_em' | 'atualizado_em' | 'concluida_em'>
export type TarefaUpdate = Partial<Omit<Tarefa, 'id' | 'criado_em' | 'atualizado_em' | 'usuario_id'>>

export type PendenciaCreate = Omit<Pendencia, 'id' | 'criado_em' | 'atualizado_em'>
export type PendenciaUpdate = Partial<Omit<Pendencia, 'id' | 'criado_em' | 'atualizado_em' | 'usuario_id'>>
```
