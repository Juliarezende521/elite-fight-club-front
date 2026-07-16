import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app/AppLayout";

export const Route = createFileRoute("/aluno")({
  ssr: false,
  component: () => <AppLayout role="ALUNO" />,
});
