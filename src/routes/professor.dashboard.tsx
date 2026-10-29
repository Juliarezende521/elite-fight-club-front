import { createFileRoute } from "@tanstack/react-router";
import { DemoOnlyContent } from "@/components/auth/DemoOnlyContent";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { SectionCard } from "@/components/app/SectionCard";
import { ModalityBadge } from "@/components/app/ModalityBadge";
import { StatusBadge } from "@/components/app/StatusBadge";
import { CalendarDays, Users, UserCheck, AlertTriangle, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockClasses, getProfessor, getModality } from "@/mocks";

export const Route = createFileRoute("/professor/dashboard")({
  component: () => (
    <DemoOnlyContent>
      <ProfessorDashboard />
    </DemoOnlyContent>
  ),
});

function ProfessorDashboard() {
  const today = new Date().toDateString();
  const todays = mockClasses.filter((c) => new Date(c.date).toDateString() === today);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Professor" }, { label: "Dashboard" }]}
        title="Coach — visão do dia"
        subtitle="Suas aulas, personais e alunos elegíveis."
        actions={
          <Button size="sm">
            <QrCode className="mr-1.5 h-4 w-4" />
            Abrir check-in
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Aulas hoje"
          value={todays.length}
          icon={<CalendarDays className="h-4 w-4" />}
          tone="info"
        />
        <StatCard
          label="Aulas na semana"
          value={mockClasses.length}
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <StatCard
          label="Personais"
          value={mockClasses.filter((c) => c.type === "personal").length}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Alunos elegíveis"
          value={4}
          icon={<UserCheck className="h-4 w-4" />}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Aulas de hoje" className="lg:col-span-2">
          <ul className="divide-y divide-border">
            {todays.map((c) => {
              const prof = getProfessor(c.professorId);
              const mod = getModality(c.modalityId);
              const lotada = c.reserved >= c.capacity;
              return (
                <li key={c.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3">
                  <div className="font-display text-sm text-foreground">{c.time}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{mod?.name}</span>
                      <ModalityBadge id={c.modalityId} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {prof?.name} · {c.reserved}/{c.capacity}
                    </div>
                  </div>
                  <StatusBadge tone={lotada ? "destructive" : "success"}>
                    {lotada ? "Lotada" : "Aberta"}
                  </StatusBadge>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard title="Pendências">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
              <div>
                <div className="text-foreground">3 presenças por registrar</div>
                <div className="text-xs text-muted-foreground">Turma Muay Thai — 12:00</div>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-info" />
              <div>
                <div className="text-foreground">2 avaliações vencendo</div>
                <div className="text-xs text-muted-foreground">Enviar convites</div>
              </div>
            </li>
          </ul>
        </SectionCard>
      </div>
    </>
  );
}
