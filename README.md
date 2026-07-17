# 🥋 Elite Fight Club — Frontend

Interface web moderna, responsiva e premium para o **Elite Fight Club**, sistema de gestão de academias de artes marciais e lutas.

Construída com **TanStack Start**, **React 19**, **Tailwind CSS v4** e **shadcn/ui**, a aplicação entrega uma experiência inspirada em dashboards esportivos de alto padrão, com identidade visual escura, tipografia marcante e navegação fluida entre os perfis de **Aluno**, **Professor** e **Administrador**.

---

## ✨ Funcionalidades

### Perfis e módulos

- **👤 Aluno**
  - Dashboard pessoal com evolução de treinos, frequência e próximas aulas
  - Grade semanal de aulas por modalidade
  - Mapa de calor de frequência (90 dias)
  - Acompanhamento de evolução física e graduação
  - Histórico financeiro e métodos de pagamento
  - Central de notificações

- **🎓 Professor**
  - Agenda do dia e próximas turmas
  - Lista de alunos com filtros e status
  - Controle de check-in / presença por aula

- **⚙️ Administrador**
  - Dashboard financeiro com receitas, inadimplência e métricas
  - Gestão de modalidades
  - Relatórios e configurações do sistema

### Destaques técnicos

- 🎨 Tema dark premium com tokens semânticos OKLCH
- 📱 Layout totalmente responsivo (desktop, tablet e mobile)
- 📊 Gráficos interativos com Recharts
- 🔐 Simulação de autenticação por perfil via `localStorage`
- 🚀 Preparado para integração com backend Spring Boot via Axios
- ♿ Componentes acessíveis com Radix UI

---

## 🛠️ Stack tecnológica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| TanStack Start | v1 | Framework full-stack React com SSR/SSG |
| React | 19 | Biblioteca de UI |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 4.x | Estilização utilitária |
| shadcn/ui + Radix | — | Componentes de interface |
| TanStack Query | 5.x | Gerenciamento de dados |
| Recharts | 2.x | Visualização de dados |
| Axios | 1.x | Cliente HTTP para API |
| date-fns | 4.x | Manipulação de datas |
| Lucide React | — | Ícones |

---

## 🚀 Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+ (recomendado 20+)
- [Bun](https://bun.sh/) ou npm/yarn/pnpm

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/elite-fight-club-frontend.git
cd elite-fight-club-frontend

# 2. Instale as dependências
bun install
# ou: npm install

# 3. Inicie o servidor de desenvolvimento
bun dev
# ou: npm run dev
```

Acesse `http://localhost:8080` no navegador.

---

## 🔐 Login e perfis

A tela de login permite escolher entre três perfis de acesso para teste:

| Perfil | Acesso principal |
|--------|------------------|
| Aluno | `/aluno/dashboard` |
| Professor | `/professor/dashboard` |
| Administrador | `/admin/dashboard` |

A autenticação atual é simulada no `localStorage`. Para integrar com um backend real, ajuste o endpoint em `VITE_API_BASE_URL` e a lógica em `src/lib/auth.ts`.

---

## 📁 Estrutura de pastas

```text
src/
├── components/          # Componentes reutilizáveis
│   ├── app/             # Componentes de aplicação (sidebar, header, cards)
│   └── ui/              # Componentes shadcn/ui
├── lib/                 # Utilitários, autenticação e API
├── mocks/               # Dados mockados para desenvolvimento
├── routes/              # Rotas do TanStack Router
│   ├── aluno.*.tsx      # Área do aluno
│   ├── professor.*.tsx  # Área do professor
│   ├── admin.*.tsx      # Área do administrador
│   └── api/             # Endpoints serverless
├── types/               # Tipagens TypeScript
├── styles.css           # Tema global e tokens de design
└── router.tsx           # Configuração do roteador
```

---

## 🔌 Integração com backend

O projeto já possui uma instância do Axios configurada em `src/lib/api.ts` para apontar para a variável de ambiente:

```env
VITE_API_BASE_URL=https://sua-api-elite-fight-club.com/api
```

O interceptor adiciona automaticamente o header `Authorization: Bearer <token>` quando o usuário está autenticado.

---

## 🧪 Scripts disponíveis

```bash
bun dev          # Inicia o servidor de desenvolvimento
bun build        # Gera a build de produção
bun build:dev    # Gera a build em modo desenvolvimento
bun preview      # Previsualiza a build de produção
bun lint         # Executa o ESLint
bun format       # Formata o código com Prettier
```

---

## 🎨 Identidade visual

- **Tema**: Dark premium
- **Fonte de títulos**: Oswald
- **Fonte de corpo**: Inter
- **Cor primária**: Azul esportivo (#3B82F6)
- **Superfície de fundo**: Slate escuro (#0F172A)
- **Estilo**: Dashboards esportivos premium, com alto contraste e hierarquia visual clara

---

## 🤝 Contribuição

1. Faça um fork do repositório
2. Crie uma branch: `git checkout -b minha-feature`
3. Faça commit das alterações: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Envie para o GitHub: `git push origin minha-feature`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Feito com 💪 para a comunidade de lutas
</p>
