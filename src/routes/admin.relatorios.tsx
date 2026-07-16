import { createFileRoute } from "@tanstack/react-router";
import { AdminStub } from "./admin.financeiro";

export const Route = createFileRoute("/admin/relatorios")({
  component: () => (
    <AdminStub
      breadcrumb="Relatórios"
      title="Relatórios"
      subtitle="Financeiro, frequência, graduação, contábil e exportação CSV."
    />
  ),
});
