import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import type { ReactNode } from "react";

export function StubPage({
  area,
  breadcrumb,
  title,
  subtitle,
  children,
}: {
  area: string;
  breadcrumb: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: area }, { label: breadcrumb }]}
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

// Placeholder route not used directly.
export const Route = createFileRoute("/professor/agenda")({
  component: () => (
    <StubPage
      area="Professor"
      breadcrumb="Agenda"
      title="Minha agenda"
      subtitle="Turmas e personais em uma visão unificada."
    />
  ),
});
