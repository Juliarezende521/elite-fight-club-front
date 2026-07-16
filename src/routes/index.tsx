import { createFileRoute, Navigate } from "@tanstack/react-router";
import { getSession, homePathFor } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const session = getSession();
  if (!session) return <Navigate to="/login" />;
  return <Navigate to={homePathFor(session.user.role)} />;
}
