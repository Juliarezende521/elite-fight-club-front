import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/context";
import { appEnv } from "@/lib/env";
import { EmptyState } from "@/components/app/EmptyState";

export function DemoOnlyContent({ children }: { children: ReactNode }) {
  const { isDemoSession } = useAuth();
  if (!appEnv.enableDemoMode || !isDemoSession) {
    return (
      <EmptyState
        title="Integração em andamento"
        description="Os dados desta tela ainda não estão disponíveis."
      />
    );
  }
  return children;
}
