# MiniCRM — Plano de execução (POC / MVP)

> **Status (atualizado):** as 10 histórias (US-01 a US-10, 16 pts) estão implementadas e cobertas por testes e2e da API: auth, estágios, contatos com busca, negócios com transições de estágio e status, notas, painel e saúde com checagem do banco, além do Kanban e das demais telas na web. A limpeza de escopo da seção 2 foi concluída (sem worker, Redis, roles, signup ou reset de senha). As caixas de seleção abaixo são o plano original e **não** foram mantidas marcadas. Pendências conhecidas: o CI nunca rodou no GitHub (sem remoto) e a publicação via PM2 não foi exercitada. Para rodar tudo com um comando, use `pnpm local` (ver [README](../README.md)); resumo de Scrum em [scrum.md](scrum.md) e guia técnico em [desenvolvimento.md](desenvolvimento.md).

Fonte: documento de entrega Scrum da disciplina (10 histórias, 16 pts, 4 sprints). Este plano transforma o backlog em tarefas técnicas na ordem de construção, já adaptadas ao scaffold que existe no repo.

## 1. Decisões de stack (scaffold vence a sugestão do docx)

O docx sugere Express + Prisma + Zod, mas admite alternativa justificada. O repo já tem monorepo funcional, então **mantemos o que existe**:

| Camada    | Docx sugeria            | Usaremos (já no repo)                                                                |
| --------- | ----------------------- | ------------------------------------------------------------------------------------ |
| API       | Express                 | NestJS (`apps/api`)                                                                  |
| ORM       | Prisma                  | Drizzle + PostgreSQL (`packages/database`)                                           |
| Sessão    | cookie httpOnly         | JWT em cookie httpOnly (já implementado)                                             |
| Validação | Zod                     | DTOs do Nest (class-validator já em uso) — ou Zod se preferirem; escolher 1 e manter |
| Web       | React + Vite + Tailwind | igual + TanStack Router/Query + shadcn/ui                                            |
| DnD       | lib com toque           | `@dnd-kit/core` (suporta toque/teclado)                                              |
| Testes    | Vitest                  | Vitest (já configurado)                                                              |

Regra de camadas do repo: `web → api → core → database`. Regra de negócio fica em `packages/core`, tipos/erros em `contracts`, paths em `routes`.

## 2. Gap: scaffold atual × escopo do MVP

O scaffold tem coisas **fora do escopo** do docx (seção 7.7) que devem ser removidas ou ignoradas para não virar scope creep:

| Existe hoje                                                                             | Docx diz                                       | Ação                                                                         |
| --------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Roles ADMIN/USER, `packages/auth` (matriz de permissão)                                 | Papel único "Usuário"                          | Remover roles do fluxo; deixar `packages/auth` sem uso (ou apagar)           |
| Rotas `signup`, `resetPassword*` em `routes`                                            | Sem cadastro público, sem recuperação de senha | Remover as rotas/constantes                                                  |
| `apps/worker`, `packages/jobs`, `packages/infra` (Redis/BullMQ), Redis no `compose.yml` | Sem filas/background                           | Remover worker + Redis (ou deixar sem subir). Simplifica `pnpm dev` e deploy |
| Seed cria 2 usuários demo                                                               | Seed de 1 usuário por variáveis de ambiente    | Ajustar seed (`SEED_USER_*` no `.env`)                                       |
| Soft delete (`deletedAt`) em users                                                      | —                                              | Manter só se já for padrão do schema; negócios/contatos usam delete real     |

## 3. Modelo de dados (Drizzle)

```
users      id, name, email (unique), password (hash), createdAt          ← já existe, simplificar
contacts   id, name(≤100), email?, phone?, company?, createdAt
stages     id, name, order (unique)                                       ← 4 fixos via seed
deals      id, title(3–100), value numeric(12,2) ≥0, contactId FK (restrict),
           stageId FK, status enum(OPEN|WON|LOST), createdAt, closedAt?
notes      id, dealId FK (cascade), authorId FK, text(≤2000), createdAt
```

