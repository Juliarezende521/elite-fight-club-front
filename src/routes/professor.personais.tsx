import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "./professor.agenda";

export const Route = createFileRoute("/professor/personais")({
  component: () => (
    <StubPage area="Professor" breadcrumb="Personais" title="Personais" subtitle="Aulas particulares, frequência e remarcações." />
  ),
});
