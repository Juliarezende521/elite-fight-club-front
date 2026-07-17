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
- Firebase Auth preparado nesta etapa
- Sem Supabase identificado

## Ordem Recomendada

1. Login real com Firebase Auth.
2. Sessão e perfil real via backend.
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

Fluxo real esperado:

1. Usuário entra com e-mail e senha no Firebase.
2. Frontend obtém o Firebase ID Token.
3. Cliente Axios envia `Authorization: Bearer <token>`.
4. Backend valida o token e resolve usuário, perfil e academia.
5. Frontend consulta `/auth/me` para obter a sessão real.
6. Frontend redireciona conforme o perfil retornado pelo backend.

## Modo Demo

O modo demo fica isolado por:

```env
VITE_ENABLE_DEMO_MODE=true
```

Em produção, o padrão documentado é `false`. A role escolhida no frontend é apenas demonstração e não deve ser usada como fonte de verdade para segurança.

## CORS Local

O backend precisará permitir a origem local do frontend. A porta real depende do Vite/TanStack Start, normalmente:

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
- Firebase client foi preparado, sem Firebase Admin no frontend.
- Supabase não foi adicionado nem usado.
- Não houve alteração no backend.
