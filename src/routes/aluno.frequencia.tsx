import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, CheckCircle2, Flame, QrCode } from "lucide-react";

import { EmptyState, ErrorStateBox, LoadingState } from "@/components/app/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatCard } from "@/components/app/StatCard";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/queryKeys";
import {
  calculateCurrentStreak,
  fetchStudentCheckIns,
  fetchStudentDashboard,
  formatLocalDate,
  getLastDaysRange,
} from "@/lib/student-dashboard";

export const Route = createFileRoute("/aluno/frequencia")({
  component: Frequencia,
});

const historyRange = getLastDaysRange(90);

function Frequencia() {
  const dashboardQuery = useQuery({
    queryKey: queryKeys.alunoDashboard,
    queryFn: fetchStudentDashboard,
  });
  const checkInsQuery = useQuery({
    queryKey: [...queryKeys.alunoCheckIns, historyRange.inicio, historyRange.fim],
    queryFn: () => fetchStudentCheckIns(historyRange.inicio, historyRange.fim),
  });

  const dashboard = dashboardQuery.data;
  const checkIns = checkInsQuery.data?.checkIns ?? [];
  const heat = buildHeatmap(checkIns.map((checkIn) => checkIn.realizadoEm));
  const weeksCount = Math.ceil(heat.length / 7);
  const streak = calculateCurrentStreak(checkIns);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Aluno" }, { label: "Frequência" }]}
        title="Minha frequência"
        subtitle="Últimos 90 dias de check-ins e presença."
        actions={
          <Button size="sm">
            <QrCode className="mr-1.5 h-4 w-4" />
            Check-in por QR
          </Button>
        }
      />

      {dashboardQuery.isLoading || checkInsQuery.isLoading ? (
        <LoadingState label="Carregando sua frequência..." />
      ) : dashboardQuery.isError || checkInsQuery.isError ? (
        <ErrorStateBox message="Não foi possível carregar sua frequência agora." />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total de check-ins"
              value={dashboard?.checkIns?.total ?? 0}
              icon={<CheckCircle2 className="h-4 w-4" />}
              tone="success"
            />
            <StatCard
              label="Este mês"
              value={dashboard?.checkIns?.noMesAtual ?? 0}
              icon={<CalendarCheck className="h-4 w-4" />}
              tone="info"
            />
            <StatCard
              label="Esta semana"
              value={dashboard?.checkIns?.naSemanaAtual ?? 0}
              icon={<CalendarCheck className="h-4 w-4" />}
            />
            <StatCard
              label="Streak"
              value={`${streak} dias`}
              hint={streak === 0 ? "Nenhum check-in registrado hoje" : "Sequência ativa"}
              icon={<Flame className="h-4 w-4" />}
              tone="warning"
            />
          </div>

          <SectionCard title="Heatmap dos últimos 90 dias">
            {checkIns.length === 0 ? (
              <EmptyState
                title="Nenhum check-in registrado"
                description="Assim que houver presença confirmada, o histórico aparecerá aqui."
              />
            ) : (
              <>
                <div className="flex gap-1 overflow-x-auto">
                  {Array.from({ length: weeksCount }).map((_, weekIndex) => (
                    <div key={weekIndex} className="grid grid-rows-7 gap-1">
                      {Array.from({ length: 7 }).map((__, dayIndex) => {
                        const idx = weekIndex * 7 + dayIndex;
                        const cell = heat[idx];
                        if (!cell) return <div key={dayIndex} className="h-3 w-3" />;
                        const opacity = cell.count === 0 ? 0.08 : cell.count === 1 ? 0.45 : 0.9;
                        return (
                          <div
                            key={dayIndex}
                            title={`${formatDisplayDate(cell.date)}: ${cell.count} check-ins`}
                            className="h-3 w-3 rounded-[3px]"
                            style={{
                              backgroundColor: `color-mix(in oklab, var(--color-success) ${Math.round(opacity * 100)}%, var(--color-accent))`,
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                  Menos
                  <span className="inline-block h-3 w-3 rounded-[3px] bg-accent" />
                  <span className="inline-block h-3 w-3 rounded-[3px] bg-success/40" />
                  <span className="inline-block h-3 w-3 rounded-[3px] bg-success/70" />
                  <span className="inline-block h-3 w-3 rounded-[3px] bg-success" />
                  Mais
                </div>
              </>
            )}
          </SectionCard>
        </>
      )}
    </>
  );
}

function buildHeatmap(checkInDates: string[]) {
  const counts = checkInDates.reduce<Record<string, number>>((acc, value) => {
    const date = value.slice(0, 10);
    acc[date] = (acc[date] ?? 0) + 1;
    return acc;
  }, {});

  return Array.from({ length: 90 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (89 - index));
    const formatted = formatLocalDate(date);

    return {
      date: formatted,
      count: counts[formatted] ?? 0,
    };
  });
}

function formatDisplayDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}
