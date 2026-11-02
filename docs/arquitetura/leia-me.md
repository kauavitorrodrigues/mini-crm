# Arquitetura

Como este código está organizado, com um arquivo por parte da stack. Leia aqui primeiro, em vez de descobrir a estrutura lendo o código-fonte.

- [`pacotes.md`](./pacotes.md): os pacotes compartilhados dos quais todos os apps do monorepo dependem.
- [`alvo-web.md`](./alvo-web.md): como os apps se conectam: o que roda, como fala com o banco de dados e como é publicado.
- [`frontend-vite.md`](./frontend-vite.md): a estrutura interna do frontend.

Se você alterar o código, mantenha o arquivo correspondente em dia. Trate-o como a documentação do contrato de uma pasta, não como um histórico de mudanças.

Outros documentos do projeto:

- [`../../leia-me.md`](../../leia-me.md): visão geral, como rodar com `pnpm local`, funcionalidades e decisões.
- [`../desenvolvimento.md`](../desenvolvimento.md): rodar manualmente, testes, CI, publicação e como adicionar uma feature.
- [`../scrum.md`](../scrum.md): backlog, matriz Complexidade x Incerteza, sprints, DoR e DoD.
- [`../contrato-api.md`](../contrato-api.md): contrato da API.
- [`../plano-execucao.md`](../plano-execucao.md): plano técnico por sprint e status.
