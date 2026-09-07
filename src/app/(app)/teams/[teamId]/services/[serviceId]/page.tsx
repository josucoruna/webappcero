import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { canManageTeam, requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { deletePosition, deleteService } from "@/lib/actions/services";
import { AddPositionForm } from "@/components/forms/AddPositionForm";
import { AssignPositionSelect } from "@/components/forms/AssignPositionSelect";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { RespondToAssignmentControls } from "@/components/forms/RespondToAssignmentControls";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { positionStatusLabels, positionStatusVariant } from "@/lib/positionStatus";

export default async function ServicePage({
  params,
}: {
  params: Promise<{ teamId: string; serviceId: string }>;
}) {
  const { teamId, serviceId } = await params;
  const user = await requireUser();

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      team: {
        include: { memberships: { include: { user: true } } },
      },
      positions: {
        orderBy: { createdAt: "asc" },
        include: { assignedUser: true },
      },
    },
  });
  if (!service || service.teamId !== teamId) notFound();

  const isMember = service.team.memberships.some((m) => m.userId === user.id);
  const isSameOrgAdmin =
    user.isSuperAdmin && service.team.organizationId === user.organizationId;
  if (!isMember && !isSameOrgAdmin) redirect("/dashboard");

  const canManage = await canManageTeam(user, teamId);

  const memberIds = service.team.memberships.map((m) => m.userId);
  const [unavailable, incompatibilities] = await Promise.all([
    prisma.unavailability.findMany({
      where: {
        userId: { in: memberIds },
        startDate: { lte: service.date },
        endDate: { gte: service.date },
      },
      select: { userId: true },
    }),
    prisma.incompatibility.findMany({
      where: { teamId },
      select: { userAId: true, userBId: true },
    }),
  ]);
  const unavailableUserIds = new Set(unavailable.map((u) => u.userId));

  const incompatibleWith = new Map<string, Set<string>>();
  for (const { userAId, userBId } of incompatibilities) {
    if (!incompatibleWith.has(userAId)) incompatibleWith.set(userAId, new Set());
    if (!incompatibleWith.has(userBId)) incompatibleWith.set(userBId, new Set());
    incompatibleWith.get(userAId)!.add(userBId);
    incompatibleWith.get(userBId)!.add(userAId);
  }

  const nameByUserId = new Map(
    service.team.memberships.map((m) => [m.userId, m.user.name]),
  );

  const positions = service.positions;

  /** Motivos de aviso para cada miembro, al considerarlo para un puesto
   * concreto (o para uno nuevo, si no se indica `excludePositionId`). */
  function warningsFor(excludePositionId?: string) {
    const othersAssignedIds = positions
      .filter((p) => p.id !== excludePositionId && p.assignedUserId)
      .map((p) => p.assignedUserId as string);

    const warningByUserId = new Map<string, string>();
    for (const memberId of memberIds) {
      const reasons: string[] = [];
      if (unavailableUserIds.has(memberId)) reasons.push("no disponible");
      if (othersAssignedIds.includes(memberId)) {
        reasons.push("ya tiene otro puesto");
      }
      const conflictingWith = othersAssignedIds.find(
        (otherId) =>
          otherId !== memberId && incompatibleWith.get(memberId)?.has(otherId),
      );
      if (conflictingWith) {
        reasons.push(
          `incompatible con ${nameByUserId.get(conflictingWith) ?? "alguien más"}`,
        );
      }
      if (reasons.length > 0) warningByUserId.set(memberId, reasons.join(", "));
    }
    return warningByUserId;
  }

  const members = service.team.memberships.map((m) => ({
    userId: m.userId,
    name: m.user.name,
  }));

  return (
    <>
      <Link
        href={`/teams/${teamId}`}
        className="text-sm text-muted hover:underline"
      >
        ← {service.team.name}
      </Link>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {service.title}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {service.date.toLocaleString("es-ES", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
          {service.notes && (
            <p className="mt-2 text-sm text-muted">{service.notes}</p>
          )}
        </div>
        {canManage && (
          <form action={deleteService.bind(null, teamId, serviceId)}>
            <ConfirmSubmitButton
              confirmMessage={`¿Eliminar el servicio "${service.title}"?`}
            >
              Eliminar servicio
            </ConfirmSubmitButton>
          </form>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Puestos</h2>
        {canManage && (
          <div className="mt-3">
            <AddPositionForm
              teamId={teamId}
              serviceId={serviceId}
              members={members.map((m) => ({
                ...m,
                warning: warningsFor().get(m.userId),
              }))}
            />
          </div>
        )}

        <ul className="mt-4 flex flex-col gap-2">
          {service.positions.map((position) => {
            const isAssignedToMe = position.assignedUserId === user.id;
            return (
              <Card
                as="li"
                key={position.id}
                padding="p-3"
                className="flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {position.name}
                  </p>
                  <Badge
                    variant={positionStatusVariant[position.status]}
                    className="mt-1"
                  >
                    {positionStatusLabels[position.status]}
                  </Badge>
                  {position.status === "DECLINED" &&
                    position.declineReason && (
                      <p className="mt-1 text-xs italic text-muted">
                        Motivo: {position.declineReason}
                      </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                  {canManage ? (
                    <>
                      <AssignPositionSelect
                        teamId={teamId}
                        serviceId={serviceId}
                        positionId={position.id}
                        assignedUserId={position.assignedUserId}
                        members={members.map((m) => ({
                          ...m,
                          warning: warningsFor(position.id).get(m.userId),
                        }))}
                      />
                      <form
                        action={deletePosition.bind(
                          null,
                          teamId,
                          serviceId,
                          position.id,
                        )}
                      >
                        <ConfirmSubmitButton
                          confirmMessage={`¿Eliminar el puesto "${position.name}"?`}
                        >
                          Eliminar
                        </ConfirmSubmitButton>
                      </form>
                    </>
                  ) : (
                    <p className="text-sm text-muted">
                      {position.assignedUser?.name ?? "Sin asignar"}
                      {position.assignedUserId &&
                        unavailableUserIds.has(position.assignedUserId) && (
                          <span
                            className="ml-1 text-amber-600 dark:text-amber-400"
                            title="Esta persona marcó que no estaría disponible"
                          >
                            ⚠
                          </span>
                        )}
                    </p>
                  )}

                  {isAssignedToMe && (
                    <RespondToAssignmentControls
                      positionId={position.id}
                      status={position.status}
                    />
                  )}
                </div>
              </Card>
            );
          })}
          {service.positions.length === 0 && (
            <p className="text-sm text-muted">
              Todavía no hay puestos para este servicio.
            </p>
          )}
        </ul>
      </section>
    </>
  );
}
