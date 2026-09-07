import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { canManageTeam, requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { removeTeamMember, setTeamMemberRole } from "@/lib/actions/teams";
import { deleteIncompatibility } from "@/lib/actions/incompatibilities";
import { AddIncompatibilityForm } from "@/components/forms/AddIncompatibilityForm";
import { AddMemberForm } from "@/components/forms/AddMemberForm";
import { BulkAssignPositionForm } from "@/components/forms/BulkAssignPositionForm";
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
      incompatibilities: {
        include: { userA: true, userB: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!team) notFound();

  const isMember = team.memberships.some((m) => m.userId === user.id);
  const isSameOrgAdmin =
    user.isSuperAdmin && team.organizationId === user.organizationId;
  if (!isMember && !isSameOrgAdmin) redirect("/dashboard");

  const canManage = await canManageTeam(user, teamId);

  let serviceHistory: { userId: string; name: string; count: number }[] = [];
  if (canManage) {
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const counts = await prisma.position.groupBy({
      by: ["assignedUserId"],
      where: {
        assignedUserId: { in: team.memberships.map((m) => m.userId) },
        status: "CONFIRMED",
        service: { teamId, date: { gte: since } },
      },
      _count: { _all: true },
    });
    const countByUserId = new Map(
      counts.map((c) => [c.assignedUserId as string, c._count._all]),
    );
    serviceHistory = team.memberships
      .map((m) => ({
        userId: m.userId,
        name: m.user.name,
        count: countByUserId.get(m.userId) ?? 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  const upcomingServices = team.services.filter((s) => s.date >= new Date());

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

      {canManage && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            Historial de servicio
          </h2>
          <p className="mt-1 text-sm text-muted">
            Veces confirmadas en los últimos 3 meses, para repartir mejor la
            carga.
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {serviceHistory.map((entry) => (
              <Card
                as="li"
                key={entry.userId}
                padding="p-3"
                className="flex items-center justify-between"
              >
                <p className="font-medium text-foreground">{entry.name}</p>
                <span className="text-sm text-muted">
                  {entry.count} {entry.count === 1 ? "vez" : "veces"}
                </span>
              </Card>
            ))}
          </ul>
        </section>
      )}

      {canManage && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            Incompatibilidades
          </h2>
          <p className="mt-1 text-sm text-muted">
            Si dos personas no deben coincidir en el mismo servicio, márcalo
            aquí. No se bloquea la asignación, solo se avisa al asignar.
          </p>
          <div className="mt-3">
            <AddIncompatibilityForm
              teamId={team.id}
              members={team.memberships.map((m) => ({
                userId: m.userId,
                name: m.user.name,
              }))}
            />
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {team.incompatibilities.map((incompatibility) => (
              <Card
                as="li"
                key={incompatibility.id}
                padding="p-3"
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {incompatibility.userA.name} · {incompatibility.userB.name}
                  </p>
                  {incompatibility.reason && (
                    <p className="text-sm text-muted">
                      {incompatibility.reason}
                    </p>
                  )}
                </div>
                <form
                  action={deleteIncompatibility.bind(
                    null,
                    team.id,
                    incompatibility.id,
                  )}
                >
                  <ConfirmSubmitButton
                    confirmMessage={`¿Quitar la incompatibilidad entre ${incompatibility.userA.name} y ${incompatibility.userB.name}?`}
                  >
                    Quitar
                  </ConfirmSubmitButton>
                </form>
              </Card>
            ))}
            {team.incompatibilities.length === 0 && (
              <p className="text-sm text-muted">
                No hay incompatibilidades marcadas en este equipo.
              </p>
            )}
          </ul>
        </section>
      )}

      {canManage && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            Asignación masiva
          </h2>
          <p className="mt-1 text-sm text-muted">
            Asigna a una persona el mismo puesto en varios servicios ya
            creados de una vez. Si un servicio ya tiene ese puesto, se deja
            tal cual.
          </p>
          <div className="mt-3">
            <BulkAssignPositionForm
              teamId={team.id}
              members={team.memberships.map((m) => ({
                userId: m.userId,
                name: m.user.name,
              }))}
              services={upcomingServices.map((s) => ({
                id: s.id,
                title: s.title,
                date: s.date,
              }))}
            />
          </div>
        </section>
      )}

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
