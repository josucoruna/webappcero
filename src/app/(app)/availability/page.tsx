import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { deleteUnavailability } from "@/lib/actions/availability";
import { AddUnavailabilityForm } from "@/components/forms/AddUnavailabilityForm";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { Card } from "@/components/ui/Card";

export default async function AvailabilityPage() {
  const user = await requireUser();

  const unavailabilities = await prisma.unavailability.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "asc" },
  });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-ES", { dateStyle: "long" });

  return (
    <>
      <h1 className="text-2xl font-semibold text-foreground">
        Mi disponibilidad
      </h1>
      <p className="mt-1 text-sm text-muted">
        Marca las fechas en las que no vas a estar disponible para servir. Tus
        líderes lo verán al asignarte a un puesto en esas fechas.
      </p>

      <div className="mt-6">
        <AddUnavailabilityForm />
      </div>

      <ul className="mt-6 flex flex-col gap-2">
        {unavailabilities.map((item) => (
          <Card
            as="li"
            key={item.id}
            padding="p-3"
            className="flex items-center justify-between gap-3"
          >
            <div>
              <p className="font-medium text-foreground">
                {formatDate(item.startDate)}
                {item.startDate.getTime() !== item.endDate.getTime() &&
                  ` – ${formatDate(item.endDate)}`}
              </p>
              {item.reason && (
                <p className="text-sm text-muted">{item.reason}</p>
              )}
            </div>
            <form action={deleteUnavailability.bind(null, item.id)}>
              <ConfirmSubmitButton
                confirmMessage="¿Quitar este bloqueo de fechas?"
              >
                Quitar
              </ConfirmSubmitButton>
            </form>
          </Card>
        ))}
        {unavailabilities.length === 0 && (
          <p className="text-sm text-muted">
            No has bloqueado ninguna fecha todavía.
          </p>
        )}
      </ul>
    </>
  );
}
