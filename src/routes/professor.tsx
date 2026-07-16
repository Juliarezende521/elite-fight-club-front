import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app/AppLayout";

export const Route = createFileRoute("/professor")({
  ssr: false,
  component: () => <AppLayout role="PROFESSOR" />,
});
