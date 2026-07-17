# Plano de Migração dos Mocks

Os mocks atuais estão centralizados em `src/mocks/index.ts` e alimentam o design aprovado do Lovable. Eles não devem ser removidos em massa nesta etapa.

## Classificação Atual

| Domínio         | Mock atual                                 | Classificação | Ação                                                                                               |
| --------------- | ------------------------------------------ | ------------- | -------------------------------------------------------------------------------------------------- |
| Usuários        | `mockUsers`                                | demo/dev      | mantido apenas quando `VITE_ENABLE_DEMO_MODE=true`; sessão real usa Firebase + `/auth/me`          |
| Alunos          | `mockStudents`, `mockCurrentStudent`       | visual/mock   | substituir por endpoints de alunos e dashboard                                                     |
| Professores     | `mockProfessors`                           | visual/mock   | substituir por endpoints de professores                                                            |
| Modalidades     | `mockModalities`                           | visual/mock   | substituir por `/api/graduacoes` apenas para graduação e endpoint de modalidades quando confirmado |
| Aulas           | `mockClasses`                              | visual/mock   | substituir por agenda/aulas/reservas                                                               |
| Financeiro      | `mockInvoices`                             | visual/mock   | substituir por faturas e pagamentos                                                                |
| Notificações    | `mockNotifications`                        | visual/mock   | substituir por endpoint de notificações quando confirmado                                          |
| Graduação       | `mockPrajieds`, `mockGraduationEvents`     | visual/mock   | substituir por endpoints de graduação/eventos                                                      |
| Evolução física | `mockWeightHistory`                        | visual/mock   | substituir por pesos, metas e avaliação corporal                                                   |
| Frequência      | `mockCheckInHeatmap`, `mockWeeklyCheckIns` | visual/mock   | substituir por check-ins reais                                                                     |
| Relatórios      | `mockMonthlyRevenue`                       | visual/mock   | substituir por relatórios confirmados                                                              |

## Ordem de Migração

1. Autenticação real e sessão. **Concluído.**
2. Dashboard do aluno com `/api/alunos/me/dashboard`.
3. Aulas e reservas.
4. Check-ins.
5. Financeiro.
6. Notificações.
7. Evolução física.
8. Graduação.
9. Professor.
10. Admin e relatórios.

## Regra Visual

Ao substituir um mock por endpoint real, preservar:

- layout;
- tokens de cor;
- densidade dos cards;
- badges;
- gráficos;
- responsividade.

## Observação

O comentário `TODO` em `src/mocks/index.ts` marca explicitamente que esses dados são temporários e devem ser substituídos por endpoints reais do backend.
