import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/authz";
import { Logo } from "@/components/Logo";
import { buttonClassName } from "@/components/ui/Button";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Logo className="h-24 w-auto sm:h-28" />
      <h1 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl">
        Equipos de trabajo
      </h1>
      <p className="mt-4 max-w-md text-muted">
        Organiza los equipos de trabajo de tu iglesia, planifica los
        servicios y gestiona quién sirve en cada puesto.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/login" className={buttonClassName({ variant: "primary", size: "lg" })}>
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className={buttonClassName({ variant: "secondary", size: "lg" })}
        >
          Crear cuenta
        </Link>
      </div>
    </main>
  );
}
