# Auditoria tecnica de integracao

Data: 2026-10-29. Fonte: codigo local e referencias remotas obtidas com git fetch.
Capturas do README sao prototipos com dados ficticios, nao evidencia de integracao.

## Repositorios e limites da verificacao

| Item | Local | Referencia examinada |
| --- | --- | --- |
| Frontend oficial | /Users/julia/Documents/elite-fight-club-front | HEAD 78e58737dc65ccc004d69fc9dabcdd8e79ce9567 e alteracoes locais de professores |
| Frontend remoto | Juliarezende521/elite-fight-club-front | origin/main 1f1f709ed1a321bf184837d17147251b45c7ec21 |
| Backend | /Users/julia/Documents/elite-fight-club-backend-atual | branch codex/remove-legacy-financeiro-code, commit 1369fa7184263bb1747e64fdbfb319650360c0d2 |
| Backend remoto renomeado | Juliarezende521/elite-fight-club-backend | origin/main 7b3fe4078dda74ca2a902b433be809884a92d934 |

O origin do backend foi atualizado localmente para o repositorio renomeado.
Nao houve renomeacao fisica das pastas. A pasta elite-fight-club-frontend contem outro
projeto Next.js com diversas alteracoes locais; nao e o frontend oficial auditado.

O frontend local estava 16 commits atras da main, com queryKeys.ts e
admin.professores.tsx modificados e lib/professores.ts novo. Esses arquivos foram
preservados e nao fazem parte do commit desta auditoria. Backend: apenas .DS_Store
nao versionado. HEAD do backend e origin/main divergem (1 commit local, 6 remotos).
O diff remoto mostra que a remocao de Financeiro ainda nao esta na main consultada.
Nao houve merge, rebase ou atualizacao das copias de trabalho para main.

Real na matriz significa chamada de API identificada no codigo; nao significa
validacao manual autenticada ou persistencia comprovada nesta execucao.
Nenhum servidor estava escutando em 8080/8081 durante a verificacao. Login Firebase,
Network/Console, refresh e persistencia em PostgreSQL nao foram testados ao vivo.

## Matriz de rotas

L/E/V: carregamento / erro / vazio. Sim significa tratamento explicito no codigo.
Prioridades: P0 seguranca/contratos, P1 fluxo aluno, P2 gestao, P3 acabamento.
Arquivos de rota estao em src/routes; clientes citados estao em src/lib.

