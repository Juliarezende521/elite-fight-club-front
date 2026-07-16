import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";

function makePage(path: string, title: string, subtitle: string, breadcrumb: string, area: string) {
  return {
    Route: createFileRoute(path)({
      component: () => (
        <>
          <PageHeader
            breadcrumbs={[{ label: area }, { label: breadcrumb }]}
            title={title}
            subtitle={subtitle}
          />
          <EmptyState
            title="Em construção"
            description="Interface base pronta. Conectaremos ao backend Spring Boot em seguida."
          />
        </>
      ),
    }),
  };
}

export const { Route } = makePage(
  "/professor/agenda",
  "Minha agenda",
  "Turmas e personais em uma visão unificada.",
  "Agenda",
  "Professor",
);
