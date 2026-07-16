import { createFileRoute } from "@tanstack/react-router";
import { AdminStub } from "./admin.financeiro";

export const Route = createFileRoute("/admin/auditoria")({
  component: () => (
    <AdminStub
      breadcrumb="Auditoria"
      title="Auditoria"
      subtitle="Trilha de auditoria e eventos do sistema."
    />
  ),
});
