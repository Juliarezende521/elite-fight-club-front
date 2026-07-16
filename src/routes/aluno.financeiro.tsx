import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { mockCurrentStudent, mockInvoices } from "@/mocks";

export const Route = createFileRoute("/aluno/financeiro")({
  component: Financeiro,
});

function Financeiro() {
  const s = mockCurrentStudent;
  const own = mockInvoices.filter((i) => i.studentId === s.id);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Aluno" }, { label: "Financeiro" }]}
        title="Meu financeiro"
        subtitle="Mensalidade, formas de pagamento e histórico."
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Mensalidade" className="lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-display text-3xl text-foreground">R$ 289,90</div>
              <div className="text-xs text-muted-foreground">Vence dia 10 · Pix Automático</div>
            </div>
            <StatusBadge tone="success">Em dia</StatusBadge>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {(["pix", "pix_auto", "cartao", "boleto"] as const).map((m) => (
              <Button key={m} variant={s.preferredPayment === m ? "default" : "outline"} size="sm">
                {m === "pix_auto" ? "Pix Automático" : m.toUpperCase()}
              </Button>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Saldo">
          <div className="font-display text-2xl text-foreground">R$ 0,00</div>
          <p className="mt-1 text-xs text-muted-foreground">Sem cobranças pendentes.</p>
        </SectionCard>
      </div>

      <SectionCard title="Histórico">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="pb-2 font-medium">Vencimento</th>
                <th className="pb-2 font-medium">Valor</th>
                <th className="pb-2 font-medium">Método</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {own.map((i) => (
                <tr key={i.id}>
                  <td className="py-3 text-foreground">{new Date(i.dueDate).toLocaleDateString("pt-BR")}</td>
                  <td className="py-3 text-foreground">{i.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="py-3 text-muted-foreground">{i.method}</td>
                  <td className="py-3"><StatusBadge tone="success">Em dia</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
