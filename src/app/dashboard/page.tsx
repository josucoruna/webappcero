import Link from "next/link";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { RespondToAssignmentControls } from "@/components/forms/RespondToAssignmentControls";

const statusStyles: Record<string, string> = {
  PENDING: "bg-accent text-muted",
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
  DECLINED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente de confirmar",
  CONFIRMED: "Confirmado",
  DECLINED: "Rechazado",
};

export default async function DashboardPage() {
  const user = await requireUser();

  const [memberships, myUpcomingPositions] = await Promise.all([
    prisma.teamMembership.findMany({
      where: { userId: user.id },
      include: { team: true },
      orderBy: { team: { name: "asc" } },
    }),
    prisma.position.findMany({
      where: {
        assignedUserId: user.id,
        service: { date: { gte: new Date() } },
      },
      include: { service: { include: { team: true } } },
      orderBy: { service: { date: "asc" } },
    }),
  ]);

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold text-foreground">
          Hola, {user.name}
        </h1>

        {user.isSuperAdmin && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-300">
            Eres el admin principal: tienes acceso total a todos los equipos
            y personas desde el menú superior.
          </div>
        )}

        <Link
          href="/calendar"
          className="mt-6 flex items-center gap-4 rounded-lg border border-line bg-surface p-5 transition hover:border-muted"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </span>
          <span className="flex-1">
            <span className="block font-semibold text-foreground">
              Calendario de servicios
            </span>
            <span className="block text-sm text-muted">
              Consulta y añade los servicios de tus equipos, mes a mes.
            </span>
          </span>
          <span className="text-xl text-muted">→</span>
        </Link>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">
            Tus próximas asignaciones
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {myUpcomingPositions.map((position) => (
              <li
                key={position.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {position.name} · {position.service.title}
                  </p>
                  <p className="text-sm text-muted">
                    {position.service.team.name} ·{" "}
                    {position.service.date.toLocaleString("es-ES", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${statusStyles[position.status]}`}
                  >
                    {statusLabels[position.status]}
                  </span>
                  {position.status === "DECLINED" && position.declineReason && (
                    <p className="mt-1 text-xs italic text-muted">
                      Motivo: {position.declineReason}
                    </p>
                  )}
                </div>
                <RespondToAssignmentControls
                  positionId={position.id}
                  status={position.status}
                />
              </li>
            ))}
            {myUpcomingPositions.length === 0 && (
              <p className="text-sm text-muted">
                No tienes ninguna asignación próxima.
              </p>
            )}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">Tus equipos</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {memberships.map((membership) => (
              <li key={membership.id}>
                <Link
                  href={`/teams/${membership.teamId}`}
                  className="flex items-center justify-between rounded-lg border border-line bg-surface p-3 hover:border-muted"
                >
                  <span className="font-medium text-foreground">
                    {membership.team.name}
                  </span>
                  {membership.role === "LEADER" && (
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
                      Líder
                    </span>
                  )}
                </Link>
              </li>
            ))}
            {memberships.length === 0 && (
              <p className="text-sm text-muted">
                Todavía no perteneces a ningún equipo.
                {user.isSuperAdmin
                  ? " Crea uno desde el menú \"Equipos\"."
                  : " Pide a tu líder o al admin principal que te añada."}
              </p>
            )}
          </ul>
        </section>
      </main>
    </>
  );
}
