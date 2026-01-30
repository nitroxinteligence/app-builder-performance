-- ============================================================================
-- BUILDERS PERFORMANCE - SEED DATA (Development Only)
-- ============================================================================
-- Este arquivo contém dados de seed para ambiente de desenvolvimento.
-- NAO executar em producao.
--
-- Dados incluidos:
-- - Usuario mock com XP e level
-- - Tarefas do Kanban
-- - Pendencias
-- - Categorias de habitos, habitos
-- - Metas e objetivos de desenvolvimento
-- - Cursos, modulos e aulas
-- - Progresso do usuario nos cursos
-- - Eventos da agenda
--
-- Data: 2026-01-29
-- ============================================================================

-- ============================================================================
-- SECTION 1: CORE USER & TASKS (from 000_consolidated_schema.sql)
-- ============================================================================

-- Mock user
INSERT INTO public.users (id, email, name, avatar_url, total_xp, level, streak_shields, current_streak, longest_streak, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
  'mock@buildersperformance.com',
  'Mateus Pereira',
  NULL, 2150, 7, 2, 12, 28, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, total_xp = EXCLUDED.total_xp, level = EXCLUDED.level;

-- Sample tasks
INSERT INTO public.tasks (id, user_id, titulo, descricao, prioridade, status, coluna, xp_recompensa, tags, estimativa_tempo, tempo_gasto, ordem)
VALUES
  ('b1c2d3e4-f5a6-4789-0123-456789abcdef'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Finalizar landing page', 'Completar o design e desenvolvimento da landing page do produto', 'alta', 'em_progresso', 'em_andamento', 25, ARRAY['design', 'frontend'], 120, 45, 1),
  ('c2d3e4f5-a6b7-4890-1234-567890abcdef'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Revisar documentacao da API', 'Atualizar a documentacao com os novos endpoints', 'media', 'pendente', 'a_fazer', 15, ARRAY['docs', 'api'], 60, 0, 2),
  ('d3e4f5a6-b7c8-4901-2345-678901abcdef'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Implementar autenticacao OAuth', 'Adicionar login com Google e GitHub', 'urgente', 'pendente', 'backlog', 40, ARRAY['auth', 'backend'], 180, 0, 3),
  ('e4f5a6b7-c8d9-4012-3456-789012abcdef'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Configurar CI/CD', 'Setup do pipeline de deploy automatico', 'media', 'pendente', 'a_fazer', 20, ARRAY['devops', 'ci'], 90, 0, 4),
  ('f5a6b7c8-d9e0-4123-4567-890123abcdef'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Otimizar queries do banco', 'Melhorar performance das consultas mais lentas', 'alta', 'em_progresso', 'em_andamento', 30, ARRAY['database', 'performance'], 150, 30, 5)
ON CONFLICT (id) DO NOTHING;

-- Sample pending items
INSERT INTO public.pending_items (id, user_id, titulo, descricao, prioridade, categoria, prazo)
VALUES
  ('11111111-1111-4111-8111-111111111111'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Revisar notas da reuniao', 'Consolidar as notas e enviar para o time', 'media', 'Reunioes', 'Hoje'),
  ('22222222-2222-4222-8222-222222222222'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Atualizar backlog', 'Priorizar itens para a proxima sprint', 'alta', 'Planejamento', 'Amanha'),
  ('33333333-3333-4333-8333-333333333333'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Enviar feedback', 'Feedback para o estagiario sobre o ultimo PR', 'baixa', 'Comunicacao', 'Sexta')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 2: HABITS, GOALS & OBJECTIVES (from 000_consolidated_schema.sql)
-- ============================================================================

-- Sample habit categories
INSERT INTO public.habit_categories (id, user_id, titulo, icone, cor, ordem)
VALUES
  ('aaaa1111-1111-4111-8111-111111111111'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Saude', 'dumbbell', '#ef4444', 1),
  ('aaaa2222-2222-4222-8222-222222222222'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Produtividade', 'sparkles', '#8b5cf6', 2),
  ('aaaa3333-3333-4333-8333-333333333333'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Bem-estar', 'leaf', '#22c55e', 3)
ON CONFLICT (id) DO NOTHING;

-- Sample habits
INSERT INTO public.habits (id, user_id, category_id, titulo, descricao, frequencia, xp_por_check, streak_atual, maior_streak, ativo, ordem)
VALUES
  ('bbbb1111-1111-4111-8111-111111111111'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'aaaa1111-1111-4111-8111-111111111111'::UUID, 'Beber 2L de agua', 'Manter-se hidratado ao longo do dia', 'diario', 15, 15, 21, true, 1),
  ('bbbb2222-2222-4222-8222-222222222222'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'aaaa1111-1111-4111-8111-111111111111'::UUID, 'Treinar', 'Exercicio fisico regular', 'diario', 20, 8, 14, true, 2),
  ('bbbb3333-3333-4333-8333-333333333333'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'aaaa1111-1111-4111-8111-111111111111'::UUID, 'Dormir 7h+', 'Qualidade de sono', 'diario', 15, 12, 30, true, 3),
  ('bbbb4444-4444-4444-8444-444444444444'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'aaaa1111-1111-4111-8111-111111111111'::UUID, 'Meditar 10min', 'Meditacao diaria', 'diario', 15, 4, 12, true, 4),
  ('bbbb5555-5555-4555-8555-555555555555'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'aaaa2222-2222-4222-8222-222222222222'::UUID, 'Planejar o dia', 'Planejamento matinal', 'diario', 15, 20, 45, true, 1),
  ('bbbb6666-6666-4666-8666-666666666666'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'aaaa2222-2222-4222-8222-222222222222'::UUID, '2h de foco profundo', 'Deep work diario', 'diario', 25, 7, 18, true, 2),
  ('bbbb7777-7777-4777-8777-777777777777'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'aaaa2222-2222-4222-8222-222222222222'::UUID, 'Ler 30min', 'Leitura diaria', 'diario', 20, 6, 22, true, 3),
  ('bbbb8888-8888-4888-8888-888888888888'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'aaaa3333-3333-4333-8333-333333333333'::UUID, 'Alongar', 'Alongamento diario', 'diario', 10, 9, 15, true, 1)
ON CONFLICT (id) DO NOTHING;

-- Sample goals
INSERT INTO public.goals (id, user_id, titulo, descricao, progresso_atual, progresso_total, unidade, status, prazo, xp_recompensa)
VALUES
  ('cccc1111-1111-4111-8111-111111111111'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, '100 push-ups', 'Meta fitness pessoal', 62, 100, 'push-ups', 'em_andamento', 'Julho', 200),
  ('cccc2222-2222-4222-8222-222222222222'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, '100 corridas', 'Corridas de 5km', 41, 100, 'corridas', 'em_andamento', 'Dezembro', 300),
  ('cccc3333-3333-4333-8333-333333333333'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, '24 livros', 'Leitura continua', 6, 24, 'livros', 'a_fazer', 'Dezembro', 250),
  ('cccc4444-4444-4444-8444-444444444444'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, '30 dias de meditacao', 'Consistencia diaria', 30, 30, 'dias', 'concluido', 'Marco', 150)
ON CONFLICT (id) DO NOTHING;

-- Sample development objectives
INSERT INTO public.development_objectives (id, user_id, titulo, descricao, categoria, progresso_atual, progresso_total, status, habitos_chave, xp_recompensa)
VALUES
  ('dddd1111-1111-4111-8111-111111111111'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Aprender ingles', 'Conversacao com fluencia intermediaria', 'pessoal', 12, 30, 'em_andamento', ARRAY['30 min por dia', 'Revisar vocabulario', 'Podcast semanal'], 100),
  ('dddd2222-2222-4222-8222-222222222222'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Portfolio atualizado', 'Publicar 3 novos cases ate marco', 'profissional', 2, 3, 'em_andamento', ARRAY['Revisar materiais', 'Reuniao de alinhamento'], 80),
  ('dddd3333-3333-4333-8333-333333333333'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Mestrado em andamento', 'Preparar inscricao e provas', 'estudos', 3, 6, 'a_fazer', ARRAY['Leituras semanais', 'Plano de estudos'], 150),
  ('dddd4444-4444-4444-8444-444444444444'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Especializacao IA', 'Finalizar modulo avancado', 'estudos', 5, 10, 'em_andamento', ARRAY['Aulas 2x/semana', 'Projetos praticos'], 120)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 3: COURSES, MODULES & LESSONS (from 008_create_courses_schema.sql)
-- ============================================================================

-- Curso 1: Builders Performance Junior
INSERT INTO public.courses (id, slug, titulo, descricao, categoria, nivel, destaque, ordem)
VALUES (
  '11111111-aaaa-4111-8111-111111111111'::UUID,
  'builders-performance-junior',
  'Builders Performance Junior',
  'Fundamentos de produtividade, rotina e performance para iniciar sua jornada.',
  'Produtividade',
  'iniciante',
  true,
  1
) ON CONFLICT (id) DO NOTHING;

-- Modulos do Curso 1
INSERT INTO public.course_modules (id, course_id, titulo, descricao, ordem)
VALUES
  ('22221111-aaaa-4111-8111-111111111111'::UUID, '11111111-aaaa-4111-8111-111111111111'::UUID, 'Boas-vindas', 'Entenda o metodo e a visao do Builder Performance.', 1),
  ('22222222-aaaa-4111-8111-111111111111'::UUID, '11111111-aaaa-4111-8111-111111111111'::UUID, 'Rotina que funciona', 'Estruturacao diaria e energia sustentavel.', 2)
ON CONFLICT (id) DO NOTHING;

-- Aulas do Modulo 1.1
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33331111-aaaa-4111-8111-111111111111'::UUID, '22221111-aaaa-4111-8111-111111111111'::UUID, 'Introducao ao programa', 'Panorama do curso e da sua evolucao.', 380, 10, 1),
  ('33332222-aaaa-4111-8111-111111111111'::UUID, '22221111-aaaa-4111-8111-111111111111'::UUID, 'O metodo Builder', 'Como as camadas de rotina se conectam.', 555, 15, 2)
ON CONFLICT (id) DO NOTHING;

-- Aulas do Modulo 1.2
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33333333-aaaa-4111-8111-111111111111'::UUID, '22222222-aaaa-4111-8111-111111111111'::UUID, 'Rituais diarios', 'Manhas e finais de dia com consistencia.', 760, 20, 1),
  ('33334444-aaaa-4111-8111-111111111111'::UUID, '22222222-aaaa-4111-8111-111111111111'::UUID, 'Ambiente e foco', 'Como preparar o espaco para alta performance.', 605, 20, 2),
  ('33335555-aaaa-4111-8111-111111111111'::UUID, '22222222-aaaa-4111-8111-111111111111'::UUID, 'Gestao de energia', 'Alavancas simples para render mais.', 530, 15, 3)
ON CONFLICT (id) DO NOTHING;

-- Curso 2: Imersao Produto Rapido
INSERT INTO public.courses (id, slug, titulo, descricao, categoria, nivel, destaque, ordem)
VALUES (
  '11111111-bbbb-4111-8111-111111111111'::UUID,
  'imersao-produto-rapido',
  'Imersao Produto Rapido',
  'Planejamento e execucao para tirar ideias do papel com velocidade.',
  'Execucao',
  'intermediario',
  true,
  2
) ON CONFLICT (id) DO NOTHING;

-- Modulos do Curso 2
INSERT INTO public.course_modules (id, course_id, titulo, descricao, ordem)
VALUES
  ('22221111-bbbb-4111-8111-111111111111'::UUID, '11111111-bbbb-4111-8111-111111111111'::UUID, 'Alinhamento estrategico', 'Clareza de objetivo e foco de entrega.', 1),
  ('22222222-bbbb-4111-8111-111111111111'::UUID, '11111111-bbbb-4111-8111-111111111111'::UUID, 'Entrega continua', 'Cadencia, feedback e evolucao.', 2)
ON CONFLICT (id) DO NOTHING;

-- Aulas do Modulo 2.1
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33331111-bbbb-4111-8111-111111111111'::UUID, '22221111-bbbb-4111-8111-111111111111'::UUID, 'Definindo objetivos', 'Direcao clara antes de construir.', 670, 20, 1),
  ('33332222-bbbb-4111-8111-111111111111'::UUID, '22221111-bbbb-4111-8111-111111111111'::UUID, 'Roadmap em 3 semanas', 'Plano enxuto com entregas reais.', 842, 25, 2)
ON CONFLICT (id) DO NOTHING;

-- Aulas do Modulo 2.2
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33333333-bbbb-4111-8111-111111111111'::UUID, '22222222-bbbb-4111-8111-111111111111'::UUID, 'Loop de feedback', 'Feedback rapido para decisao rapida.', 570, 15, 1),
  ('33334444-bbbb-4111-8111-111111111111'::UUID, '22222222-bbbb-4111-8111-111111111111'::UUID, 'Ritmo de execucao', 'Como manter velocidade sem burnout.', 825, 25, 2)
ON CONFLICT (id) DO NOTHING;

-- Curso 3: Foco Profundo
INSERT INTO public.courses (id, slug, titulo, descricao, categoria, nivel, destaque, ordem)
VALUES (
  '11111111-cccc-4111-8111-111111111111'::UUID,
  'foco-profundo',
  'Foco Profundo',
  'Treinamento pratico para sessoes de deep work e produtividade sustentada.',
  'Foco',
  'intermediario',
  false,
  3
) ON CONFLICT (id) DO NOTHING;

-- Modulos do Curso 3
INSERT INTO public.course_modules (id, course_id, titulo, descricao, ordem)
VALUES
  ('22221111-cccc-4111-8111-111111111111'::UUID, '11111111-cccc-4111-8111-111111111111'::UUID, 'Fundamentos do foco', 'O que rouba sua atencao e como recuperar.', 1),
  ('22222222-cccc-4111-8111-111111111111'::UUID, '11111111-cccc-4111-8111-111111111111'::UUID, 'Sessoes guiadas', 'Rotinas para entrar em flow rapidamente.', 2)
ON CONFLICT (id) DO NOTHING;

-- Aulas do Modulo 3.1
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33331111-cccc-4111-8111-111111111111'::UUID, '22221111-cccc-4111-8111-111111111111'::UUID, 'Mapa de distracoes', 'Identifique seus principais gatilhos.', 460, 10, 1),
  ('33332222-cccc-4111-8111-111111111111'::UUID, '22221111-cccc-4111-8111-111111111111'::UUID, 'Setup de imersao', 'Prepare a mente e o ambiente.', 620, 15, 2)
ON CONFLICT (id) DO NOTHING;

-- Aulas do Modulo 3.2
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33333333-cccc-4111-8111-111111111111'::UUID, '22222222-cccc-4111-8111-111111111111'::UUID, 'Pomodoro avancado', 'Como customizar ciclos sem perder ritmo.', 725, 20, 1),
  ('33334444-cccc-4111-8111-111111111111'::UUID, '22222222-cccc-4111-8111-111111111111'::UUID, 'Recuperacao ativa', 'Pausas que recuperam energia de verdade.', 535, 15, 2)
ON CONFLICT (id) DO NOTHING;

-- Curso 4: Rotina para Builders
INSERT INTO public.courses (id, slug, titulo, descricao, categoria, nivel, destaque, ordem)
VALUES (
  '11111111-dddd-4111-8111-111111111111'::UUID,
  'rotina-para-builders',
  'Rotina para Builders',
  'Crie sistemas pessoais para evoluir habitos, tarefas e metas.',
  'Rotina',
  'avancado',
  false,
  4
) ON CONFLICT (id) DO NOTHING;

-- Modulos do Curso 4
INSERT INTO public.course_modules (id, course_id, titulo, descricao, ordem)
VALUES
  ('22221111-dddd-4111-8111-111111111111'::UUID, '11111111-dddd-4111-8111-111111111111'::UUID, 'Arquitetura da rotina', 'Estruture sua semana com intencao.', 1),
  ('22222222-dddd-4111-8111-111111111111'::UUID, '11111111-dddd-4111-8111-111111111111'::UUID, 'Habitos que sustentam', 'Mantenha consistencia ao longo dos meses.', 2)
ON CONFLICT (id) DO NOTHING;

-- Aulas do Modulo 4.1
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33331111-dddd-4111-8111-111111111111'::UUID, '22221111-dddd-4111-8111-111111111111'::UUID, 'Planejamento semanal', 'Priorizacao e execucao realista.', 805, 25, 1),
  ('33332222-dddd-4111-8111-111111111111'::UUID, '22221111-dddd-4111-8111-111111111111'::UUID, 'Revisoes de progresso', 'Como ajustar o rumo toda semana.', 610, 20, 2)
ON CONFLICT (id) DO NOTHING;

-- Aulas do Modulo 4.2
INSERT INTO public.lessons (id, module_id, titulo, descricao, duracao_segundos, xp_recompensa, ordem)
VALUES
  ('33333333-dddd-4111-8111-111111111111'::UUID, '22222222-dddd-4111-8111-111111111111'::UUID, 'Gatilhos e recompensas', 'Estruture habitos faceis de cumprir.', 580, 15, 1)
ON CONFLICT (id) DO NOTHING;

-- Progresso do usuario mock (apenas se o usuario existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.users WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID) THEN
    INSERT INTO public.lesson_progress (user_id, lesson_id, concluida, xp_ganho, concluida_em)
    VALUES
      ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, '33331111-aaaa-4111-8111-111111111111'::UUID, true, 10, NOW() - INTERVAL '5 days'),
      ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, '33332222-aaaa-4111-8111-111111111111'::UUID, true, 15, NOW() - INTERVAL '4 days'),
      ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, '33331111-bbbb-4111-8111-111111111111'::UUID, true, 20, NOW() - INTERVAL '2 days')
    ON CONFLICT (user_id, lesson_id) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- SECTION 4: EVENTS (from 007_create_events_table.sql)
-- ============================================================================

-- Eventos da agenda (apenas se o usuario mock existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.users WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID) THEN
    INSERT INTO public.events (id, user_id, titulo, descricao, data, horario_inicio, horario_fim, categoria, local, status, calendario)
    VALUES
      ('e0011111-1111-4111-8111-111111111111'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Reuniao de alinhamento', 'Sprint e prioridades da semana.', CURRENT_DATE, '09:00', '09:45', 'Reuniao', 'Google Meet', 'confirmado', 'Google'),
      ('e0022222-2222-4222-8222-222222222222'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Deep work', 'Bloco de foco para entregas principais.', CURRENT_DATE, '10:00', '12:00', 'Bloco de foco', 'Sala silenciosa', 'foco', 'Manual'),
      ('e0033333-3333-4333-8333-333333333333'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Call com cliente', 'Revisao do dashboard e proximos passos.', CURRENT_DATE, '15:30', '16:15', 'Reuniao', 'Zoom', 'confirmado', 'Outlook'),
      ('e0044444-4444-4444-8444-444444444444'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Mentoria Builder', 'Plano individual e habitos da semana.', CURRENT_DATE + INTERVAL '1 day', '11:00', '11:40', 'Aula / Mentoria', 'Google Meet', 'pendente', 'Google'),
      ('e0055555-5555-4555-8555-555555555555'::UUID, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID, 'Treino funcional', 'Cardio + mobilidade.', CURRENT_DATE + INTERVAL '1 day', '18:30', '19:20', 'Pessoal', 'Academia', 'confirmado', 'Manual')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
