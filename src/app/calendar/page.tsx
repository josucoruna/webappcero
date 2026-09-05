import Link from "next/link";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { addMonths, dateKey, getMonthGrid, WEEKDAY_LABELS } from "@/lib/calendar";
import { Header } from "@/components/Header";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const user = await requireUser();
  const { y, m } = await searchParams;

  const now = new Date();
  const year = Number(y) || now.getFullYear();
  const month = Number(m) || now.getMonth() + 1;

  const days = getMonthGrid(year, month);
  const gridStart = days[0];
  const gridEnd = new Date(days[41].getFullYear(), days[41].getMonth(), days[41].getDate() + 1);

  const [services, manageableTeams] = await Promise.all([
    prisma.service.findMany({
      where: {
        date: { gte: gridStart, lt: gridEnd },
        team: user.isSuperAdmin
          ? undefined
          : { memberships: { some: { userId: user.id } } },
      },
      include: { team: true },
      orderBy: { date: "asc" },
    }),
    prisma.team.findMany({
      where: user.isSuperAdmin
        ? undefined
        : { memberships: { some: { userId: user.id, role: "LEADER" } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const servicesByDay = new Map<string, typeof services>();
  for (const service of services) {
    const key = dateKey(service.date);
    const list = servicesByDay.get(key) ?? [];
    list.push(service);
    servicesByDay.set(key, list);
  }

  const canCreate = manageableTeams.length > 0;
  const prev = addMonths(year, month, -1);
  const next = addMonths(year, month, 1);
  const monthLabel = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground capitalize">
            {monthLabel}
          </h1>
          <div className="flex gap-2">
            <Link
              href={`/calendar?y=${prev.year}&m=${prev.month}`}
              className="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-accent"
            >
              ← Anterior
            </Link>
            <Link
              href={`/calendar?y=${now.getFullYear()}&m=${now.getMonth() + 1}`}
              className="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-accent"
            >
              Hoy
            </Link>
            <Link
              href={`/calendar?y=${next.year}&m=${next.month}`}
              className="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-accent"
            >
              Siguiente →
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2 text-xs">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="px-2 py-1 text-center font-medium text-muted"
            >
              {label}
            </div>
          ))}

          {days.map((day) => {
            const key = dateKey(day);
            const isCurrentMonth = day.getMonth() === month - 1;
            const isSaturday = day.getDay() === 6;
            const dayServices = servicesByDay.get(key) ?? [];
            const canCreateHere = isCurrentMonth && canCreate;

            return (
              <div
                key={key}
                className={`group relative min-h-[92px] rounded-xl border border-line p-1.5 transition ${
                  !isCurrentMonth
                    ? "bg-muted-surface"
                    : isSaturday
                      ? "bg-amber-50 dark:bg-amber-500/10"
                      : "bg-surface"
                } ${canCreateHere ? "hover:border-muted" : ""}`}
              >
                {canCreateHere && (
                  <Link
                    href={`/calendar/new?date=${key}`}
                    className="absolute inset-0 rounded-xl"
                    title="Añadir servicio"
                    aria-label={`Añadir servicio el ${key}`}
                  />
                )}
                <span
                  className={
                    isCurrentMonth
                      ? "font-medium text-foreground"
                      : "text-zinc-300 dark:text-zinc-700"
                  }
                >
                  {day.getDate()}
                </span>
                <div className="relative mt-1 flex flex-col gap-1">
                  {dayServices.map((service) => (
                    <Link
                      key={service.id}
                      href={`/teams/${service.teamId}/services/${service.id}`}
                      className="relative z-10 block truncate rounded-lg bg-blue-100 px-1.5 py-0.5 text-blue-800 hover:bg-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25"
                      title={`${service.title} · ${service.team.name}`}
                    >
                      {service.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {!canCreate && (
          <p className="mt-4 text-sm text-muted">
            Aquí ves los servicios de tus equipos. Solo los líderes y el
            admin principal pueden añadir servicios nuevos.
          </p>
        )}
      </main>
    </>
  );
}
