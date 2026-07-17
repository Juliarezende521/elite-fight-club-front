import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { mockNotifications } from "@/mocks";
import type { Notification } from "@/types";

export const Route = createFileRoute("/aluno/notificacoes")({
  component: Notificacoes,
});

const categories: (Notification["category"] | "todas")[] = [
  "todas",
  "financeiro",
  "aula",
  "checkin",
  "graduacao",
  "pagamento",
  "certificado",
  "sistema",
];

function Notificacoes() {
  const [cat, setCat] = useState<(typeof categories)[number]>("todas");
  const [onlyUnread, setOnlyUnread] = useState(false);

  const list = mockNotifications.filter(
    (n) => (cat === "todas" || n.category === cat) && (!onlyUnread || !n.read),
  );

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Aluno" }, { label: "Notificações" }]}
        title="Notificações"
        subtitle="Avisos de aulas, financeiro, graduações e sistema."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setOnlyUnread((v) => !v)}>
              {onlyUnread ? "Ver todas" : "Só não lidas"}
            </Button>
            <Button size="sm">Marcar todas como lidas</Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={
              "rounded-full px-3 py-1 text-[11px] uppercase tracking-widest ring-1 transition-colors " +
              (cat === c
                ? "bg-primary/15 text-primary ring-primary/40"
                : "bg-card text-muted-foreground ring-border hover:text-foreground")
            }
          >
            {c}
          </button>
        ))}
      </div>

      <SectionCard>
        <ul className="divide-y divide-border">
          {list.map((n) => (
            <li key={n.id} className="flex gap-3 py-3">
              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent text-muted-foreground">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{n.title}</span>
                  {!n.read && (
                    <StatusBadge tone="info" dot={false}>
                      Nova
                    </StatusBadge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{n.message}</p>
              </div>
              <div className="whitespace-nowrap text-[11px] text-muted-foreground">
                {new Date(n.date).toLocaleDateString("pt-BR")}
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}
