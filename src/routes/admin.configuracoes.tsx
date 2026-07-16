import { createFileRoute } from "@tanstack/react-router";
import { AdminStub } from "./admin.financeiro";

export const Route = createFileRoute("/admin/configuracoes")({
  component: () => (
    <AdminStub
      breadcrumb="Configurações"
      title="Configurações"
      subtitle="Academia, horários, capacidade, check-in, notificações, financeiro e integrações."
    />
  ),
});
