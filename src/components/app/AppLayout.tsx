import type { ReactNode } from "react";
import { Navigate, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { getSession } from "@/lib/auth";
import type { Role } from "@/types";

export function AppLayout({ role, children }: { role: Role; children?: ReactNode }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" />;
  if (session.user.role !== role) return <Navigate to="/login" />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar role={role} />
        <SidebarInset className="min-w-0 flex-1">
          <AppHeader user={session.user} />
          <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children ?? <Outlet />}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
