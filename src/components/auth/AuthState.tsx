import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AuthState({ title, description, actionLabel, onAction }: AuthStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-accent text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {actionLabel && onAction && (
          <div className="mt-6">
            <Button type="button" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
