import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { canManageTeam, requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { removeTeamMember, setTeamMemberRole } from "@/lib/actions/teams";
import { Header } from "@/components/Header";
import { AddMemberForm } from "@/components/forms/AddMemberForm";
import { CreateServiceForm } from "@/components/forms/CreateServiceForm";
import { UpdateTeamForm } from "@/components/forms/UpdateTeamForm";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const user = await requireUser();

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      memberships: {
        include: { user: true },
        orderBy: { user: { name: "asc" } },
      },
      services: {
        orderBy: { date: "asc" },
        include: { _count: { select: { positions: true } } },
      },
    },
  });
  if (!team) notFound();

  const isMember = team.memberships.some((m) => m.userId === user.id);
  if (!isMember && !user.isSuperAdmin) redirect("/dashboard");

  const canManage = await canManageTeam(user, teamId);

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        {canManage ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <UpdateTeamForm
              teamId={team.id}
              name={team.name}
              description={team.description ?? ""}
            />
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              {team.name}
            </h1>
            {team.description && (
              <p className="mt-1 text-sm text-zinc-500">{team.description}</p>
            )}
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-900">Personas</h2>
          {canManage && (
            <div className="mt-3">
              <AddMemberForm teamId={team.id} />
            </div>
          )}
          <ul className="mt-4 flex flex-col gap-2">
            {team.memberships.map((membership) => (
              <li
                key={membership.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {membership.user.name}
                    {membership.role === "LEADER" && (
                      <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                        Líder
                      </span>
                    )}
                    {membership.userId === user.id && (
                      <span className="ml-2 text-xs text-zinc-400">(tú)</span>
                    )}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {membership.user.email}
                  </p>
                </div>
                {canManage && (
                  <div className="flex items-center gap-2">
                    <form
                      action={setTeamMemberRole.bind(
                        null,
                        team.id,
                        membership.userId,
                        membership.role === "LEADER" ? "MEMBER" : "LEADER",
                      )}
                    >
                      <button
                        type="submit"
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                      >
                        {membership.role === "LEADER"
                          ? "Quitar líder"
                          : "Hacer líder"}
                      </button>
                    </form>
                    <form
                      action={removeTeamMember.bind(
                        null,
                        team.id,
                        membership.userId,
                      )}
                    >
                      <ConfirmSubmitButton
                        confirmMessage={`¿Quitar a ${membership.user.name} del equipo?`}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        Quitar
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-900">Servicios</h2>
          {canManage && (
            <div className="mt-3">
              <CreateServiceForm teamId={team.id} />
            </div>
          )}
          <ul className="mt-4 flex flex-col gap-2">
            {team.services.map((service) => (
              <li key={service.id}>
                <Link
                  href={`/teams/${team.id}/services/${service.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 hover:border-zinc-400"
                >
                  <div>
                    <p className="font-medium text-zinc-900">
                      {service.title}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {service.date.toLocaleString("es-ES", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span className="text-sm text-zinc-400">
                    {service._count.positions} puesto
                    {service._count.positions === 1 ? "" : "s"}
                  </span>
                </Link>
              </li>
            ))}
            {team.services.length === 0 && (
              <p className="text-sm text-zinc-500">
                Todavía no hay servicios programados en este equipo.
              </p>
            )}
          </ul>
        </section>
      </main>
    </>
  );
}