Estágios seed (idempotente): Novo lead → Em negociação → Proposta enviada → Fechamento.

## 4. Execução por sprint

Ordem dentro de cada sprint respeita as dependências do docx (US-02 → US-01 → US-05; US-03 → US-04/US-06; US-06 → US-07/08/09; US-06+08 → US-10).

### Sprint 1 — Fundação (5 pts)

**US-02 Fundação e CI (2)**

- [x] Limpeza da seção 2 (worker, Redis, roles, signup/reset).
- [ ] `/health` público que checa API **e banco** (hoje há `/health/ping` — estender com `SELECT 1`; 503/falha se o banco cair).
- [ ] Validação de env na inicialização (já existe `env.validation.ts` — remover vars de Redis, adicionar `SEED_USER_*`).
- [ ] CI (GitHub Actions): install frozen → `check-types` → `lint` → `test` → `build` (+ deploy via `pnpm run deploy` se houver servidor; senão documentar publicação manual).
- [ ] README: subir local em poucos comandos, testar, publicar (atualizar para refletir o escopo real).
- [ ] Publicar e compartilhar a URL.

**US-01 Autenticação (2)**

- [ ] Já existe signin/signout/validate com JWT em cookie. Revisar contra as RNs: e-mail normalizado (lowercase/trim) (RN1), bcrypt (RN2), erro genérico (RN3), cookie `httpOnly` + `sameSite=lax` + `secure` em prod (RN4), guard em tudo menos login/health (RN5 — considerar guard global com `@Public()`).
- [ ] Seed do usuário inicial por env.
- [ ] Web: tela de login, rota `_app` protegida, 401 limpa estado e redireciona.
- [ ] Testes: credencial válida, inválida (mesma mensagem), sem sessão → 401, logout.

**US-05 Funil fixo (1)**

- [ ] Tabela `stages` + migração; seed idempotente (upsert por `name`/`order`).
- [ ] `GET /stages` (somente leitura, ordenado).
- [ ] Teste: rodar seed 2× não duplica.

**Demo:** app publicada, login/logout, estágios disponíveis.

### Sprint 2 — Contatos e negócios (4 pts)

**US-03 Gerir contatos (1)**

- [ ] Tabela `contacts` + migração; `POST/GET/GET:id/PATCH/DELETE /contacts`.
- [ ] Core: validações RN1–RN3; delete com negócios → **409** (RN4).
- [ ] Web: lista (vazio/carregando/erro), formulário, confirmação de exclusão.
- [ ] Teste do 409.

**US-04 Buscar contatos (1)** _(Could — primeiro a cortar)_

- [ ] `GET /contacts?q=` com `ILIKE` em nome e e-mail; vazio = lista completa.
- [ ] Web: input com debounce + estado "nenhum resultado".

**US-06 CRUD de negócios (2)**

- [ ] Tabela `deals` + enum `deal_status` + migração (FK contato `restrict`, notes `cascade`).
- [ ] `POST/GET(filtros stageId,status)/GET:id/PATCH/DELETE /deals`. Criação: status OPEN, estágio default = 1º, contato deve existir (400/404). PATCH **não** altera status (RN6).
- [ ] Web: lista + formulário, máscara BRL, validação inline.
- [ ] Teste: criar com contato inexistente falha.

**Demo:** criar contato → buscar → abrir negócio ligado a ele.

### Sprint 3 — Funil visual (4 pts)

**US-07 Kanban (3)** — maior risco do projeto

