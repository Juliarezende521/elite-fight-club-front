# Plano de Integração Frontend + Backend

Este projeto (`elite-fight-club-front`) é o frontend oficial aprovado no Lovable. O design deve ser preservado durante a integração com o backend Spring Boot (`elite-fight-club-backend-atual`, tag `v0.1.0-backend`).

## Stack Identificada

- TanStack Start com Vite
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui e Radix UI
- TanStack Router
- TanStack Query
- Axios
- Recharts
- Firebase Auth integrado para login real
- Sem Supabase identificado

## Ordem Recomendada

1. Login real com Firebase Auth. **Concluído nesta etapa.**
2. Sessão e perfil real via backend. **Concluído nesta etapa.**
3. Dashboard do aluno.
4. Agenda e reservas.
5. Check-in.
6. Financeiro.
7. Notificações.
8. Evolução física.
9. Graduação.
10. Área do professor.
11. Administração e relatórios.

## Sessão

Fluxo real implementado:

1. Usuário entra com e-mail e senha no Firebase.
2. Frontend obtém o Firebase ID Token.
3. Cliente Axios envia `Authorization: Bearer <token>`.
4. Backend valida o token e resolve usuário, perfil e academia.
5. Frontend consulta `/auth/me` para obter a sessão real.
6. Frontend redireciona conforme o perfil retornado pelo backend.
7. Rotas `/aluno`, `/professor` e `/admin` são protegidas pelo perfil real da sessão.

Endpoint usado:

```http
GET /auth/me
Authorization: Bearer <firebase_id_token>
```

Resposta esperada:

```json
{
  "id": 10,
  "nome": "Rafael Moreira",
  "email": "rafael@elitefc.com",
  "perfil": "ALUNO",
  "ativo": true,
  "academia": {
    "id": 1,
    "nome": "Elite Fight Club",
    "status": "ATIVA"
  },
  "alunoId": 20,
  "professorId": null
}
```

## Guards

Os guards ficam no layout por perfil e tratam:

- sessão Firebase carregando;
- sessão backend carregando;
- usuário não autenticado;
- cadastro não encontrado no backend;
- usuário sem academia;
- usuário inativo;
- acesso a área de perfil diferente;
- backend indisponível com opção de tentar novamente.

O backend continua sendo a autoridade final de segurança.

## Modo Demo

O modo demo fica isolado por:

```env
VITE_ENABLE_DEMO_MODE=true
```

Em produção, o padrão documentado é `false`. A role escolhida no frontend é apenas demonstração e não deve ser usada como fonte de verdade para segurança.

Quando `VITE_ENABLE_DEMO_MODE=false`, a seleção livre de perfil não é exibida e o login usa Firebase Auth.

## CORS Local

O backend permite as origens configuradas por:

```env
APP_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

A porta real depende do Vite/TanStack Start, normalmente:

```text
http://localhost:5173
```

O backend local esperado é:

```text
http://localhost:8080
```

## Decisões desta etapa

- Design preservado.
- Nenhum mock foi removido.
- Axios foi mantido e reforçado.
- Firebase client foi integrado, sem Firebase Admin no frontend.
- Supabase não foi adicionado nem usado.
- Houve ajuste mínimo no backend em branch separada para expor `/auth/me` como DTO seguro e permitir CORS configurável.

## Logout

O logout chama Firebase `signOut`, limpa cache do TanStack Query e remove apenas o estado local de sessão demo quando existir.