| Rota | Perfil | Situacao | Arquivo/servico | Endpoint utilizado e existencia no backend local | L/E/V | Falta / prioridade |
| --- | --- | --- | --- | --- | --- | --- |
| / | Publico | Redirecionamento | index.tsx | Nenhum direto | N/A | Validar destino por sessao, P1 |
| /login | Publico | Real + demo explicito | login.tsx, auth/service.ts, AuthProvider | Firebase + GET /auth/me, existe | Sim/Sim/N/A | E2E login/logout, P1 |
| /aluno | ALUNO | Layout protegido | aluno.tsx, AppLayout | Perfil de /auth/me | Sim/Sim/N/A | Testar guards, P1 |
| /aluno/dashboard | ALUNO | Parcial: leitura real | aluno.dashboard.tsx, student-dashboard.ts | GET /api/alunos/me/dashboard e /api/alunos/me/check-ins, existem | Sim/Sim/Sim | Acoes de check-in e erro de consulta secundaria, P1 |
| /aluno/aulas | ALUNO | Parcial: leitura real | aluno.aulas.tsx, student-dashboard.ts | GET /api/alunos/me/dashboard, existe | Sim/Sim/Sim | Reserva/cancelamento e check-in nao ligados; botao desabilitado, P1 |
| /aluno/frequencia | ALUNO | Real: leitura | aluno.frequencia.tsx, student-dashboard.ts | GET /api/alunos/me/dashboard e /api/alunos/me/check-ins, existem | Sim/Sim/Sim | Validar periodo e fuso com banco, P1 |
| /aluno/evolucao | ALUNO | Mock incondicional | aluno.evolucao.tsx, mocks | Nenhum; APIs de pesos/metas/avaliacoes existem | Nao/Nao/Parcial estatico | Integrar peso primeiro, P1 |
| /aluno/graduacao | ALUNO | Parcial: leitura real | aluno.graduacao.tsx, student-graduation.ts | GET /api/alunos/me/dashboard, /api/alunos/me/graduacoes, /api/alunos/me/eventos-graduacao, existem | Sim/Sim/Sim | Inscricao/pagamento/certificados como acoes futuras, P2 |
| /aluno/financeiro | ALUNO | Parcial: leitura real | aluno.financeiro.tsx, student-finance.ts | GET /api/faturas/aluno/{id}, /api/alunos/me/preferencia-pagamento, existem | Sim/Sim/Sim | Atualizar preferencia e pagar nao integrados, P1 |
| /aluno/notificacoes | ALUNO | Real: leitura e mutacoes | aluno.notificacoes.tsx, student-notifications.ts | GET /api/alunos/me/notificacoes; PATCH /{id}/lida e /marcar-todas-lidas nesse recurso, existem | Sim/Sim/Sim | Validar persistencia e tenant ao vivo, P1 |
| /professor | PROFESSOR | Layout protegido | professor.tsx, AppLayout | Perfil de /auth/me | Sim/Sim/N/A | Testar perfil incorreto, P1 |
| /professor/dashboard | PROFESSOR | Mock | professor.dashboard.tsx, mocks | Nenhum | Nao/Nao/Nao | Indicadores e agenda reais, P2 |
| /professor/alunos | PROFESSOR | Mock | professor.alunos.tsx, mocks | Nenhum | Nao/Nao/Nao | Definir contrato de alunos permitidos, P2 |
| /professor/agenda | PROFESSOR | Placeholder | professor.agenda.tsx | Nenhum; /api/agenda/professores/{id} existe | N/A | Integrar agenda, P2 |
| /professor/turmas | PROFESSOR | Placeholder | professor.turmas.tsx, StubPage | Nenhum; APIs agenda/aulas existem | N/A | Contrato moderno de turmas, P2 |
| /professor/personais | PROFESSOR | Placeholder | professor.personais.tsx, StubPage | Nenhum; APIs agenda/aulas existem | N/A | Integrar personal, P2 |
| /professor/checkin | PROFESSOR | Prototipo estatico | professor.checkin.tsx | Nenhum; APIs sessoes/QR existem | Nao/Nao/Estatico | Abrir sessao, QR e presenca persistentes, P1 |
| /professor/graduacoes | PROFESSOR | Placeholder | professor.graduacoes.tsx, StubPage | Nenhum; /api/graduacoes e eventos existem | N/A | Integrar gestao de graduacao, P2 |
| /professor/notificacoes | PROFESSOR | Placeholder | professor.notificacoes.tsx, StubPage | Nenhum | N/A | Definir notificacoes do professor, P2 |
| /admin | ADMIN | Layout protegido | admin.tsx, AppLayout | Perfil de /auth/me | Sim/Sim/N/A | Testar guard, P1 |
| /admin/dashboard | ADMIN | Mock incondicional | admin.dashboard.tsx, mocks | Nenhum | Nao/Nao/Nao | Indicadores reais, P2 |
| /admin/alunos | ADMIN | Real no codigo | admin.alunos.tsx, modalidades.ts | GET/POST /api/alunos; PUT /api/alunos/{id} e /modalidades; GET /api/planos e /modalidades, existem | Sim/Sim/Sim | Testar contrato com banco, P1 |
| /admin/modalidades | ADMIN | Real no codigo | admin.modalidades.tsx, modalidades.ts | GET/POST /modalidades e PATCH /modalidades/{id}, existem | Sim/Sim/Sim | Validar reflexo no cadastro aluno, P1 |
| /admin/professores | ADMIN | Parcial: trabalho local sem contrato compativel | admin.professores.tsx, professores.ts nao commitados | /api/professores e subrotas: ausentes neste backend; apenas /professores legado | Sim/Sim/Sim | Resolver branch/contrato antes de publicar integracao, P0 |
| /admin/financeiro | ADMIN | Placeholder | admin.financeiro.tsx, AdminStub | Nenhum; APIs modernas Fatura/Pagamento existem | N/A | Integrar financeiro moderno, P2 |
| /admin/relatorios | ADMIN | Placeholder | admin.relatorios.tsx, AdminStub | Nenhum; relatorios modernos financeiro/contabil/graduacao existem | N/A | Integrar filtros e CSV, P2 |
| /admin/auditoria | ADMIN | Placeholder | admin.auditoria.tsx, AdminStub | Nenhum | N/A | Definir API de auditoria e permissoes, P2 |
| /admin/configuracoes | ADMIN | Placeholder | admin.configuracoes.tsx, AdminStub | Nenhum | N/A | Definir configuracoes permitidas, P2 |

