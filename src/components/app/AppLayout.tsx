import type { ReactNode } from "react";
import { Navigate, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import type { Role } from "@/types";
import { useAppUser, useAuth } from "@/lib/auth/context";
import { AuthState } from "@/components/auth/AuthState";

function errorStatus(error: unknown) {
  return typeof error === "object" && error && "status" in error ? error.status : null;
}

export function AppLayout({ role, children }: { role: Role; children?: ReactNode }) {
  const auth = useAuth();
  const user = useAppUser();

  if (auth.authLoading || auth.backendSessionLoading) {
    return (
      <AuthState
        title="Carregando sessão"
        description="Estamos confirmando seu acesso com segurança."
      />
    );
  }

  if (!auth.firebaseUser && !auth.isDemoSession) return <Navigate to="/login" />;

  if (auth.backendSessionError) {
    const status = errorStatus(auth.backendSessionError);

    if (status === 404) {
      return (
        <AuthState
          title="Cadastro não encontrado"
          description="Seu login foi aceito, mas ainda não existe cadastro vinculado no sistema."
          actionLabel="Sair"
          onAction={() => void auth.logout()}
        />
      );
    }

    if (status === 403) {
      return (
        <AuthState
          title="Acesso negado"
          description="Seu usuário não tem permissão para acessar este recurso."
          actionLabel="Sair"
          onAction={() => void auth.logout()}
        />
      );
    }

    if (status === 401) {
      return (
        <AuthState
          title="Sessão inválida"
          description="Entre novamente para continuar."
          actionLabel="Sair"
          onAction={() => void auth.logout()}
        />
      );
    }

    return (
      <AuthState
        title="Não foi possível carregar sua sessão"
        description="O servidor está indisponível ou sua sessão expirou. Tente novamente."
        actionLabel="Tentar novamente"
        onAction={() => void auth.refreshSession()}
      />
    );
  }

  if (!auth.authenticatedUser) {
    return (
      <AuthState
        title="Cadastro não encontrado"
        description="Seu login foi aceito, mas ainda não existe cadastro vinculado no sistema."
        actionLabel="Sair"
        onAction={() => void auth.logout()}
      />
    );
  }

  if (!auth.authenticatedUser.ativo) {
    return (
      <AuthState
        title="Usuário inativo"
        description="Seu acesso está inativo. Fale com a academia para regularizar."
        actionLabel="Sair"
        onAction={() => void auth.logout()}
      />
    );
  }

  if (!auth.academia) {
    return (
      <AuthState
        title="Academia não vinculada"
        description="Seu usuário ainda não possui uma academia associada."
        actionLabel="Sair"
        onAction={() => void auth.logout()}
      />
    );
  }

  if (auth.role !== role) {
    return auth.homePath ? <Navigate to={auth.homePath} /> : <Navigate to="/login" />;
  }

  if (!user) return <Navigate to="/login" />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar role={role} />
        <SidebarInset className="min-w-0 flex-1">
          <AppHeader user={user} />
          <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children ?? <Outlet />}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
