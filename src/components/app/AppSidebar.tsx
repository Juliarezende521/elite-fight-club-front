import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  LineChart,
  Award,
  Wallet,
  Bell,
  Users,
  QrCode,
  Dumbbell,
  UserCog,
  Settings,
  FileBarChart,
  ScrollText,
  LogOut,
  Swords,
} from "lucide-react";
import type { Role } from "@/types";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth";

type NavItem = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };

const NAV: Record<Role, { label: string; items: NavItem[] }[]> = {
  ALUNO: [
    {
      label: "Meu treino",
      items: [
        { title: "Dashboard", url: "/aluno/dashboard", icon: LayoutDashboard },
        { title: "Minhas aulas", url: "/aluno/aulas", icon: CalendarDays },
        { title: "Frequência", url: "/aluno/frequencia", icon: ClipboardList },
        { title: "Evolução", url: "/aluno/evolucao", icon: LineChart },
        { title: "Graduação", url: "/aluno/graduacao", icon: Award },
      ],
    },
    {
      label: "Conta",
      items: [
        { title: "Financeiro", url: "/aluno/financeiro", icon: Wallet },
        { title: "Notificações", url: "/aluno/notificacoes", icon: Bell },
      ],
    },
  ],
  PROFESSOR: [
    {
      label: "Operação",
      items: [
        { title: "Dashboard", url: "/professor/dashboard", icon: LayoutDashboard },
        { title: "Minha agenda", url: "/professor/agenda", icon: CalendarDays },
        { title: "Turmas", url: "/professor/turmas", icon: Users },
        { title: "Personais", url: "/professor/personais", icon: UserCog },
        { title: "Check-in", url: "/professor/checkin", icon: QrCode },
      ],
    },
    {
      label: "Gestão",
      items: [
        { title: "Graduações", url: "/professor/graduacoes", icon: Award },
        { title: "Alunos", url: "/professor/alunos", icon: Users },
        { title: "Notificações", url: "/professor/notificacoes", icon: Bell },
      ],
    },
  ],
  ADMIN: [
    {
      label: "Visão geral",
      items: [
        { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
        { title: "Financeiro", url: "/admin/financeiro", icon: Wallet },
        { title: "Relatórios", url: "/admin/relatorios", icon: FileBarChart },
      ],
    },
    {
      label: "Cadastros",
      items: [
        { title: "Modalidades", url: "/admin/modalidades", icon: Dumbbell },
        { title: "Professores", url: "/admin/professores", icon: UserCog },
        { title: "Alunos", url: "/admin/alunos", icon: Users },
      ],
    },
    {
      label: "Sistema",
      items: [
        { title: "Configurações", url: "/admin/configuracoes", icon: Settings },
        { title: "Auditoria", url: "/admin/auditoria", icon: ScrollText },
      ],
    },
  ],
};

export function AppSidebar({ role }: { role: Role }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const groups = NAV[role];

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/40">
            <Swords className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="font-display text-sm uppercase tracking-widest text-sidebar-foreground">
              Elite Fight
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Club</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {g.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((it) => {
                  const active = pathname.startsWith(it.url);
                  return (
                    <SidebarMenuItem key={it.url}>
                      <SidebarMenuButton asChild isActive={active} tooltip={it.title}>
                        <Link to={it.url} className="flex items-center gap-2">
                          <it.icon className="h-4 w-4" />
                          <span>{it.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sair"
              onClick={() => {
                void signOut();
                window.location.href = "/login";
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
