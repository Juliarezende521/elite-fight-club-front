import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "./professor.agenda";

export const Route = createFileRoute("/professor/notificacoes")({
  component: () => (
    <StubPage area="Professor" breadcrumb="Notificações" title="Notificações" subtitle="Alertas de aulas, alunos e operações." />
  ),
});
