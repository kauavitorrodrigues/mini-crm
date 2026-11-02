# MiniCRM: resumo de Scrum

Resumo dos artefatos de Scrum da entrega da disciplina _Processo de Produção, Métricas e Qualidade de Software_ (UNILESTE, Sistemas de Informação). O documento de entrega da disciplina detalha o escopo completo (histórias no template, critérios de aceite em Gherkin, riscos e dependências). Este arquivo condensa o que é necessário para avaliar o produto; o status de execução técnica está em [`plano-execucao.md`](plano-execucao.md).

## Sumário

- [Product Backlog e matriz Complexidade x Incerteza](#product-backlog-e-matriz-complexidade-x-incerteza)
- [Sprints](#sprints)
- [Definition of Ready e Definition of Done](#definition-of-ready-e-definition-of-done)
- [Regras de negócio por história](#regras-de-negócio-por-história)
- [Fora do escopo do MVP](#fora-do-escopo-do-mvp)
- [Riscos](#riscos)

## Product Backlog e matriz Complexidade x Incerteza

Prioridade por MoSCoW (M = Must, S = Should, C = Could). O esforço (pontos de história, Fibonacci) é derivado da matriz, nunca estimado "no olho".

| Complexidade \ Incerteza | Baixa | Média | Alta |
| ------------------------ | ----- | ----- | ---- |
| **Baixa**                | 1     | 2     | 3    |
| **Média**                | 2     | 3     | 5    |
| **Alta**                 | 5     | 8     | 13   |

Faixas de ação: 1 a 2 pontos, executar direto; 3, atenção a dúvidas pontuais; 5, alinhar a abordagem antes; 8 a 13, spike obrigatório e fatiamento.

| ID    | Épico                | História                            | Prior. | Compl. | Incert. | Pts | Sprint |
| ----- | -------------------- | ----------------------------------- | ------ | ------ | ------- | --- | ------ |
| US-01 | A. Fundação e acesso | Autenticar com e-mail e senha       | M      | Média  | Baixa   | 2   | 1      |
| US-02 | A. Fundação e acesso | Fundação do projeto e entrega cont. | M      | Média  | Baixa   | 2   | 1      |
| US-03 | B. Contatos          | Gerir contatos                      | M      | Baixa  | Baixa   | 1   | 2      |
| US-04 | B. Contatos          | Buscar contatos                     | C      | Baixa  | Baixa   | 1   | 2      |
| US-05 | C. Funil e negócios  | Funil fixo com estágios padrão      | M      | Baixa  | Baixa   | 1   | 1      |
| US-06 | C. Funil e negócios  | Criar, editar e excluir negócios    | M      | Média  | Baixa   | 2   | 2      |
| US-07 | C. Funil e negócios  | Quadro Kanban com arrastar e soltar | M      | Média  | Média   | 3   | 3      |
| US-08 | C. Funil e negócios  | Marcar negócio como ganho/perdido   | M      | Baixa  | Baixa   | 1   | 3      |
| US-09 | C. Funil e negócios  | Notas no negócio                    | S      | Baixa  | Baixa   | 1   | 4      |
| US-10 | D. Painel            | Painel de resumo                    | S      | Média  | Baixa   | 2   | 4      |
|       |                      | **Total**                           |        |        |         | 16  |        |

Distribuição por nível de esforço: 1 ponto (US-03, 04, 05, 08, 09) = 5 pts; 2 pontos (US-01, 02, 06, 10) = 8 pts; 3 pontos (US-07) = 3 pts. Nenhuma história tem complexidade ou incerteza Alta; a única incerteza Média é o Kanban (biblioteca de arrastar e soltar, toque, atualização otimista com reversão).

Resumo por épico: A (2 histórias, 4 pts), B (2, 2 pts), C (5, 8 pts), D (1, 2 pts).

## Sprints

Quatro sprints semanais (segunda a sexta), capacidade de referência de cerca de 5 pontos por sprint.

| Sprint | Período       | Meta                                                   | Histórias           | Pts |
| ------ | ------------- | ------------------------------------------------------ | ------------------- | --- |
| 1      | 26/10 a 30/10 | Fundação: projeto, login e estágios do funil           | US-02, US-01, US-05 | 5   |
| 2      | 02/11 a 06/11 | Contatos e negócios: cadastrar, buscar, abrir negócios | US-03, US-04, US-06 | 4   |
| 3      | 09/11 a 13/11 | Funil visual: Kanban e encerramento de negócios        | US-07, US-08        | 4   |
| 4      | 16/11 a 20/11 | Fechamento: notas, painel de resumo e estabilização    | US-09, US-10        | 3   |

Maior risco por sprint: ambiente e publicação (1), integridade contato x negócio (2), arrastar e soltar (3), cálculo dos indicadores (4).

## Definition of Ready e Definition of Done

**DoR global.** Uma história só entra em sprint quando: está no template com os seis blocos obrigatórios (descrição, regras de negócio, DoR, DoD, critérios de aceite em Gherkin, abordagem técnica); tem critérios de aceite revisados com o PO; tem complexidade, incerteza e esforço definidos pela matriz; suas dependências estão concluídas ou planejadas antes; riscos de incerteza Alta têm spike; cabe em uma sprint (até 13 pontos); e não inclui nada fora do MVP.

**DoD global.** Uma história só é "Pronta" quando: os critérios de aceite passam (teste automatizado ou demonstração); há testes automatizados para regras de negócio e endpoints novos; tipos, estilo e formatação passam; toda entrada é validada na API e erros não expõem detalhes internos; endpoints novos exigem sessão (exceto login e saúde); mudanças de banco são migrações versionadas; houve revisão de código e integração na linha principal; a publicação pela esteira foi validada; e a história foi demonstrada e aceita pelo PO.

Como isso aparece no repositório: testes e2e por feature em `apps/api/src/features/*/__tests__`, `pnpm lint`/`check-types`/`format:check` e migrações em `packages/database/migrations`. Os itens "publicação pela esteira" e "pull request" dependem de um remoto GitHub, que este repositório ainda não tem (ver [Limitações no README](../README.md#7-decisões-e-limitações-conhecidas)).

## Regras de negócio por história

| História            | Regras principais (RN)                                                                                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-01 Autenticação  | E-mail normalizado; senha só como hash; erro de login genérico; cookie httpOnly, sameSite=lax e secure em produção; tudo exige sessão exceto login e saúde                                                |
| US-02 Fundação      | Sobe localmente com poucos comandos; segredos em variáveis de ambiente; env validado na inicialização; `/health/ping` público e checa o banco; esteira de CI                                              |
| US-03 Contatos      | Nome obrigatório (até 100); e-mail e telefone opcionais (e-mail válido); empresa texto livre; contato com negócios não pode ser excluído (409); exclusão com confirmação                                  |
| US-04 Busca         | Por nome e e-mail, sem diferenciar maiúsculas, por trecho; vazio devolve tudo; consulta com debounce                                                                                                      |
| US-05 Funil         | Estágios fixos "Novo lead", "Em negociação", "Proposta enviada", "Fechamento"; seed idempotente; somente leitura na API                                                                                   |
| US-06 Negócios      | Título 3 a 100; valor >= 0 com 2 casas; contato obrigatório e existente; estágio inicial = primeiro; nasce Aberto; edição não altera status; excluir remove as notas, com confirmação                     |
| US-07 Kanban        | Só negócios Abertos; coluna com nome, quantidade e soma; cartão com título, valor e contato; soltar no mesmo estágio não faz nada; atualização otimista com reversão; "Mover para…"; último a mover vence |
| US-08 Ganho/Perdido | Status Aberto, Ganho, Perdido; ganho/perdido grava a data de encerramento; reabrir apaga a data; encerrados continuam na lista, com filtro por status                                                     |
| US-09 Notas         | Texto 1 a 2000; guarda autor e data; só o autor exclui (403 para outro); sem edição; exclusão com confirmação                                                                                             |
| US-10 Painel        | Abertos (qtd e valor), ganhos do mês (qtd e valor), perdidos do mês (qtd), conversão = ganhos / (ganhos + perdidos), 0 sem encerramentos; valores em BRL                                                  |

## Fora do escopo do MVP

Não implementado e proibido sem aprovação do Product Owner:

- **Multiempresa e acesso:** várias empresas, papéis e permissões, cadastro público, recuperação de senha, gestão de usuários pela interface.
- **Funil:** pipelines e estágios configuráveis, modelos de funil, tags.
- **Negócios:** atividades e tarefas, lembretes, automações, histórico automático, anexos.
- **Contatos:** organizações, avatar, importação e exportação.
- **Agenda e comunicação:** agenda, integração com calendário, notificações, e-mails.
- **Integrações:** webhooks, chaves de API, rastreamento de campanhas (UTM), agentes de IA.
- **Governança:** log de auditoria, tours guiados, onboarding.
- **Plataforma:** tempo real, filas e processamento em segundo plano, internacionalização.

Observação: a tela inicial exibe uma checklist simples de "Primeiros passos" (`apps/web/src/features/onboarding`), derivada de dados já carregados. Ela é um complemento de usabilidade, não um fluxo de onboarding guiado, mas está tecnicamente próxima do item "onboarding" acima e deve ser tratada como tal na avaliação de escopo.

## Riscos

| ID  | Risco                                          | Mitigação                                                           |
| --- | ---------------------------------------------- | ------------------------------------------------------------------- |
| R1  | Crescimento do escopo                          | Lista de itens fora do MVP fechada; mudanças só via backlog         |
| R2  | Código gerado por agente sem revisão           | Revisão humana de PRs; testes obrigatórios no DoD                   |
| R3  | Reaproveitamento indevido de produto existente | Construir do zero; revisar PRs                                      |
| R4  | Arrastar e soltar instável em toque            | `@dnd-kit` com sensores de toque/teclado e ação "Mover para…"       |
| R5  | Prazo curto de 4 sprints                       | Folga nas sprints 3 e 4; corte por MoSCoW (Could e Should primeiro) |
| R6  | Falha básica de segurança no acesso            | Hash bcrypt, cookie httpOnly, erro genérico, sem cadastro público   |
