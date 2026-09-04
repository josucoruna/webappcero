import Link from "next/link";

import { requireSuperAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { deleteTeam } from "@/lib/actions/teams";
import { Header } from "@/components/Header";
import { CreateTeamForm } from "@/components/forms/CreateTeamForm";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export default async function AdminTeamsPage() {
  const user = await requireSuperAdmin();

  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { memberships: true, services: true } } },
  });

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold text-foreground">Equipos</h1>
        <p className="mt-1 text-sm text-muted">
          Crea los equipos de trabajo de la iglesia. Desde cada equipo podrás
          añadir personas y nombrar líderes.
        </p>

        <div className="mt-6">
          <CreateTeamForm />
        </div>

        <ul className="mt-8 flex flex-col gap-3">
          {teams.map((team) => (
            <li
              key={team.id}
              className="flex items-center justify-between rounded-lg border border-line bg-surface p-4"
            >
              <div>
                <Link
                  href={`/teams/${team.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {team.name}
                </Link>
                {team.description && (
                  <p className="text-sm text-muted">{team.description}</p>
                )}
                <p className="mt-1 text-xs text-subtle">
                  {team._count.memberships} persona
                  {team._count.memberships === 1 ? "" : "s"} ·{" "}
                  {team._count.services} servicio
                  {team._count.services === 1 ? "" : "s"}
                </p>
              </div>
              <form action={deleteTeam.bind(null, team.id)}>
                <ConfirmSubmitButton
                  confirmMessage={`¿Eliminar el equipo "${team.name}"? Se borrarán también sus servicios y asignaciones.`}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950"
                >
                  Eliminar
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
          {teams.length === 0 && (
            <p className="text-sm text-muted">
              Todavía no has creado ningún equipo.
            </p>
          )}
        </ul>
      </main>
    </>
  );
}
