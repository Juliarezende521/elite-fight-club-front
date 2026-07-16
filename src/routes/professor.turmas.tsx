import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "./professor.agenda";

export const Route = createFileRoute("/professor/turmas")({
  component: () => (
    <StubPage area="Professor" breadcrumb="Turmas" title="Turmas" subtitle="Gestão de turmas, presença e capacidade." />
  ),
});
