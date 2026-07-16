import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app/AppLayout";

export const Route = createFileRoute("/aluno")({
  component: () => <AppLayout role="ALUNO" />,
});
