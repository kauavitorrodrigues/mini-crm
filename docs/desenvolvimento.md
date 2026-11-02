# MiniCRM: guia de desenvolvimento

Complemento técnico do [leia-me](../leia-me.md): rodar sem o script, testes, CI, publicação e como estender o projeto.

## Sumário

- [Rodar manualmente (sem `pnpm local`)](#rodar-manualmente-sem-pnpm-local)
- [Testes](#testes)
- [Qualidade estática](#qualidade-estática)
- [CI](#ci)
- [Publicação (deploy)](#publicação-deploy)
- [Como adicionar uma feature](#como-adicionar-uma-feature)
- [Migrações](#migrações)

## Rodar manualmente (sem `pnpm local`)

`pnpm local` automatiza exatamente estes passos (em `scripts/local.mjs`):

```bash
cp .env.example .env              # troque JWT_SECRET: openssl rand -base64 48
docker compose up -d --wait       # PostgreSQL em 127.0.0.1:5485
pnpm install --frozen-lockfile
pnpm --filter @mini-crm/database db:migrate
pnpm --filter @mini-crm/database db:seed
pnpm --filter @mini-crm/database db:seed:demo   # opcional: contatos, negócios e notas de exemplo
pnpm dev                          # web :5173 e API :4353
```

Todos os scripts leem o `.env` da raiz (via `dotenv-cli`), então não é preciso exportar variáveis.

## Testes

```bash
pnpm test                         # todos os pacotes, via Turborepo
pnpm --filter api test            # só a API
```

- **Pré-requisito:** banco de dados no ar, migrado e com seed (`pnpm local:setup` resolve). Os testes da API são **end-to-end** (Nest `Test` + `supertest`) e usam o banco do `DATABASE_URL` do `.env`; cada suíte cria os próprios registros e os remove ao final, então os dados de demonstração não são alterados.
- **API (`apps/api`):** `auth` (login válido e inválido com mensagem genérica, normalização de e-mail, cookie httpOnly/SameSite=Lax, ciclo signin -> validate -> signout, 401 sem sessão), `contacts` (CRUD, validação 400, 404, busca ILIKE, 409 ao excluir contato com negócios), `deals` (criação com padrões, contato ou estágio inexistente, filtros, PATCH que nunca altera status, mudança de estágio e transições OPEN -> WON -> OPEN -> LOST ajustando `closedAt`), `notes` (ordem, autor, 400/404, 403 para outro autor, cascata ao excluir negócio), `stages` (4 estágios ordenados), `dashboard` (fórmulas, mês sem encerramentos, negócios de outro mês) e `health` (público, 503 com banco fora).
- **Banco (`packages/database`):** o seed de estágios é idempotente (rodar duas vezes não duplica).
- **Web (`apps/web`):** funções puras do quadro Kanban (colunas, totais sem erro de ponto flutuante, mover e reverter) e formatação BRL/percentual.
- Os pacotes `core`, `contracts` e `routes` não têm testes próprios; suas regras são exercidas pelos testes e2e da API.

## Qualidade estática

```bash
pnpm lint            # ESLint (regra extra: importar @mini-crm/contracts só pela raiz do pacote)
pnpm check-types     # tsc em todos os pacotes
pnpm format:check    # Prettier (md, mjs, ts, json...); pnpm format corrige
pnpm build           # build de todos os pacotes (API com tsup, web com tsc + vite)
```

O `pnpm lint` do front pode exibir avisos `react-refresh/only-export-components` (não são erros).

## CI

`.github/workflows/ci.yml` (push na `main` e pull requests): sobe um PostgreSQL 18 como _service container_, instala com `--frozen-lockfile`, roda `check-types`, `lint`, `format:check`, aplica migrações e seed, roda `test` e `build`. **Não há etapa de publicação automática.** O repositório local não tem remoto GitHub configurado, então o workflow nunca foi executado de fato; os mesmos comandos foram executados localmente.

## Publicação (deploy)

O projeto é 100% local para a avaliação; este fluxo existe apenas como referência para um servidor próprio.

```bash
pnpm run deploy   # git pull && pnpm install && db:deploy && pnpm build && pm2 startOrReload ecosystem.config.js
```

- Requer Git com remoto, PM2 instalado no servidor (`npm i -g pm2`), `.env` de produção e PostgreSQL acessível.
- `ecosystem.config.js` define **um único processo**, `mini-crm:api`, que executa `pnpm start` em `apps/api` (`node dist/main.js` com o `.env` carregado). Não há mais processo worker.
- Verificado: `pnpm build` seguido de `pnpm start` em `apps/api` sobe a API e `GET /health/ping` responde `{"status":"ok","database":"up"}`. A chamada ao PM2 em si não foi executada neste ambiente (PM2 não instalado).
- O front (`apps/web/dist`) é estático e precisa ser servido por outro servidor (nginx, caddy etc.), com `VITE_BASE_API_URL` apontando para a API **no momento do build**. Em produção, defina `NODE_ENV=production` (cookie `secure`, exige HTTPS) e `FRONTEND_URL` com a origem real do front (CORS).

## Como adicionar uma feature

Siga a regra de camadas `web -> api -> core -> database`:

1. Schema Drizzle em `packages/database/src/schema/` e migração (`db:generate <nome>`).
2. Tipos, schemas Zod e erros em `packages/contracts/src/<feature>/`.
3. Repositório e serviço em `packages/core/src/features/<feature>/` (as regras de negócio ficam aqui).
4. Paths em `packages/routes/src/routes/api.ts`.
5. Controller e módulo em `apps/api/src/features/<feature>/` (global `AuthGuard`: use `@Public()` só quando necessário) e teste e2e.
6. Telas em `apps/web/src/features/<feature>/` e rota em `apps/web/src/routes/`.

Detalhes por pacote em [`arquitetura/`](arquitetura/leia-me.md).

## Migrações

```bash
pnpm --filter @mini-crm/database db:generate <nome>   # gera SQL em packages/database/migrations
pnpm --filter @mini-crm/database db:migrate           # aplica (dev)
pnpm --filter @mini-crm/database db:deploy            # aplica (produção; mesmo comando do drizzle-kit)
pnpm --filter @mini-crm/database db:studio            # navegador de dados (Drizzle Studio)
```

Migrações existentes: `0000_init` (usuários e estágios), `0001_contacts_and_deals` (contatos e negócios) e `0002_notes`.
