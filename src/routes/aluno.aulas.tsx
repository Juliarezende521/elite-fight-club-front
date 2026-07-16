import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { ModalityBadge } from "@/components/app/ModalityBadge";
import { Button } from "@/components/ui/button";
import { mockClasses, getProfessor } from "@/mocks";

export const Route = createFileRoute("/aluno/aulas")({
  component: MinhasAulas,
});

function MinhasAulas() {
  const grouped = mockClasses.reduce<Record<string, typeof mockClasses>>((acc, c) => {
    const key = new Date(c.date).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
    (acc[key] ??= []).push(c);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Aluno" }, { label: "Minhas aulas" }]}
        title="Minhas aulas"
        subtitle="Agenda semanal com reserva e status em tempo real."
      />
      <div className="space-y-6">
        {Object.entries(grouped).map(([day, list]) => (
          <SectionCard key={day} title={day}>
            <div className="grid gap-2 md:grid-cols-2">
              {list.map((c) => {
                const prof = getProfessor(c.professorId);
                const lotada = c.reserved >= c.capacity;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-md bg-background/60 p-3 ring-1 ring-border"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm text-foreground">
                          {c.time}
                        </span>
                        <ModalityBadge id={c.modalityId} />
                        <StatusBadge tone={c.type === "personal" ? "info" : "muted"}>
                          {c.type === "personal" ? "Personal" : "Turma"}
                        </StatusBadge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {prof?.name} · {c.reserved}/{c.capacity} vagas
                      </div>
                    </div>
                    <Button size="sm" variant={lotada ? "outline" : "default"} disabled={lotada}>
                      {lotada ? "Lotada" : "Reservar"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        ))}
      </div>
    </>
  );
}
