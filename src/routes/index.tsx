import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AuthState } from "@/components/auth/AuthState";
import { useAuth } from "@/lib/auth/context";

export const Route = createFileRoute("/")({
  ssr: false,
  component: IndexRedirect,
});

function IndexRedirect() {
  const auth = useAuth();

  if (auth.authLoading || auth.backendSessionLoading) {
    return (
      <AuthState
        title="Carregando sessão"
        description="Estamos confirmando seu acesso com segurança."
      />
    );
  }

  if (!auth.firebaseUser && !auth.isDemoSession) return <Navigate to="/login" />;
  if (auth.homePath) return <Navigate to={auth.homePath} />;
  return <Navigate to="/login" />;
}
