import { createFileRoute } from "@tanstack/react-router";
import { AdminStub } from "./admin.financeiro";

export const Route = createFileRoute("/admin/alunos")({
  component: () => (
    <AdminStub breadcrumb="Alunos" title="Alunos" subtitle="Visão consolidada de toda a base." />
  ),
});