__root.tsx fornece documento, providers e tratamento global de erros; nao e tela
de negocio. Parametros de busca e rotas de layout nao criam endpoints adicionais.

## Achados e contratos

1. **P0: gestao legada de professores.** ProfessorController recebe/retorna entidade
   JPA; ProfessorService filtra academia, mas nao exige ADMIN nos metodos de escrita.
   SecurityConfig exige apenas autenticacao para essas rotas. O guard visual ADMIN
   nao impede chamadas diretas por outro perfil. Exige correcao/revisao dedicada;
   nao afirmar que o modulo moderno de professores esta integrado nesta branch.
2. **P0: cache e identidade.** queryKeys.authMe e chaves de aluno sao compartilhadas;
   logout limpa o cache, mas loginWithFirebase usa fetchQuery com staleTime de cinco
   minutos, sem limpar antes da troca de identidade. Testar troca de conta, inclusive
   entre abas; atrelar cache a UID/academia ou invalidar na mudanca de identidade.
3. **P1: mocks fora do modo demo.** Evolucao, dashboard admin e telas mock do professor
   importam mocks diretamente; VITE_ENABLE_DEMO_MODE=false nao impede isso.
   Nao ha fallback de API para mock nos clientes locais de aluno examinados.
   Na main remota, student-dashboard.ts adiciona demo condicionado a flag e sessao;
   isso ainda nao esta no checkout. Manter diferenca explicita ate reconciliar branches.
4. **P1: token demo.** AuthProvider condiciona sessao demo a flag; getAuthorizationToken
   ainda consulta getDemoSession sem checar essa flag quando nao ha usuario Firebase.
   Pode enviar token ficticio residual. Nao concede acesso real no backend, mas precisa
   teste e condicionamento para separar integralmente execucao real/demo.
5. **P1: estados secundarios.** Dashboard trata erro principal, mas historico pode virar
   vazio via array default quando a consulta secundaria falha. Nao interpretar falha
   de rede como zero presencas. Streak e calculado por dias consecutivos a partir de
   hoje; validar regra de negocio e fuso, nao confundir com semanas de treino.
6. **Contratos financeiros.** student-finance.ts usa faturas reais e preferencia opcional
   (204 vira null). Nao implica que pagamento PIX ou alteracao da preferencia estejam
   integrados. DTOs de graduacao ainda usam historico/certificados como unknown[].
7. **Erros.** api.ts centraliza Bearer, timeout e mensagens para 400/401/403/404/409.
   Prioriza mensagem retornada pela API. GlobalExceptionHandler oculta RuntimeException
   inesperada, mas usa 400 em vez de 500 e registra excecao completa no log.
   Revisar sanitizacao/restricao de logs e semantica de erros. Ausencia de recurso
   lancada como RuntimeException nao garante 404. SecurityFilterChain nao configura
   entrypoint JSON especifico; testar status anonimo em vez de assumir 401 uniforme.
8. **Autorizacao/tenant.** FirebaseAuthenticationFilter verifica ID Token e usuario
   local ativo. Perfil vem do banco. /auth/me e permitAll no filtro, com verificacao
   no fluxo do controller; isso nao significa retorno publico de perfil.
   EvolucaoPesoService usa aluno atual e consultas por academia + aluno; tem DTOs,
   Bean Validation e conflito por data. Nao generalizar essa garantia aos CRUDs legados.
9. **CORS.** Origens padrao: localhost:3000 e localhost:5173; localhost:8081 requer
   APP_CORS_ALLOWED_ORIGINS. Nao foi lido/exposto conteudo de credenciais locais.
   Sem servidor ativo, preflight e respostas reais nao foram validados.
10. **Ambiente.** Front consome VITE_API_BASE_URL, VITE_ENABLE_DEMO_MODE e quatro
    variaveis Firebase (API_KEY, AUTH_DOMAIN, PROJECT_ID, APP_ID), em env.ts/firebase.ts.
    Demo e padrao em DEV quando flag nao e false. .env.example usa URL local e valores
    Firebase vazios. .gitignore protege *.local, mas nao todos .env/.env.production;
    ampliar cobertura em etapa separada. Nenhuma credencial foi adicionada aqui.
