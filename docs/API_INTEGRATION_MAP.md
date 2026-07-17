# Mapa de Integração com API

Este mapa contém apenas endpoints confirmados na documentação `FRONTEND_READY.md` do backend.

## Autenticação

| Uso                           | Método | Endpoint          | Observação                                                             |
| ----------------------------- | ------ | ----------------- | ---------------------------------------------------------------------- |
| Sessão do usuário autenticado | `GET`  | `/auth/me`        | Retorna usuário autenticado. Deve ser usado para resolver perfil real. |
| Registro público              | `POST` | `/auth/registrar` | Público. Não usar para login comum do app nesta etapa.                 |

## Dashboard do Aluno

| Uso                   | Método | Endpoint                   |
| --------------------- | ------ | -------------------------- |
| Dashboard consolidado | `GET`  | `/api/alunos/me/dashboard` |

## Financeiro

| Uso                      | Método | Endpoint                                   |
| ------------------------ | ------ | ------------------------------------------ |
| Faturas do aluno atual   | `GET`  | `/api/alunos/me/faturas`                   |
| Faturas por aluno        | `GET`  | `/api/faturas/aluno/{alunoId}`             |
| Gerar mensalidade        | `POST` | `/api/faturas/gerar-mensal`                |
| Criar Pix de fatura      | `POST` | `/api/faturas/{faturaId}/pix`              |
| Pagamento manual         | `POST` | `/api/faturas/{faturaId}/pagamento-manual` |
| Conciliar pagamento      | `POST` | `/api/pagamentos/{pagamentoId}/conciliar`  |
| Preferência de pagamento | `GET`  | `/api/alunos/me/preferencia-pagamento`     |
| Atualizar preferência    | `PUT`  | `/api/alunos/me/preferencia-pagamento`     |

## Agenda e Aulas

| Uso                           | Método | Endpoint                                     |
| ----------------------------- | ------ | -------------------------------------------- |
| Criar horário de turma        | `POST` | `/api/agenda/turmas`                         |
| Criar agenda personal         | `POST` | `/api/agenda/personais`                      |
| Gerar aulas do dia            | `POST` | `/api/aulas/gerar`                           |
| Gerar aulas do período        | `POST` | `/api/aulas/gerar-periodo`                   |
| Agenda do professor no dia    | `GET`  | `/api/agenda-professor/{professorId}/dia`    |
| Agenda do professor na semana | `GET`  | `/api/agenda-professor/{professorId}/semana` |
| Minhas reservas               | `GET`  | `/api/alunos/me/reservas`                    |
| Reservar aula de turma        | `POST` | `/api/aulas/turmas/{aulaId}/reservas`        |

## Check-in

| Uso                | Método | Endpoint                     |
| ------------------ | ------ | ---------------------------- |
| QR da academia     | `GET`  | `/api/check-in/qr/academia`  |
| Sessão do QR       | `GET`  | `/api/check-in/qr/sessao`    |
| Opções de check-in | `GET`  | `/api/check-in/qr/opcoes`    |
| Confirmar check-in | `POST` | `/api/check-in/qr/confirmar` |
| Histórico do aluno | `GET`  | `/api/alunos/me/check-ins`   |

## Graduação

| Uso                    | Método | Endpoint                                                |
| ---------------------- | ------ | ------------------------------------------------------- |
| Listar graduações      | `GET`  | `/api/graduacoes`                                       |
| Criar graduação        | `POST` | `/api/graduacoes`                                       |
| Elegibilidade do aluno | `GET`  | `/api/graduacoes/alunos/{alunoId}/elegibilidade`        |
| Criar evento           | `POST` | `/api/eventos-graduacao`                                |
| Publicar evento        | `POST` | `/api/eventos-graduacao/{eventoId}/publicar`            |
| Inscrever aluno        | `POST` | `/api/alunos/me/eventos-graduacao/{eventoId}/inscrever` |
| Pix de inscrição       | `POST` | `/api/alunos/me/inscricoes-graduacao/{inscricaoId}/pix` |
| Graduações do aluno    | `GET`  | `/api/alunos/me/graduacoes`                             |
| Certificados do aluno  | `GET`  | `/api/alunos/me/certificados`                           |
| Validação pública      | `GET`  | `/api/certificados/validar/{codigo}`                    |

## Notificações

| Uso                                  | Método | Endpoint                                 |
| ------------------------------------ | ------ | ---------------------------------------- |
| Relatório financeiro de notificações | `GET`  | `/api/notificacoes/financeiro/relatorio` |

## Tratamento de Erros

O backend documenta:

- `400 VALIDATION_ERROR`
- `400 BUSINESS_ERROR`
- `403 FORBIDDEN`
- `409 CONFLICT`

O frontend normaliza respostas em `ApiError` com:

- `status`
- `message`
- `fieldErrors`
- `timestamp`
- `path`

## Bloqueios / Lacunas

- Confirmar o formato exato de retorno de `/auth/me` antes de ligar a sessão real nas telas.
- Alguns endpoints legados ainda retornam entidades JPA diretamente; preferir endpoints novos com DTO quando existirem.
