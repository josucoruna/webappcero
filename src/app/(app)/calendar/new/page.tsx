import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { dateKey } from "@/lib/calendar";
import { NewServiceForm } from "@/components/forms/NewServiceForm";

export default async function NewServiceFromCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireUser();
  const { date } = await searchParams;

  const manageableTeams = await prisma.team.findMany({
    where: user.isSuperAdmin
      ? undefined
      : { memberships: { some: { userId: user.id, role: "LEADER" } } },
    orderBy: { name: "asc" },
  });

  if (manageableTeams.length === 0) redirect("/calendar");

  const defaultDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : dateKey(new Date());

  return (
    <div className="mx-auto max-w-md">
      <Link href="/calendar" className="text-sm text-muted hover:underline">
        ← Calendario
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">
        Nuevo servicio
      </h1>
      <div className="mt-6">
        <NewServiceForm teams={manageableTeams} defaultDate={defaultDate} />
      </div>
    </div>
  );
}
