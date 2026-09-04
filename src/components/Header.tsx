import Link from "next/link";

import type { CurrentUser } from "@/lib/authz";
import { logout } from "@/lib/actions/auth";
import { Logo } from "@/components/Logo";

export function Header({ user }: { user: CurrentUser }) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <nav className="flex items-center gap-5 text-sm font-medium text-muted">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="h-7 w-auto" />
            <span className="font-semibold text-foreground">
              Equipos de Iglesia
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
              <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                Admin principal
              </span>
            )}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-input px-3 py-1.5 text-foreground hover:bg-accent"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
