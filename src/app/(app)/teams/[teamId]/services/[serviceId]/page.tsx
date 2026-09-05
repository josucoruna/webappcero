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
  if (!isMember && !user.isSuperAdmin) redirect("/dashboard");

  const canManage = await canManageTeam(user, teamId);
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
              members={members}
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
                        members={members}
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
