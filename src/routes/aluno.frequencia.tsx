import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatCard } from "@/components/app/StatCard";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Flame, QrCode, CalendarCheck } from "lucide-react";
import { mockCheckInHeatmap, mockCurrentStudent } from "@/mocks";

export const Route = createFileRoute("/aluno/frequencia")({
  component: Frequencia,
});

function Frequencia() {
  const s = mockCurrentStudent;
  const heat = mockCheckInHeatmap;
  const weeksCount = Math.ceil(heat.length / 7);

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

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de check-ins"
          value={s.checkInsTotal}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="success"
        />
        <StatCard
          label="Este mês"
          value={s.checkInsMonth}
          icon={<CalendarCheck className="h-4 w-4" />}
          tone="info"
        />
        <StatCard label="Esta semana" value={4} icon={<CalendarCheck className="h-4 w-4" />} />
        <StatCard
          label="Streak"
          value={`${s.streak} dias`}
          icon={<Flame className="h-4 w-4" />}
          tone="warning"
        />
      </div>

      <SectionCard title="Heatmap dos últimos 90 dias">
        <div className="flex gap-1 overflow-x-auto">
          {Array.from({ length: weeksCount }).map((_, w) => (
            <div key={w} className="grid grid-rows-7 gap-1">
              {Array.from({ length: 7 }).map((__, d) => {
                const idx = w * 7 + d;
                const cell = heat[idx];
                if (!cell) return <div key={d} className="h-3 w-3" />;
                const opacity = cell.count === 0 ? 0.08 : cell.count === 1 ? 0.45 : 0.9;
                return (
                  <div
                    key={d}
                    title={`${cell.date}: ${cell.count} check-ins`}
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
      </SectionCard>
    </>
  );
}
