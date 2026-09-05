import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/authz";
import { LogoNetwork } from "@/components/LogoNetwork";
import { buttonClassName } from "@/components/ui/Button";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex items-center gap-4">
        <LogoNetwork className="h-16 w-16 sm:h-20 sm:w-20" />
        <span className="text-3xl font-bold text-foreground sm:text-4xl">
          LuaOne
        </span>
      </div>
      <h1 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl">
        Equipos de trabajo
      </h1>
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
