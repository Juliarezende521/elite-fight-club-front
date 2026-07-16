import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { mockCurrentStudent, mockGraduationEvents, getPrajied, getModality } from "@/mocks";

export const Route = createFileRoute("/aluno/graduacao")({
  component: Graduacao,
});

function Graduacao() {
  const s = mockCurrentStudent;
  const current = getPrajied(s.prajiedId);
  const next = s.nextPrajiedId ? getPrajied(s.nextPrajiedId) : undefined;
  const pct = Math.min(100, Math.round((s.checkInsTotal / (s.requiredCheckIns || 1)) * 100));

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Aluno" }, { label: "Graduação" }]}
        title="Minha graduação"
        subtitle="Faixa atual, elegibilidade e eventos disponíveis."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Faixa atual" className="lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className="h-16 w-16 shrink-0 rounded-md ring-2 ring-border"
              style={{ backgroundColor: current?.colorHex }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="font-display text-2xl text-foreground">{current?.name}</div>
              <div className="text-sm text-muted-foreground">
                Próxima: <span className="text-foreground">{next?.name ?? "—"}</span>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Progresso</span>
                  <span>{s.checkInsTotal}/{s.requiredCheckIns}</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            </div>
            <StatusBadge tone={pct >= 100 ? "success" : "info"}>
              {pct >= 100 ? "Elegível" : "Em progresso"}
            </StatusBadge>
          </div>
        </SectionCard>

        <SectionCard title="Requisitos">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span className="text-muted-foreground">Check-ins mínimos</span><span className="text-foreground">{next?.minCheckIns ?? "—"}</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Tempo mínimo</span><span className="text-foreground">{next?.minMonths ?? "—"} meses</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Certificados</span><span className="text-foreground">Aguardando</span></li>
          </ul>
        </SectionCard>

        <SectionCard title="Próximos eventos" className="lg:col-span-3">
          <div className="grid gap-3 md:grid-cols-2">
            {mockGraduationEvents.map((ev) => {
              const modality = getModality(ev.modalityId);
              const prj = getPrajied(ev.prajiedId);
              return (
                <div key={ev.id} className="flex items-center justify-between gap-3 rounded-md bg-background/60 p-4 ring-1 ring-border">
                  <div className="min-w-0">
                    <div className="font-display text-lg text-foreground">
                      {modality?.name} · {prj?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(ev.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })} · {ev.location}
                    </div>
                    <div className="mt-1 text-sm text-foreground">
                      {ev.fee.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Inscrever-se</Button>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
