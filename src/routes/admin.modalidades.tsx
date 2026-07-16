import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { ModalityBadge } from "@/components/app/ModalityBadge";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { mockModalities } from "@/mocks";

export const Route = createFileRoute("/admin/modalidades")({
  component: ModalidadesPage,
});

function ModalidadesPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Admin" }, { label: "Modalidades" }]}
        title="Modalidades"
        subtitle="Cadastro dinâmico — o sistema aceita qualquer modalidade."
        actions={
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Nova modalidade
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mockModalities.map((m) => (
          <SectionCard key={m.id}>
            <div className="flex items-center justify-between">
              <ModalityBadge id={m.id} />
              <StatusBadge tone={m.active ? "success" : "muted"}>
                {m.active ? "Ativa" : "Inativa"}
              </StatusBadge>
            </div>
            <div className="mt-3 font-display text-xl text-foreground">{m.name}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Alunos</div>
                <div className="font-display text-lg text-foreground">{m.studentsCount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Aulas/semana</div>
                <div className="font-display text-lg text-foreground">{m.weeklyClasses}</div>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </>
  );
}
