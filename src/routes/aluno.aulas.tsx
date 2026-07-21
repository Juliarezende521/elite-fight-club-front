import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState, ErrorStateBox, LoadingState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/queryKeys";
import { fetchStudentDashboard, type StudentClassSummary } from "@/lib/student-dashboard";

export const Route = createFileRoute("/aluno/aulas")({
  component: MinhasAulas,
});

function MinhasAulas() {
  const dashboardQuery = useQuery({
    queryKey: queryKeys.alunoDashboard,
    queryFn: fetchStudentDashboard,
  });

  const aulas = dashboardQuery.data?.aulasSemana ?? [];
  const grouped = aulas.reduce<Record<string, StudentClassSummary[]>>((acc, aula) => {
    const key = new Date(`${aula.data}T12:00:00`).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
    (acc[key] ??= []).push(aula);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Aluno" }, { label: "Minhas aulas" }]}
        title="Minhas aulas"
        subtitle="Agenda semanal com aulas vinculadas ao seu plano."
      />

      {dashboardQuery.isLoading ? (
        <LoadingState label="Carregando suas aulas..." />
      ) : dashboardQuery.isError ? (
        <ErrorStateBox message="Não foi possível carregar suas aulas agora." />
      ) : aulas.length === 0 ? (
        <EmptyState
          title="Nenhuma aula agendada"
          description="Quando houver reserva ou personal vinculado ao seu plano, ele aparecerá aqui."
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, list]) => (
            <SectionCard key={day} title={day}>
              <div className="grid gap-2 md:grid-cols-2">
                {list.map((aula) => (
                  <AulaCard key={`${aula.tipo}-${aula.aulaId}`} aula={aula} />
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </>
  );
}

function AulaCard({ aula }: { aula: StudentClassSummary }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-background/60 p-3 ring-1 ring-border">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm text-foreground">
            {aula.horaInicio.slice(0, 5)}-{aula.horaFim.slice(0, 5)}
          </span>
          <span className="inline-flex items-center rounded-md bg-info/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-info ring-1 ring-info/30">
            {aula.modalidade ?? aula.tipo}
          </span>
          <StatusBadge tone={aula.tipo === "PERSONAL" ? "info" : "muted"}>
            {aula.tipo === "PERSONAL" ? "Personal" : "Turma"}
          </StatusBadge>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {aula.professorNome} · {aula.statusPresenca ?? "Presença pendente"}
        </div>
      </div>
      <Button size="sm" variant="outline" disabled>
        {aula.checkInRealizado ? "Check-in feito" : "Vinculada"}
      </Button>
    </div>
  );
}
