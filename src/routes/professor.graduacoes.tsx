import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "./professor.agenda";

export const Route = createFileRoute("/professor/graduacoes")({
  component: () => (
    <StubPage area="Professor" breadcrumb="Graduações" title="Graduações" subtitle="Prajieds, eventos, elegíveis e certificados." />
  ),
});
