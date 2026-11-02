# MiniCRM

CRM para equipes pequenas de vendas: cadastro de contatos, negócios em um funil visual (Kanban), notas e painel de resultados. Projeto acadêmico do curso de Sistemas de Informação da UNILESTE, disciplina **Processo de Produção, Métricas e Qualidade de Software**. Roda **100% local**, sem serviços de terceiros.

> **Avaliador: para rodar do zero, instale Node, pnpm e Docker (seção 2) e execute `pnpm local`.**

## Sumário

1. [Sobre o projeto](#1-sobre-o-projeto)
2. [Como rodar (1 comando)](#2-como-rodar-1-comando)
3. [Funcionalidades](#3-funcionalidades)
4. [Arquitetura](#4-arquitetura)
5. [Qualidade e processo](#5-qualidade-e-processo)
6. [Referência: scripts, variáveis e publicação](#6-referência-scripts-variáveis-e-publicação)
7. [Decisões e limitações conhecidas](#7-decisões-e-limitações-conhecidas)

## 1. Sobre o projeto

### O problema

Equipes pequenas de vendas costumam controlar contatos e oportunidades em planilhas e conversas soltas. O MiniCRM responde a cada dor com uma funcionalidade:

| Dor da equipe                                                | Resposta do MiniCRM                                       |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| Contatos e oportunidades espalhados em planilhas e conversas | Cadastro único de contatos e negócios                     |
| Falta de visão do andamento das vendas                       | Quadro visual com uma coluna por estágio do funil         |
| Dificuldade de saber o que foi ganho ou perdido              | Encerramento do negócio como ganho ou perdido, com painel |
| Informações importantes do negócio se perdem                 | Notas registradas em cada negócio                         |

### Visão e público

> Para equipes pequenas de vendas que precisam sair das planilhas, o MiniCRM é um CRM que organiza contatos e negócios em um funil visual e mostra o resultado das vendas em um painel simples, fácil de usar desde o primeiro acesso.

| Persona                 | Objetivo                                                 | Dor                                    |
| ----------------------- | -------------------------------------------------------- | -------------------------------------- |
| Rafael, dono do negócio | Acompanhar quanto está sendo vendido e o que está parado | Não tem visão consolidada dos negócios |
| Camila, comercial       | Conduzir negócios sem perder informações                 | Contatos e anotações dispersos         |

Há um único papel de acesso (**Usuário**), uma única empresa e um único funil fixo.

### Contexto acadêmico

Entrega da disciplina _Processo de Produção, Métricas e Qualidade de Software_ (UNILESTE, Coronel Fabriciano, 2026): backlog Scrum, 4 sprints semanais, histórias no template padrão e matriz Complexidade x Incerteza. O produto foi construído do zero; o escopo está resumido em [`docs/SCRUM.md`](docs/SCRUM.md).

### Escopo do MVP

10 histórias (16 pontos): autenticação, fundação e CI, contatos, busca, funil fixo, negócios, Kanban com arrastar e soltar, ganho/perdido, notas e painel de resumo (detalhadas na [seção 3](#3-funcionalidades)).

**Fora do escopo (não implementado de propósito):** várias empresas, papéis e permissões, cadastro público, recuperação de senha, gestão de usuários pela interface; pipelines e estágios configuráveis, tags; atividades, tarefas, lembretes, automações, anexos; organizações, avatar, importação e exportação de contatos; agenda, notificações, e-mails; webhooks, chaves de API, UTM, agentes de IA; log de auditoria; tempo real, filas e processamento em segundo plano; internacionalização. Lista completa em [`docs/SCRUM.md`](docs/SCRUM.md#fora-do-escopo-do-mvp).

### Regra de execução local

Sem serviços de terceiros: sem analytics, e-mail, armazenamento externo, CDNs ou fontes remotas (a fonte Inter vem do npm) e sem upload de arquivos. A única infraestrutura é o PostgreSQL local do `compose.yml`.

## 2. Como rodar (1 comando)

### Pré-requisitos

| Ferramenta | Versão                                    | Como instalar                                                                                |
| ---------- | ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| Node.js    | 20 ou mais                                | https://nodejs.org (LTS) ou `nvm install --lts`                                              |
| pnpm       | 12 (o `package.json` fixa `pnpm@12.16.1`) | `corepack enable` (vem com o Node) ou `npm install -g pnpm`; https://pnpm.io/installation    |
| Docker     | com `docker compose` v2 e daemon ativo    | Docker Desktop (Windows/macOS) ou Docker Engine (Linux): https://docs.docker.com/get-docker/ |

Portas livres: `5173` (web), `4353` (API) e `5485` (PostgreSQL, só em 127.0.0.1). É necessário acesso à internet apenas para o `pnpm install` e para baixar a imagem `postgres:18-alpine` na primeira vez.

### Comando

```bash
git clone <url-do-repositorio> mini-crm   # ou descompacte o arquivo entregue
cd mini-crm
pnpm local
```

### O que o `pnpm local` faz

Script `scripts/local.mjs` (Node puro, sem dependências), idempotente, com logs coloridos em português:

1. **Verifica pré-requisitos:** Node >= 20, pnpm, Docker, `docker compose` e daemon ativo. Se algo faltar, mostra como corrigir.
2. **Prepara o `.env`:** se não existir, copia `.env.example` e gera um `JWT_SECRET` aleatório (64 caracteres). Um `.env` existente **nunca é sobrescrito**; só são acrescentadas variáveis ausentes (usuário do seed e login de demonstração) e avisos são exibidos em caso de inconsistência.
3. **Sobe o PostgreSQL** (`docker compose up -d --wait`), aguardando o healthcheck. Se a porta estiver ocupada, explica como trocar.
4. **Instala as dependências** (`pnpm install --frozen-lockfile`, com fallback para `pnpm install`).
5. **Aplica as migrações**, **cria o usuário e os 4 estágios** (seed) e **carrega dados de demonstração** (5 contatos, 8 negócios e 6 notas). Tudo idempotente: rodar de novo não duplica nada.
6. **Inicia web e API** (`pnpm dev`) em primeiro plano, mostra as URLs e o login antes de iniciar e imprime "Pronto!" quando ambos respondem. `Ctrl+C` encerra os dois.

### Acesso

| O quê               | URL                               |
| ------------------- | --------------------------------- |
| Aplicação (web)     | http://localhost:5173             |
| Documentação da API | http://localhost:4353/api-docs    |
| Saúde da API        | http://localhost:4353/health/ping |

**Login de demonstração** (valores padrão do `.env.example`): e-mail `admin@mini-crm.com`, senha `change_me_please`. A tela de login tem o botão **"Preencher credenciais de demonstração"**, que preenche os campos (o botão aparece quando `VITE_DEMO_EMAIL` e `VITE_DEMO_PASSWORD` estão no `.env`; devem ser iguais a `SEED_USER_EMAIL` e `SEED_USER_PASSWORD`).

### Parar, retomar e resetar

| Comando            | Efeito                                                                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Ctrl+C`           | Encerra web e API; o PostgreSQL continua rodando                                                                                                                        |
| `pnpm local:stop`  | Para o PostgreSQL (`docker compose stop`); **os dados são mantidos**                                                                                                    |
| `pnpm local`       | Retoma tudo (idempotente)                                                                                                                                               |
| `pnpm local:setup` | Faz toda a preparação (passos 1 a 5) **sem** iniciar os servidores; depois use `pnpm dev`                                                                               |
| `pnpm local:reset` | **Apaga o banco** (`docker compose down -v`: container e volume). Pede confirmação `y/N`; para pular: `pnpm local:reset -- --yes`. Não remove `.env` nem `node_modules` |

### Problemas comuns

| Sintoma                                                             | Causa provável e solução                                                                                                                                                                            |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "A porta 5485 do PostgreSQL já está em uso"                         | Outro serviço usa a porta. Troque `POSTGRES_PORT` no `.env` **e** a porta em `DATABASE_URL` (devem ser iguais), ou libere a porta (`docker ps`).                                                    |
| "A porta da API (4353) / do front-end (5173) já está em uso"        | Há um `pnpm dev` anterior ou outro programa. Encerre-o. Para a API, `SERVER_PORT`, `API_URL` e `VITE_BASE_API_URL` precisam ser alterados juntos; a porta do front é fixa em 5173 (`FRONTEND_URL`). |
| "O Docker está instalado, mas o daemon não está rodando"            | Abra o Docker Desktop, ou no Linux `sudo systemctl start docker`.                                                                                                                                   |
| "Sem permissão para acessar o Docker" (Linux)                       | `sudo usermod -aG docker $USER` e faça logout/login.                                                                                                                                                |
| Erro de conexão no migrate/seed ou "password authentication failed" | `DATABASE_URL` não bate com `POSTGRES_USER/PASSWORD/PORT/DB`. Se você mudou usuário/senha depois da primeira subida, o volume antigo mantém as credenciais antigas: `pnpm local:reset`.             |
| "pnpm não encontrado" ou aviso de versão do pnpm                    | `corepack enable` e rode de novo; o `packageManager` do projeto fixa a versão 12.16.1.                                                                                                              |
| "JWT_SECRET ... menos de 32 caracteres"                             | Corrija o `.env` (`openssl rand -base64 48`) ou apague o `.env` para gerar outro.                                                                                                                   |
| Quer recomeçar do zero                                              | `pnpm local:reset` e depois `pnpm local` (para refazer também o `.env`, apague-o antes).                                                                                                            |
| Login falha com o botão de demonstração                             | Os valores `VITE_DEMO_*` precisam ser iguais a `SEED_USER_*` **e** o seed ter rodado com eles; o seed não altera um usuário já existente.                                                           |

Sem o script, os mesmos passos estão em [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md#rodar-manualmente-sem-pnpm-local).

## 3. Funcionalidades

Fluxo sugerido para avaliar: entrar com o botão de demonstração, olhar o **Quadro**, arrastar um cartão, abrir um negócio e registrar uma nota, encerrar um negócio como ganho e ver o **Painel**.

| História | Módulo e tela              | Como usar                                                                                                                         | Regras principais                                                                                                                                                                                    |
| -------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-01    | **Login** (`/login`)       | E-mail e senha; "Sair" encerra a sessão. Telas protegidas redirecionam ao login.                                                  | E-mail normalizado (minúsculo, sem espaços); senha com hash bcrypt; mensagem de erro genérica; cookie httpOnly; tudo exige sessão exceto login e saúde                                               |
| US-02    | **Fundação**               | Projeto, CI, `/health/ping`, validação de variáveis na inicialização, README.                                                     | API recusa iniciar com variável obrigatória ausente; `/health/ping` responde 503 se o banco cair                                                                                                     |
| US-03    | **Contatos** (`/contacts`) | Lista, criar, editar e excluir (com confirmação).                                                                                 | Nome obrigatório (até 100); e-mail (válido) e telefone opcionais; empresa livre; excluir contato com negócios retorna **409**                                                                        |
| US-04    | **Busca de contatos**      | Campo de busca na lista, filtra enquanto digita.                                                                                  | Por nome ou e-mail, sem diferenciar maiúsculas, por trecho (`ILIKE`); campo vazio mostra tudo; debounce de 300 ms; estado "nenhum resultado"                                                         |
| US-05    | **Funil fixo**             | Estágios "Novo lead", "Em negociação", "Proposta enviada", "Fechamento" já existem.                                               | Fixos e somente leitura (`GET /stages`); seed idempotente                                                                                                                                            |
| US-06    | **Negócios** (`/deals`)    | Lista com filtro por status (Todos/Abertos/Ganhos/Perdidos) e por estágio; criar, editar e excluir.                               | Título 3 a 100; valor >= 0 com 2 casas (máscara BRL); contato obrigatório e existente; nasce Aberto no 1º estágio (ou o escolhido); editar não muda status; excluir remove as notas, com confirmação |
| US-07    | **Quadro Kanban** (`/`)    | Uma coluna por estágio com quantidade e soma; arraste os cartões entre colunas ou use o menu **"Mover para…"** (toque e teclado). | Só negócios Abertos; soltar no mesmo estágio não faz nada; atualização otimista com reversão e aviso se a API falhar; sem controle de concorrência (último vence)                                    |
| US-08    | **Ganho / Perdido**        | Ações no cartão, na lista e no detalhe; "Reabrir" volta o negócio ao quadro.                                                      | Grava `closedAt` ao ganhar/perder e apaga ao reabrir; encerrados continuam na lista                                                                                                                  |
| US-09    | **Notas** (`/deals/:id`)   | Detalhe do negócio com linha do tempo (mais recente primeiro), adicionar e excluir nota (com confirmação).                        | Texto 1 a 2000; guarda autor e data; só o autor exclui (403 para outro); sem edição                                                                                                                  |
| US-10    | **Painel** (`/dashboard`)  | Cartões do mês atual em reais.                                                                                                    | Abertos (qtd e valor), ganhos do mês (qtd e valor), perdidos do mês, taxa de conversão = ganhos / (ganhos + perdidos), 0 sem encerramentos                                                           |

Extras de interface: tema claro ou escuro conforme o sistema operacional, estados vazios com próxima ação e uma checklist "Primeiros passos" na tela inicial (complemento de usabilidade, derivada dos dados já carregados; ver nota em [`docs/SCRUM.md`](docs/SCRUM.md#fora-do-escopo-do-mvp)).

## 4. Arquitetura

```mermaid
graph LR
    web["apps/web<br/>React SPA"] -->|"HTTP + cookie httpOnly"| api["apps/api<br/>NestJS"]
    api --> core["packages/core<br/>regras de negócio"]
    core --> database["packages/database<br/>Drizzle + PostgreSQL"]
    web -.-> contracts["packages/contracts<br/>tipos, schemas Zod, erros"]
    api -.-> contracts
    core -.-> contracts
    web -.-> routes["packages/routes<br/>paths da API"]
    api -.-> routes
```

A interface fala somente com a API; a API autentica, valida e delega; apenas `core` acessa o banco. Não há filas, tempo real nem processamento em segundo plano.

| Pacote               | Papel                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| `apps/web`           | SPA React: rotas, telas e estado de servidor (TanStack Query)                                    |
| `apps/api`           | API HTTP NestJS: controllers, guard global de sessão, validação Zod, filtro de erros, Swagger    |
| `packages/core`      | Domínio por feature (`repository` + `service`): regras como 409 de contato, `closedAt`, métricas |
| `packages/database`  | Schema Drizzle, migrações SQL, seeds (`seed.ts`, `seed-demo.ts`)                                 |
| `packages/contracts` | Fonte única de tipos, schemas Zod e classes de erro compartilhados entre web, API e core         |
| `packages/routes`    | Constantes dos paths da API compartilhadas entre quem define e quem chama                        |
| `packages/config/*`  | Presets de tsconfig, ESLint, Prettier e Vitest                                                   |

Detalhes por parte em [`docs/architecture`](docs/architecture/README.md).

### Stack e motivos

| Camada        | Tecnologia                                          | Por quê                                                                                                          |
| ------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Monorepo      | pnpm + Turborepo                                    | Um repositório para web, API e pacotes compartilhados; builds e testes em cache e na ordem certa de dependência  |
| Front-end     | React 19, Vite, TypeScript                          | SPA simples e rápida de desenvolver, como sugerido no escopo                                                     |
| UI            | Tailwind CSS 4, shadcn/ui, Base UI, lucide          | Componentes acessíveis e consistentes sem escrever CSS do zero; tudo empacotado localmente                       |
| Rotas e dados | TanStack Router e Query                             | Rotas tipadas por arquivo; cache de servidor e atualização otimista no Kanban                                    |
| Formulários   | React Hook Form + Zod                               | Mesmo schema Zod de `contracts` valida front e API                                                               |
| Arrastar      | `@dnd-kit/core`                                     | Suporte a mouse, toque e teclado (risco R4 do escopo)                                                            |
| API           | NestJS 12, Helmet, cookie-parser, Swagger           | Estrutura modular, guard global e documentação OpenAPI em `/api-docs`. **Desvio do escopo**, que sugeria Express |
| Validação     | Zod (`nestjs-zod`)                                  | Como sugerido no escopo                                                                                          |
| Banco         | PostgreSQL 18, Drizzle ORM e drizzle-kit            | Migrações versionadas em SQL e tipagem ponta a ponta. **Desvio do escopo**, que sugeria Prisma                   |
| Autenticação  | bcryptjs + JWT em cookie httpOnly                   | Hash forte de senha e sessão sem estado no servidor                                                              |
| Qualidade     | Vitest, supertest, ESLint, Prettier, GitHub Actions | Testes e2e da API contra banco real, análise estática e formatação (como no escopo)                              |
| Execução      | Docker Compose (só o PostgreSQL)                    | O avaliador não precisa instalar nem configurar banco                                                            |

O escopo admite alternativas justificadas ("qualquer alternativa deve ser justificada"); a decisão de manter NestJS e Drizzle está em [`docs/PLANO-EXECUCAO.md`](docs/PLANO-EXECUCAO.md#1-decisões-de-stack-scaffold-vence-a-sugestão-do-docx).

### Estrutura do repositório

```text
.
├── apps/
│   ├── api/                      # NestJS (porta 4353)
│   │   └── src/
│   │       ├── main.ts, app.module.ts, configure-app.ts
│   │       ├── config/env.validation.ts
│   │       ├── common/           # decorator @Public, filtro de erros, interceptor { data }
│   │       └── features/         # auth, stages, contacts, deals, notes, dashboard (+ __tests__ e2e)
│   └── web/                      # Vite + React (porta 5173)
│       └── src/
│           ├── routes/           # rotas por arquivo (TanStack Router)
│           ├── features/         # auth, contacts, deals, kanban, dashboard, onboarding
│           ├── components/       # ui (shadcn), fields (RHF), layout, common, providers
│           └── lib/              # cliente da API, queryClient, formatação
├── packages/
│   ├── contracts/                # tipos, schemas Zod e erros por feature
│   ├── core/                     # repository + service por feature
│   ├── database/                 # schema Drizzle, migrations/, seed.ts, seed-demo.ts
│   ├── routes/                   # constantes de paths (ApiRoutes)
│   └── config/                   # eslint, prettier, tsconfig, vitest
├── docs/                         # API-CONTRACT, SCRUM, DEVELOPMENT, PLANO-EXECUCAO, architecture/
├── scripts/local.mjs             # setup de 1 comando (pnpm local)
├── compose.yml                   # PostgreSQL 18 (127.0.0.1:5485)
├── ecosystem.config.js           # PM2 (somente a API)
├── .github/workflows/ci.yml      # CI
├── .env.example                  # modelo de variáveis
└── turbo.json, pnpm-workspace.yaml, prettier.config.cjs
```

### Modelo de dados

```mermaid
erDiagram
    USERS ||--o{ NOTES : "escreve"
    CONTACTS ||--o{ DEALS : "tem (RESTRICT)"
    STAGES ||--o{ DEALS : "contém"
    DEALS ||--o{ NOTES : "tem (CASCADE)"

    USERS {
        text id PK "uuid v7"
        varchar name
        varchar email UK
        text password "hash bcrypt"
        timestamp created_at
        timestamp updated_at
    }
    STAGES {
        text id PK
        varchar name
        int order UK "posição 1 a 4"
    }
    CONTACTS {
        text id PK
        varchar name "ate 100"
        varchar email "opcional"
        varchar phone "opcional"
        varchar company "opcional"
        timestamp created_at
    }
    DEALS {
        text id PK
        varchar title "3 a 100"
        numeric value "12,2"
        text contact_id FK
        text stage_id FK
        enum status "OPEN, WON, LOST"
        timestamp created_at
        timestamp closed_at "nulo se aberto"
    }
    NOTES {
        text id PK
        text deal_id FK
        text author_id FK
        varchar text "ate 2000"
        timestamp created_at
    }
```

Excluir um contato com negócios é bloqueado pelo banco (`RESTRICT`) e a API devolve 409; excluir um negócio remove suas notas (`CASCADE`).

### API

Resposta de sucesso: `{ "data": ... }` (204 sem corpo). Erros: `{ message, code }`. Tudo exige sessão, exceto `POST /auth/signin` e `GET /health/ping`. Contrato completo em [`docs/API-CONTRACT.md`](docs/API-CONTRACT.md); documentação interativa em `/api-docs` (rotas conferidas com os controllers).

| Método | Rota                      | Descrição                                    | Erros    |
| ------ | ------------------------- | -------------------------------------------- | -------- |
| GET    | `/health/ping`            | Saúde da API e do banco (público)            | 503      |
| POST   | `/auth/signin`            | Login; define o cookie de sessão (público)   | 401      |
| POST   | `/auth/signout`           | Encerra a sessão (204)                       | 401      |
| GET    | `/auth/validate`          | Usuário da sessão atual                      | 401      |
| GET    | `/stages`                 | Estágios em ordem                            |          |
| GET    | `/contacts?q=`            | Lista/busca contatos                         |          |
| POST   | `/contacts`               | Cria contato                                 | 400      |
| GET    | `/contacts/:id`           | Detalhe                                      | 404      |
| PATCH  | `/contacts/:id`           | Edita                                        | 400, 404 |
| DELETE | `/contacts/:id`           | Exclui (204)                                 | 404, 409 |
| GET    | `/deals?stageId=&status=` | Lista com filtros (`OPEN`, `WON`, `LOST`)    |          |
| POST   | `/deals`                  | Cria negócio                                 | 400, 404 |
| GET    | `/deals/:id`              | Detalhe                                      | 404      |
| PATCH  | `/deals/:id`              | Edita (nunca o status)                       | 400, 404 |
| PATCH  | `/deals/:id/stage`        | Muda de estágio                              | 404      |
| PATCH  | `/deals/:id/status`       | Ganho, perdido ou aberto (ajusta `closedAt`) | 400, 404 |
| DELETE | `/deals/:id`              | Exclui com as notas (204)                    | 404      |
| GET    | `/deals/:id/notes`        | Notas, mais recente primeiro                 | 404      |
| POST   | `/deals/:id/notes`        | Cria nota                                    | 400, 404 |
| DELETE | `/notes/:id`              | Exclui nota própria (204)                    | 403, 404 |
| GET    | `/dashboard`              | Indicadores do mês                           |          |

### Autenticação e sessão

- Login em `POST /auth/signin`: o e-mail é normalizado, a senha é comparada com o hash bcrypt (custo 10) e a falha devolve sempre o mesmo 401 genérico.
- A API emite um JWT (`{ id }`, expira em 30 dias) guardado no cookie `access_token`: `httpOnly`, `sameSite=lax`, `secure` apenas quando `NODE_ENV=production`, validade de 30 dias.
- Um `AuthGuard` global exige sessão em todas as rotas, exceto as marcadas com `@Public()` (login e saúde). Aceita o cookie ou `Authorization: Bearer`, o que permite testar pelo Swagger.
- Na web, a rota `_app` valida a sessão (`/auth/validate`) antes de renderizar; um 401 em qualquer chamada limpa o estado e leva ao login.
- Não há cadastro, papéis ou recuperação de senha: o único usuário vem do seed (`SEED_USER_*`).

### Regras de negócio-chave

- Negócio novo: status `OPEN`, primeiro estágio por padrão, contato precisa existir.
- Mudança de status é uma operação própria (`PATCH /deals/:id/status`); o `PATCH` comum não a aceita.
- `closedAt` é gravado ao marcar ganho/perdido e apagado ao reabrir.
- O Kanban mostra só negócios `OPEN`; totais por coluna calculados no front a partir dos negócios carregados.
- O painel é uma única consulta SQL com agregados condicionais; "do mês" usa `closedAt` dentro do mês corrente.
- Seeds idempotentes: usuário criado só se não existir; estágios por `upsert` na coluna `order`; demo ignorada se o primeiro contato demo já existe.

## 5. Qualidade e processo

### Testes e verificações

```bash
pnpm test           # precisa de banco no ar, migrado e com seed (pnpm local:setup)
pnpm lint
pnpm check-types
pnpm format:check
pnpm build
```

- **47 testes** em 10 arquivos: 38 e2e da API (auth, contatos, negócios e transições, notas, estágios, painel, saúde), 1 de idempotência do seed e 8 de funções puras do front (Kanban e formatação). Cobertura detalhada em [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md#testes).
- Os testes da API usam o banco do `.env`; cada suíte remove o que cria, então os dados de demonstração permanecem.
- **CI:** `.github/workflows/ci.yml` roda install, tipos, lint, formatação, migração e seed, testes e build. Ver a limitação sobre sua execução abaixo.

### Scrum

Resumo dos artefatos (detalhes em [`docs/SCRUM.md`](docs/SCRUM.md)):

| Sprint | Período       | Histórias           | Pts |
| ------ | ------------- | ------------------- | --- |
| 1      | 26/10 a 30/10 | US-02, US-01, US-05 | 5   |
| 2      | 02/11 a 06/11 | US-03, US-04, US-06 | 4   |
| 3      | 09/11 a 13/11 | US-07, US-08        | 4   |
| 4      | 16/11 a 20/11 | US-09, US-10        | 3   |

Esforço pela matriz Complexidade x Incerteza (Fibonacci): 1 ponto para US-03, 04, 05, 08, 09; 2 pontos para US-01, 02, 06, 10; 3 pontos para US-07 (única com incerteza Média). Total: 16 pontos. A [DoR e a DoD globais](docs/SCRUM.md#definition-of-ready-e-definition-of-done) e o backlog completo estão em `docs/SCRUM.md`. O plano técnico por sprint e seu status estão em [`docs/PLANO-EXECUCAO.md`](docs/PLANO-EXECUCAO.md).

## 6. Referência: scripts, variáveis e publicação

### Scripts da raiz

| Comando             | O que faz                                                |
| ------------------- | -------------------------------------------------------- |
| `pnpm local`        | Setup completo e inicia web + API                        |
| `pnpm local:setup`  | Setup completo sem iniciar os servidores                 |
| `pnpm local:stop`   | Para o PostgreSQL mantendo os dados                      |
| `pnpm local:reset`  | Apaga o banco (confirmação; `-- --yes` pula)             |
| `pnpm dev`          | Web e API em modo watch                                  |
| `pnpm build`        | Build de todos os pacotes e apps                         |
| `pnpm lint`         | ESLint                                                   |
| `pnpm check-types`  | TypeScript                                               |
| `pnpm test`         | Testes (Vitest)                                          |
| `pnpm format`       | Prettier, corrige                                        |
| `pnpm format:check` | Prettier, só verifica                                    |
| `pnpm run deploy`   | `git pull`, install, migrações, build e PM2 (ver abaixo) |

### Scripts do banco (`@mini-crm/database`)

Uso: `pnpm --filter @mini-crm/database <script>`.

| Script               | O que faz                                           |
| -------------------- | --------------------------------------------------- |
| `db:generate <nome>` | Gera uma migração a partir do schema                |
| `db:migrate`         | Aplica migrações (desenvolvimento)                  |
| `db:deploy`          | Aplica migrações (produção; mesmo comando)          |
| `db:seed`            | Cria o usuário (`SEED_USER_*`) e os 4 estágios      |
| `db:seed:demo`       | Contatos, negócios e notas de exemplo (idempotente) |
| `db:studio`          | Drizzle Studio                                      |

### Variáveis de ambiente (`.env`)

| Variável                                                  | Padrão (`.env.example`)                                  | Uso                                                          |
| --------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| `SERVER_PORT`                                             | `4353`                                                   | Porta da API (obrigatória)                                   |
| `JWT_SECRET`                                              | gerado pelo `pnpm local`                                 | Segredo do JWT, mínimo 32 caracteres (obrigatória)           |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`       | `mini-crm`, `postgres`, `postgres`                       | Credenciais do container PostgreSQL                          |
| `POSTGRES_PORT`                                           | `5485`                                                   | Porta publicada em 127.0.0.1                                 |
| `DATABASE_URL`                                            | `postgresql://postgres:postgres@127.0.0.1:5485/mini-crm` | Deve bater com as quatro variáveis acima (obrigatória)       |
| `FRONTEND_URL`                                            | `http://localhost:5173`                                  | Origem permitida no CORS (obrigatória)                       |
| `API_URL`                                                 | `http://localhost:4353`                                  | Usada pelo script local para o teste de prontidão e os links |
| `SEED_USER_NAME`, `SEED_USER_EMAIL`, `SEED_USER_PASSWORD` | `Admin`, `admin@mini-crm.com`, `change_me_please`        | Usuário criado pelo `db:seed`                                |
| `VITE_BASE_API_URL`                                       | `http://localhost:4353`                                  | URL da API usada pelo front (embutida no build)              |
| `VITE_DEMO_EMAIL`, `VITE_DEMO_PASSWORD`                   | iguais ao seed                                           | Botão de demonstração no login (remova para ocultá-lo)       |

O `.env` está no `.gitignore`. O Turborepo trata o `.env` como dependência global de cache.

### Publicação (PM2)

`pnpm run deploy` executa `git pull && pnpm install && db:deploy && pnpm build && pm2 startOrReload ecosystem.config.js`. O `ecosystem.config.js` define um único processo, `mini-crm:api` (`pnpm start` em `apps/api`); o worker foi removido na limpeza de escopo. Foi verificado que o build gera a API e que `pnpm start` a coloca no ar respondendo `/health/ping`; **a execução do PM2 em si não foi testada** (não instalado no ambiente de desenvolvimento) e o `git pull` exige um remoto configurado. O front (`apps/web/dist`) é estático e deve ser servido à parte, com `VITE_BASE_API_URL` definido no build. Detalhes em [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md#publicação-deploy).

## 7. Decisões e limitações conhecidas

Registradas de forma transparente, conferidas no código:

| Tema                                   | Situação                                                                                                                                                                                      |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duração da sessão                      | O JWT expira em 30 dias (igual ao cookie). Antes estava sem expiração; corrigido. Não há revogação no servidor: o logout só apaga o cookie                                                    |
| Token também no corpo do login         | `POST /auth/signin` devolve `{ user, token }` além do cookie, para permitir `Authorization: Bearer` (usado nos testes e no Swagger). A web ignora o token e depende apenas do cookie httpOnly |
| Cookie `secure` só em produção         | Em `localhost` via HTTP o cookie não é `secure`; em produção é preciso HTTPS                                                                                                                  |
| Mês do painel em UTC                   | "Do mês" usa os limites do mês em UTC; negócios encerrados nas últimas horas de um mês no fuso do Brasil (UTC-3) podem aparecer no mês seguinte. Aceito no MVP                                |
| Sem controle de concorrência no Kanban | Último a mover vence (RN7 do escopo); não há bloqueio otimista nem tempo real                                                                                                                 |
| Sem proteção contra força bruta        | Não há limite de tentativas de login (fora do escopo do MVP)                                                                                                                                  |
| Senha de demonstração                  | `change_me_please` é intencionalmente simples para a avaliação; troque `SEED_USER_*` antes de qualquer uso real (o seed não altera um usuário existente)                                      |
| CI nunca executou no GitHub            | O repositório não tem remoto configurado; o workflow foi escrito mas não rodou lá. Os mesmos comandos passam localmente                                                                       |
| Itens da DoD que dependem de equipe    | Pull request, publicação pela esteira e aceite do PO não são demonstráveis neste repositório                                                                                                  |
| Desvios de stack                       | NestJS e Drizzle no lugar de Express e Prisma, justificados na seção 4                                                                                                                        |
| Listas sem paginação                   | Contatos e negócios são carregados por inteiro; adequado ao volume do MVP                                                                                                                     |
