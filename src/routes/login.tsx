import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Swords, ShieldCheck, GraduationCap, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, homePathFor } from "@/lib/auth";
import type { Role } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Elite Fight Club" },
      { name: "description", content: "Acesse o sistema Elite Fight Club." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

const ROLES: { role: Role; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { role: "ALUNO", label: "Aluno", icon: UserIcon, desc: "Aulas, frequência e evolução." },
  { role: "PROFESSOR", label: "Professor", icon: GraduationCap, desc: "Agenda, turmas e check-in." },
  { role: "ADMIN", label: "Admin", icon: ShieldCheck, desc: "Financeiro, relatórios e cadastros." },
];

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("ALUNO");
  const [email, setEmail] = useState("rafael@elitefc.com");
  const [password, setPassword] = useState("••••••••");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha email e senha.");
      return;
    }
    const s = signIn(role);
    toast.success(`Bem-vindo, ${s.user.name.split(" ")[0]}!`);
    navigate({ to: homePathFor(role) });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-destructive/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,var(--background)_70%)]" />
      </div>

      <div className="relative grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="hidden flex-col justify-between rounded-2xl bg-card p-8 ring-1 ring-border lg:flex">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/40">
              <Swords className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="heading-hero text-lg text-foreground">Elite Fight Club</div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Gestão premium para academias de lutas
              </div>
            </div>
          </div>

          <div>
            <h2 className="heading-hero text-4xl leading-tight text-foreground">
              Treine.<br />
              Evolua.<br />
              <span className="text-primary">Conquiste.</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Uma plataforma única para alunos, professores e gestores da sua
              academia. Frequência, graduações, financeiro e agenda em um só lugar.
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <li className="rounded-md bg-background/60 p-3 ring-1 ring-border">
              <div className="font-display text-lg text-foreground">+12</div>
              modalidades suportadas
            </li>
            <li className="rounded-md bg-background/60 p-3 ring-1 ring-border">
              <div className="font-display text-lg text-foreground">24/7</div>
              check-in por QR Code
            </li>
          </ul>
        </div>

        <div className="rounded-2xl bg-card p-6 ring-1 ring-border sm:p-8">
          <div className="mb-6">
            <h1 className="heading-hero text-2xl text-foreground">Entrar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Escolha seu perfil de acesso para continuar.
            </p>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-2">
            {ROLES.map((r) => {
              const active = r.role === role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setRole(r.role)}
                  className={
                    "flex flex-col items-start gap-1 rounded-md p-3 text-left ring-1 transition-colors " +
                    (active
                      ? "bg-primary/10 ring-primary/50"
                      : "bg-background/40 ring-border hover:bg-accent")
                  }
                >
                  <r.icon
                    className={
                      "h-4 w-4 " + (active ? "text-primary" : "text-muted-foreground")
                    }
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    {r.label}
                  </span>
                  <span className="text-[10px] leading-tight text-muted-foreground">
                    {r.desc}
                  </span>
                </button>
              );
            })}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-background"
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Esqueci minha senha
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 bg-background"
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Entrar como {ROLES.find((r) => r.role === role)?.label}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              Autenticação real via Firebase + Spring Boot será conectada em seguida.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
