import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import type { ReactNode } from "react";

export function AdminStub({
  breadcrumb,
  title,
  subtitle,
  children,
}: {
  breadcrumb: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Admin" }, { label: breadcrumb }]}
        title={title}
        subtitle={subtitle}
      />
      {children ?? (
        <EmptyState
          title="Em construção"
          description="Interface base pronta. Conectaremos ao backend Spring Boot em seguida."
        />
      )}
    </>
  );
}

export const Route = createFileRoute("/admin/financeiro")({
  component: () => (
    <AdminStub
      breadcrumb="Financeiro"
      title="Financeiro"
      subtitle="Previsto, recebido, inadimplência e gráficos mensais."
    />
  ),
});
