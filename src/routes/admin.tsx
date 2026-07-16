import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app/AppLayout";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: () => <AppLayout role="ADMIN" />,
});
