import { createFileRoute } from "@tanstack/react-router";
import { DemoOnlyContent } from "@/components/auth/DemoOnlyContent";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { ModalityBadge } from "@/components/app/ModalityBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { mockStudents, getPrajied } from "@/mocks";

export const Route = createFileRoute("/professor/alunos")({
  component: () => (
    <DemoOnlyContent>
      <AlunosPage />
    </DemoOnlyContent>
  ),
});

function AlunosPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Professor" }, { label: "Alunos" }]}
        title="Alunos"
        subtitle="Busque, filtre e acompanhe cada aluno."
        actions={
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Novo aluno
          </Button>
        }
      />
      <SectionCard>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar alunos..." className="bg-background pl-8" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="pb-2 font-medium">Aluno</th>
                <th className="pb-2 font-medium">Modalidades</th>
                <th className="pb-2 font-medium">Faixa</th>
                <th className="pb-2 font-medium">Financeiro</th>
                <th className="pb-2 font-medium">Frequência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockStudents.map((s) => {
                const prj = getPrajied(s.prajiedId);
                const tone =
                  s.financialStatus === "em_dia"
                    ? "success"
                    : s.financialStatus === "atrasado"
                      ? "destructive"
                      : "warning";
                return (
                  <tr key={s.id}>
                    <td className="py-3">
                      <div className="font-medium text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.email}</div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.modalityIds.map((id) => (
                          <ModalityBadge key={id} id={id} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-sm ring-1 ring-border"
                          style={{ background: prj?.colorHex }}
                        />
                        <span className="text-foreground">{prj?.name}</span>
                      </span>
                    </td>
                    <td className="py-3">
                      <StatusBadge tone={tone}>{s.financialStatus.replace("_", " ")}</StatusBadge>
                    </td>
                    <td className="py-3 text-muted-foreground">{s.checkInsMonth} este mês</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
