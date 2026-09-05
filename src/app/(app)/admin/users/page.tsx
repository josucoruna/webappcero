import { requireSuperAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { deleteUser, setSuperAdmin } from "@/lib/actions/users";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default async function AdminUsersPage() {
  const currentUser = await requireSuperAdmin();

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <>
      <h1 className="text-2xl font-semibold text-foreground">Personas</h1>
      <p className="mt-1 text-sm text-muted">
        Todas las personas registradas en la app. El admin principal tiene
        control total; el resto solo gestiona lo que le asignes en cada
        equipo.
      </p>

      <ul className="mt-8 flex flex-col gap-3">
        {users.map((person) => (
          <Card
            as="li"
            key={person.id}
            className="flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-foreground">
                {person.name}
                {person.isSuperAdmin && (
                  <Badge variant="warning" className="ml-2">
                    Admin principal
                  </Badge>
                )}
                {person.id === currentUser.id && (
                  <span className="ml-2 text-xs text-subtle">(tú)</span>
                )}
              </p>
              <p className="text-sm text-muted">{person.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {person.isSuperAdmin ? (
                person.id !== currentUser.id && (
                  <form action={setSuperAdmin.bind(null, person.id, false)}>
                    <ConfirmSubmitButton
                      variant="secondary"
                      confirmMessage={`¿Quitar el rol de admin principal a ${person.name}?`}
                    >
                      Quitar admin principal
                    </ConfirmSubmitButton>
                  </form>
                )
              ) : (
                <form action={setSuperAdmin.bind(null, person.id, true)}>
                  <ConfirmSubmitButton
                    variant="secondary"
                    confirmMessage={`¿Hacer a ${person.name} admin principal? Tendrá control total sobre toda la app.`}
                  >
                    Hacer admin principal
                  </ConfirmSubmitButton>
                </form>
              )}
              {person.id !== currentUser.id && (
                <form action={deleteUser.bind(null, person.id)}>
                  <ConfirmSubmitButton
                    confirmMessage={`¿Eliminar a ${person.name} de la app? Perderá acceso y se le quitará de todos los equipos. Esto no se puede deshacer.`}
                  >
                    Eliminar
                  </ConfirmSubmitButton>
                </form>
              )}
            </div>
          </Card>
        ))}
      </ul>
    </>
  );
}
