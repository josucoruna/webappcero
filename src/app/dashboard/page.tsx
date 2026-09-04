import Link from "next/link";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { respondToAssignment } from "@/lib/actions/services";
import { Header } from "@/components/Header";

const statusStyles: Record<string, string> = {
  PENDING: "bg-zinc-100 text-zinc-600",
  CONFIRMED: "bg-green-100 text-green-800",
  DECLINED: "bg-red-100 text-red-700",
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
        <h1 className="text-2xl font-semibold text-zinc-900">
          Hola, {user.name}
        </h1>

        {user.isSuperAdmin && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Eres el admin principal: tienes acceso total a todos los equipos
            y personas desde el menú superior.
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">
            Tus próximas asignaciones
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {myUpcomingPositions.map((position) => (
              <li
                key={position.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {position.name} · {position.service.title}
                  </p>
                  <p className="text-sm text-zinc-500">
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
                </div>
                <div className="flex items-center gap-2">
                  {position.status !== "CONFIRMED" && (
                    <form
                      action={respondToAssignment.bind(
                        null,
                        position.id,
                        "CONFIRMED",
                      )}
                    >
                      <button
                        type="submit"
                        className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Confirmar
                      </button>
                    </form>
                  )}
                  {position.status !== "DECLINED" && (
                    <form
                      action={respondToAssignment.bind(
                        null,
                        position.id,
                        "DECLINED",
                      )}
                    >
                      <button
                        type="submit"
                        className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        Rechazar
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
            {myUpcomingPositions.length === 0 && (
              <p className="text-sm text-zinc-500">
                No tienes ninguna asignación próxima.
              </p>
            )}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-900">Tus equipos</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {memberships.map((membership) => (
              <li key={membership.id}>
                <Link
                  href={`/teams/${membership.teamId}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 hover:border-zinc-400"
                >
                  <span className="font-medium text-zinc-900">
                    {membership.team.name}
                  </span>
                  {membership.role === "LEADER" && (
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                      Líder
                    </span>
                  )}
                </Link>
              </li>
            ))}
            {memberships.length === 0 && (
              <p className="text-sm text-zinc-500">
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