- [ ] Decisão da lib de DnD no primeiro dia (`@dnd-kit`); timebox de 2–3h de spike com toque.
- [ ] `PATCH /deals/:id/stage` — valida estágio destino.
- [ ] Web: `GET /deals?status=OPEN`, colunas por estágio com contagem + soma (calculados no front), cartão (título, valor, contato).
- [ ] Mutation otimista (TanStack Query `onMutate`/rollback + toast de erro). Mesmo estágio = no-op.
- [ ] Ação alternativa "Mover para…" (toque/teclado) — entra junto, não depois.
- [ ] Estado vazio por coluna.

**US-08 Ganho/Perdido (1)**

- [ ] `PATCH /deals/:id/status`: WON/LOST grava `closedAt = now()`; OPEN limpa `closedAt`.
- [ ] Web: ações no cartão e na lista; filtro por status na lista; sai/volta do quadro.
- [ ] Teste das transições OPEN→WON→OPEN→LOST.

**Demo:** arrastar negócio de estágio e marcar como ganho.

### Sprint 4 — Fechamento (3 pts)

**US-09 Notas (1)**

- [ ] Tabela `notes` + migração; `GET/POST /deals/:id/notes`, `DELETE /notes/:id` (403 se não for o autor).
- [ ] Web: página de detalhe do negócio (`/deals/$id`) com timeline (mais recente primeiro), estado vazio, confirmação de exclusão.

**US-10 Painel (2)**

- [ ] `GET /dashboard` com agregações em SQL: abertos (qtd + valor), ganhos do mês (qtd + valor), perdidos do mês (qtd), conversão = ganhos / (ganhos + perdidos), 0 se divisor 0. "Mês" = `closedAt` no mês corrente.
- [ ] Web: cartões simples em BRL, sem gráficos; estados carregando/erro.
- [ ] Testes das fórmulas, incluindo mês sem encerramentos.

**Estabilização**

- [ ] Rodada manual do fluxo completo, ajustes visuais, seed de dados de demonstração, roteiro da apresentação.

## 5. Navegação do web (mínima)

`/login` · `/` (Kanban) · `/deals` (lista) · `/deals/$id` (detalhe + notas) · `/contacts` · `/dashboard`

## 6. Definition of Done para a POC

Mantido do docx, mas enxuto:

- Critérios de aceite (Gherkin) cobertos por teste ou demo.
- `pnpm lint && pnpm check-types && pnpm test && pnpm format:check` verdes.
- Entrada validada na API; erros claros sem vazar detalhes internos; endpoints exigem sessão (exceto login/health).
- Mudanças de banco só por migração.
- Publicado pela esteira e validado.

Relaxamentos aceitáveis numa POC: PR formal com revisão humana pode virar self-review se for time de 1 pessoa (o docx lista como risco R2 — vale ao menos reler o código gerado); sem concorrência no Kanban (RN7: último vence).

## 7. Cortes se o prazo apertar (ordem)

1. US-04 Buscar contatos (Could)
2. US-10 Painel (Should) — manter só abertos + ganhos se necessário
3. US-09 Notas (Should)

Nunca cortar: auth, contatos, negócios, Kanban, ganho/perdido (fluxo ponta a ponta do MVP).

## 8. Riscos principais → ação

| Risco                                                      | Ação                                             |
| ---------------------------------------------------------- | ------------------------------------------------ |
| DnD em toque                                               | `@dnd-kit` + "Mover para…" na mesma história     |
| Integridade contato×negócio                                | FK `restrict` + 409 testado na Sprint 2          |
| Scope creep (a herança do scaffold: roles, signup, worker) | Limpeza explícita na US-02                       |
| Cálculo de indicadores com poucos dados                    | Testar mês vazio; usar `COALESCE` nos somatórios |
| Ambiente/publicação                                        | Fazer deploy "hello world" no dia 1 da Sprint 1  |

## 9. Próximo passo sugerido

Começar pela **US-02**: limpeza do scaffold + `/health` com banco + CI + deploy. Posso executar já essa primeira tarefa, ou gerar issues no Linear a partir deste plano (uma por US) se preferirem delegar.
