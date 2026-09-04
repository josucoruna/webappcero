import { requireSuperAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { deleteUser, setSuperAdmin } from "@/lib/actions/users";
import { Header } from "@/components/Header";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export default async function AdminUsersPage() {
  const currentUser = await requireSuperAdmin();

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Header user={currentUser} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold text-foreground">Personas</h1>
        <p className="mt-1 text-sm text-muted">
          Todas las personas registradas en la app. El admin principal tiene
          control total; el resto solo gestiona lo que le asignes en cada
          equipo.
        </p>

        <ul className="mt-8 flex flex-col gap-3">
          {users.map((person) => (
            <li
              key={person.id}
              className="flex items-center justify-between rounded-lg border border-line bg-surface p-4"
            >
              <div>
                <p className="font-medium text-foreground">
                  {person.name}
                  {person.isSuperAdmin && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                      Admin principal
                    </span>
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
                        confirmMessage={`¿Quitar el rol de admin principal a ${person.name}?`}
                        className="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-accent"
                      >
                        Quitar admin principal
                      </ConfirmSubmitButton>
                    </form>
                  )
                ) : (
                  <form action={setSuperAdmin.bind(null, person.id, true)}>
                    <ConfirmSubmitButton
                      confirmMessage={`¿Hacer a ${person.name} admin principal? Tendrá control total sobre toda la app.`}
                      className="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-accent"
                    >
                      Hacer admin principal
                    </ConfirmSubmitButton>
                  </form>
                )}
                {person.id !== currentUser.id && (
                  <form action={deleteUser.bind(null, person.id)}>
                    <ConfirmSubmitButton
                      confirmMessage={`¿Eliminar a ${person.name} de la app? Perderá acceso y se le quitará de todos los equipos. Esto no se puede deshacer.`}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950"
                    >
                      Eliminar
                    </ConfirmSubmitButton>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
