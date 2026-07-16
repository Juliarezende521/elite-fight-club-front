import { createFileRoute } from "@tanstack/react-router";
import { AdminStub } from "./admin.financeiro";

export const Route = createFileRoute("/admin/professores")({
  component: () => (
    <AdminStub
      breadcrumb="Professores"
      title="Professores"
      subtitle="Cadastro, modalidades atendidas e status."
    />
  ),
});
