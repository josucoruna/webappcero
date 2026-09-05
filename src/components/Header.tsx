import Link from "next/link";

import type { CurrentUser } from "@/lib/authz";
import { logout } from "@/lib/actions/auth";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function Header({ user }: { user: CurrentUser }) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-muted">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="h-7 w-auto" />
            <span className="font-semibold text-foreground">
              Equipos de trabajo
            </span>
          </Link>
          <Link href="/calendar" className="hover:text-foreground">
            Calendario
          </Link>
          {user.isSuperAdmin && (
            <>
              <Link href="/admin/teams" className="hover:text-foreground">
                Equipos
              </Link>
              <Link href="/admin/users" className="hover:text-foreground">
                Personas
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">
            {user.name}
            {user.isSuperAdmin && (
              <Badge variant="warning" className="ml-2">
                Admin principal
              </Badge>
            )}
          </span>
          <form action={logout}>
            <Button type="submit" variant="secondary" size="sm">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
