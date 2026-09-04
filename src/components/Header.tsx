import Link from "next/link";

import type { CurrentUser } from "@/lib/authz";
import { logout } from "@/lib/actions/auth";

export function Header({ user }: { user: CurrentUser }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <nav className="flex items-center gap-5 text-sm font-medium text-zinc-600">
          <Link href="/dashboard" className="text-zinc-900 font-semibold">
            Equipos de Iglesia
          </Link>
          {user.isSuperAdmin && (
            <>
              <Link href="/admin/teams" className="hover:text-zinc-900">
                Equipos
              </Link>
              <Link href="/admin/users" className="hover:text-zinc-900">
                Personas
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-zinc-500">
            {user.name}
            {user.isSuperAdmin && (
              <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                Admin principal
              </span>
            )}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-zinc-700 hover:bg-zinc-100"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
