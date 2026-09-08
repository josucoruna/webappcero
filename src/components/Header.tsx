import Link from "next/link";

import type { CurrentUser } from "@/lib/authz";
import { logout } from "@/lib/actions/auth";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function Header({ user }: { user: CurrentUser }) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto max-w-4xl px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="h-7 w-auto" />
            <span className="font-semibold text-foreground">LuaOne</span>
          </Link>
          {/* ponytail: menú sin JS (checkbox + CSS); si hace falta cerrar
           * al pulsar fuera o con Escape, pasar a un componente cliente. */}
          <label
            htmlFor="nav-toggle"
            // mr-12: dejar sitio al botón fijo de modo claro/oscuro, que
            // flota siempre en la esquina superior derecha de la pantalla.
            className="mr-12 grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-md border border-line text-lg leading-none text-foreground sm:mr-0 sm:hidden"
            aria-label="Abrir menú"
          >
            ☰
          </label>
        </div>

        <input type="checkbox" id="nav-toggle" className="peer sr-only" />

        <div className="hidden flex-col gap-4 pt-4 peer-checked:flex sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-3">
          <nav className="flex flex-col gap-3 text-sm font-medium text-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
            <Link href="/calendar" className="hover:text-foreground">
              Calendario
            </Link>
            <Link href="/availability" className="hover:text-foreground">
              Mi disponibilidad
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
      </div>
    </header>
  );
}
