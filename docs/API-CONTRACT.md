# MiniCRM — API contract (fonte de verdade para api e web)

Sucesso: `{ "data": <payload> }` (204 sem corpo). Erro: `ApiErrorResponse` de `@mini-crm/contracts` (`message`, `code`). Tudo exige sessão (cookie httpOnly) exceto `POST /auth/signin` e `GET /health/*`. Ids são strings (uuid v7). Datas em ISO. `value` é número (2 casas) na API; no banco `numeric(12,2)`.

Tipos/Zod-ou-DTO/erros ficam em `packages/contracts` (uma pasta por feature), regras em `packages/core`, paths em `packages/routes`.

| Método | Rota | Corpo / query | Resposta | Erros |
| --- | --- | --- | --- | --- |
| GET | /health/ping | — | `{status:"ok", database:"up"}` | 503 se banco fora |
| POST | /auth/signin | `{email,password}` | `{user}` (+cookie) | 401 genérico |
| POST | /auth/signout | — | 204 | 401 |
| GET | /auth/validate | — | `{user}` | 401 |
| GET | /stages | — | `Stage[]` ordenado por `order` | |
| GET | /contacts | `?q=` (nome/e-mail, ILIKE) | `Contact[]` | |
| POST | /contacts | `{name,email?,phone?,company?}` | `Contact` | 400 |
| GET | /contacts/:id | — | `Contact` | 404 |
| PATCH | /contacts/:id | parcial | `Contact` | 400/404 |
| DELETE | /contacts/:id | — | 204 | 404, **409** se tem negócios |
| GET | /deals | `?stageId=&status=OPEN\|WON\|LOST` | `Deal[]` (com `contact:{id,name}`) | |
| POST | /deals | `{title,value,contactId,stageId?}` | `Deal` | 400, 404 contato |
| GET | /deals/:id | — | `Deal` | 404 |
| PATCH | /deals/:id | `{title?,value?,contactId?,stageId?}` (nunca status) | `Deal` | 400/404 |
| PATCH | /deals/:id/stage | `{stageId}` | `Deal` | 404 deal/stage |
| PATCH | /deals/:id/status | `{status}` | `Deal` (ajusta `closedAt`) | 400/404 |
| DELETE | /deals/:id | — | 204 (notas em cascata) | 404 |
| GET | /deals/:id/notes | — | `Note[]` mais recente primeiro | 404 |
| POST | /deals/:id/notes | `{text}` (1–2000) | `Note` | 400/404 |
| DELETE | /notes/:id | — | 204 | 403 se não for autor, 404 |
| GET | /dashboard | — | `DashboardSummary` | |

```ts
Stage   { id, name, order }
Contact { id, name, email|null, phone|null, company|null, createdAt }
Deal    { id, title, value:number, contactId, contact:{id,name}, stageId, status:"OPEN"|"WON"|"LOST", createdAt, closedAt|null }
Note    { id, dealId, authorId, author:{id,name}, text, createdAt }
DashboardSummary { open:{count,value}, won:{count,value}, lost:{count}, conversionRate:number /* 0..1, 0 sem encerramentos */ }  // won/lost = do mês corrente por closedAt
```

Validações: contact.name 1–100; email válido se informado; deal.title 3–100; value ≥ 0; note.text 1–2000.
