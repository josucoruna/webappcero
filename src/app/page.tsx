import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/authz";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
        Equipos de Iglesia
      </h1>
      <p className="mt-4 max-w-md text-zinc-600">
        Organiza los equipos de trabajo de tu iglesia, planifica los
        servicios y gestiona quién sirve en cada puesto.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
        >
          Crear cuenta
        </Link>
      </div>
    </main>
  );
}
