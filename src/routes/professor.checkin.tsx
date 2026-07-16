import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { Button } from "@/components/ui/button";
import { QrCode, Copy, Play } from "lucide-react";

export const Route = createFileRoute("/professor/checkin")({
  component: CheckinPage,
});

function CheckinPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Professor" }, { label: "Check-in" }]}
        title="Check-in"
        subtitle="Sessões abertas, QR code fixo e presença em tempo real."
        actions={
          <Button size="sm">
            <Play className="mr-1.5 h-4 w-4" />
            Abrir sessão
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="QR Code fixo" className="lg:col-span-1">
          <div className="mx-auto grid h-48 w-48 place-items-center rounded-lg bg-background ring-1 ring-border">
            <QrCode className="h-24 w-24 text-muted-foreground" aria-hidden />
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full">
            <Copy className="mr-1.5 h-4 w-4" />
            Copiar link do check-in
          </Button>
        </SectionCard>
        <SectionCard title="Sessão atual" className="lg:col-span-2">
          <p className="text-sm text-muted-foreground">
            Nenhuma sessão aberta. Ao iniciar, os alunos poderão fazer check-in
            escaneando o QR fixo da academia.
          </p>
        </SectionCard>
      </div>
    </>
  );
}
