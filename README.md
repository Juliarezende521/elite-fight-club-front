# Elite Fight Club — Frontend

[![Frontend CI](https://github.com/Juliarezende521/elite-fight-club-front/actions/workflows/ci.yml/badge.svg)](https://github.com/Juliarezende521/elite-fight-club-front/actions/workflows/ci.yml)

Interface web do **Elite Fight Club**, um projeto pessoal de gestão para academias de artes marciais. A aplicação oferece experiências diferentes para alunos, professores e administradores e está sendo integrada gradualmente ao backend em Java e Spring Boot.

> Projeto pessoal em desenvolvimento, independente dos trabalhos acadêmicos realizados em grupo.

## Status

- Interface responsiva implementada para os três perfis.
- Autenticação Firebase e sessão validada pelo backend.
- Cliente HTTP centralizado e proteção de rotas por perfil.
- Integração real já iniciada em módulos administrativos e do aluno.
- Algumas telas ainda utilizam dados simulados e estão identificadas no plano de migração.
- Lint, TypeScript e build validados automaticamente pelo GitHub Actions.
- Deploy público ainda não realizado.

## Protótipo visual

As telas abaixo apresentam o protótipo visual do Elite Fight Club, criado com apoio do **Lovable**. Os dados exibidos são fictícios e algumas funcionalidades ainda estão sendo integradas ao backend em Java e Spring Boot.

<p align="center">
  <img src="docs/screenshots/prototipo-login.png" alt="Protótipo da tela de login do Elite Fight Club" width="100%">
  <br>
  <sub>Tela de acesso e identidade visual da plataforma.</sub>
</p>

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/prototipo-dashboard-aluno.png" alt="Protótipo do dashboard do aluno" width="100%">
      <br>
      <sub>Dashboard do aluno.</sub>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/prototipo-frequencia-aluno.png" alt="Protótipo da área de frequência do aluno" width="100%">
      <br>
      <sub>Frequência e check-ins.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/prototipo-gestao-alunos.png" alt="Protótipo da gestão de alunos pelo professor" width="100%">
      <br>
      <sub>Gestão de alunos pelo professor.</sub>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/prototipo-dashboard-admin.png" alt="Protótipo do painel administrativo" width="100%">
      <br>
      <sub>Visão geral administrativa.</sub>
    </td>
  </tr>
</table>

## Funcionalidades da interface

### Aluno

- Dashboard pessoal.
- Grade de aulas.
- Frequência e evolução física.
- Graduação.
- Histórico financeiro.
- Central de notificações.

### Professor

- Agenda de aulas.
- Consulta de alunos.
- Check-in e controle de presença.
- Estrutura preparada para turmas, aulas particulares e graduações.

### Administrador

- Dashboard financeiro.
- Gestão de alunos e modalidades.
- Estrutura preparada para professores, auditoria, relatórios e configurações.

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| TanStack Start | Aplicação React com SSR |
| React 19 | Interface |
| TypeScript | Tipagem estática |
| Tailwind CSS 4 | Estilização |
| shadcn/ui e Radix UI | Componentes acessíveis |
| TanStack Query | Estado assíncrono |
| Recharts | Visualização de dados |
| Axios | Comunicação com a API |
| Firebase | Autenticação |
| Bun | Dependências e scripts |

## Identidade visual

A primeira direção visual foi prototipada com apoio do **Lovable**. A partir dela, o código está sendo revisado, integrado ao backend Spring Boot e evoluído como parte do projeto pessoal.

- Tema escuro inspirado em dashboards esportivos.
- Tipografia Oswald e Inter.
- Tokens semânticos em OKLCH.
- Layout responsivo para desktop, tablet e celular.
- Componentes baseados em Radix UI.

## Como executar

Pré-requisitos:

- Bun
- Backend Elite Fight Club em execução para os fluxos reais
- Projeto Firebase para autenticação real

```bash
git clone https://github.com/Juliarezende521/elite-fight-club-front.git
cd elite-fight-club-front
bun install
cp .env.example .env.local
bun dev
```

No Windows, copie manualmente `.env.example` para `.env.local` caso não use um terminal compatível com `cp`.

## Variáveis de ambiente

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_ENABLE_DEMO_MODE=false
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

O modo demonstração permite navegar pela interface sem representar autenticação real. Em um ambiente integrado, mantenha `VITE_ENABLE_DEMO_MODE=false`.

## Autenticação e autorização

No fluxo real:

1. O Firebase autentica o usuário.
2. O frontend obtém o Firebase ID Token.
3. O token é enviado ao backend no cabeçalho `Authorization`.
4. O endpoint `GET /auth/me` retorna o perfil e a academia.
5. O frontend libera somente as rotas compatíveis com o perfil retornado.

A permissão definitiva é validada pelo backend; o frontend não é usado como fonte de autorização.

## Qualidade

```bash
bun run lint
bun run typecheck
bun run build
```

O workflow `Frontend CI` executa essas verificações automaticamente em cada push e pull request para a branch principal.

## Documentação da integração

- `docs/FRONTEND_INTEGRATION_PLAN.md`
- `docs/API_INTEGRATION_MAP.md`
- `docs/MOCK_MIGRATION_PLAN.md`

Backend do projeto:

[elite-fight-club-backend](https://github.com/Juliarezende521/elite-fight-club-backend)

## Processo de desenvolvimento

Ferramentas de inteligência artificial são utilizadas como apoio para prototipação, pesquisa, revisão e implementação. A integração, as decisões técnicas, a validação das regras e os testes são acompanhados e revisados durante o desenvolvimento.

## Próximas etapas

- Substituir os mocks restantes por chamadas reais.
- Completar os fluxos de professor e administrador.
- Adicionar testes automatizados de componentes e navegação.
- Registrar capturas de tela e uma demonstração do produto.
- Preparar um ambiente gratuito de demonstração, se houver uma opção adequada.
