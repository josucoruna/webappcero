import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { canManageTeam, requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { removeTeamMember, setTeamMemberRole } from "@/lib/actions/teams";
import { AddMemberForm } from "@/components/forms/AddMemberForm";
import { CreateServiceForm } from "@/components/forms/CreateServiceForm";
import { UpdateTeamForm } from "@/components/forms/UpdateTeamForm";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, cardClassName } from "@/components/ui/Card";

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
      {canManage ? (
        <Card>
          <UpdateTeamForm
            teamId={team.id}
            name={team.name}
            description={team.description ?? ""}
          />
        </Card>
      ) : (
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {team.name}
          </h1>
          {team.description && (
            <p className="mt-1 text-sm text-muted">{team.description}</p>
          )}
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Personas</h2>
        {canManage && (
          <div className="mt-3">
            <AddMemberForm teamId={team.id} />
          </div>
        )}
        <ul className="mt-4 flex flex-col gap-2">
          {team.memberships.map((membership) => (
            <Card
              as="li"
              key={membership.id}
              padding="p-3"
              className="flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-foreground">
                  {membership.user.name}
                  {membership.role === "LEADER" && (
                    <Badge variant="info" className="ml-2">
                      Líder
                    </Badge>
                  )}
                  {membership.userId === user.id && (
                    <span className="ml-2 text-xs text-subtle">(tú)</span>
                  )}
                </p>
                <p className="text-sm text-muted">
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
                    <Button type="submit" variant="secondary" size="sm">
                      {membership.role === "LEADER"
                        ? "Quitar líder"
                        : "Hacer líder"}
                    </Button>
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
                    >
                      Quitar
                    </ConfirmSubmitButton>
                  </form>
                </div>
              )}
            </Card>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Servicios</h2>
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
                className={cardClassName({
                  padding: "p-3",
                  interactive: true,
                  className: "flex items-center justify-between",
                })}
              >
                <div>
                  <p className="font-medium text-foreground">
                    {service.title}
                  </p>
                  <p className="text-sm text-muted">
                    {service.date.toLocaleString("es-ES", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <span className="text-sm text-subtle">
                  {service._count.positions} puesto
                  {service._count.positions === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          ))}
          {team.services.length === 0 && (
            <p className="text-sm text-muted">
              Todavía no hay servicios programados en este equipo.
            </p>
          )}
        </ul>
      </section>
    </>
  );
}