11. **Banco.** Dev usa PostgreSQL e ddl-auto=update; producao usa validate. Testes usam
    H2 create-drop, Flyway desligado. Migrations V1-V21 presentes, V5/V22 ausentes
    neste checkout; ausencia de numero isolado nao e por si erro do Flyway.
    Historico de migrations nao constitui baseline completa validada: executar em
    PostgreSQL vazio antes de garantir instalacao reproduzivel. Nenhuma migration alterada.
12. **CI e lockfile.** Checkout nao possui workflows; origin/main dos dois repositorios
    possui CI e secret-scan. Front CI usa Bun frozen-lockfile + lint/typecheck/build;
    backend usa Java 21 + clean verify. bun.lock e o lockfile versionado. Nao adicionar
    package-lock.json. Nao ha script test/Vitest/RTL/Playwright no package.json local
    nem no remoto examinado. Busca de arquivos test/spec nao encontrou suite frontend.

## Evolucao fisica: proxima integracao, sem reimplementar backend

aluno.evolucao.tsx usa mockCurrentStudent e mockWeightHistory para peso, grafico e
meta; abas de medidas/avaliacoes/bioimpedancia sao vazios estaticos.
APIs existentes: GET/POST /api/alunos/me/pesos, GET /api/alunos/me/pesos/resumo,
PUT/DELETE /api/alunos/me/pesos/{registroId}; APIs /api/alunos/me/metas-peso e
/api/alunos/me/avaliacoes-corporais (historico, resumo, comparativo).
Avaliacoes corporais sao gravadas por ADMIN/PROFESSOR em
/api/alunos/{alunoId}/avaliacoes-corporais. Nao habilitar escrita pelo aluno sem
decidir a regra; peso do proprio aluno ja tem escrita permitida.

Primeiro incremento recomendado: client tipado de pesos, leitura/resumo, formulario
de peso/data e grafico ordenado por data completa; diferenca derivada do resumo
backend, sem truncar ano para ordenar. Testar vazio, datas, conflito, erro e tenant.
Medidas exigem conferir DTO de avaliacao existente e definir quem pode registrar.
Nenhuma migration nova e justificada apenas pela tela ainda estar mockada.

Nesta execucao nao foi implementado modulo novo: a condicao de repositorio limpo
nao foi atendida, e ha divergencia de branches/contrato a resolver primeiro.
Tambem nao foram instaladas dependencias de testes sobre o trabalho pendente.

## Linha de base executada

| Verificacao | Resultado | Limite |
| --- | --- | --- |
| npm run lint (script existente, sem install/lockfile novo) | 0 erros, 6 warnings Fast Refresh | Checkout local, nao main remota |
| npm run typecheck | Aprovado | Tipos nao comprovam contrato HTTP |
| npm run build | Aprovado | Sem deploy; bundle nao valida API |
| sh mvnw test | 329 testes, 0 falhas, 0 erros, 0 skipped, BUILD SUCCESS | H2; Flyway desligado; Firebase simulado |
| git diff --check | Aprovado antes do documento | Repetir ao commitar documento |

Sem teste E2E autenticado nesta execucao: nao existe sessao de teste fornecida nem
servidores ativos nas portas verificadas. Nao criar usuario, cobranças ou check-ins
reais para preencher essa lacuna sem preparar dados sinteticos de teste.

## Roteiro pendente para validacao real

1. Reconciliar referencias de trabalho com main e trabalho pendente de professores.
2. Iniciar ambiente local com configuracao ja existente e demo explicitamente false.
3. Usar conta sintetica de aluno; confirmar Firebase e /auth/me, refresh e logout.
4. Testar outro perfil e outra academia; API deve bloquear mesmo sem guard visual.
5. Conferir dashboard/aulas/frequencia contra banco; nenhum fallback ficticio em erro.
6. Integrar e testar reserva/cancelamento e QR/check-in, hoje sem acao nessas telas.
7. Conferir fatura real, leitura de preferencia, graduacao e notificacoes; marcar lida
   e atualizar pagina para confirmar persistencia. Preferencia ainda sem escrita na UI.
8. Desligar API e verificar erro recuperavel, sem mostrar dados ficticios/contagem zero.
9. Criar suite Vitest/RTL com Bun, clientes/guards/estados e evolucao; adicionar a CI.
10. Depois estabilizar Playwright para fluxo sintetico, teclado e viewport de 360px.

Este documento e o unico arquivo publicado nesta etapa. Nenhuma funcionalidade,
endpoint, migration, dependencia, dado pessoal ou segredo faz parte do commit.
