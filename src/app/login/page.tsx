import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/authz";
import { LoginForm } from "@/components/forms/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-8">
        <h1 className="text-xl font-semibold text-foreground">
          Iniciar sesión
        </h1>
        <p className="mt-1 text-sm text-muted">
          Entra con tu email y contraseña.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-sm text-muted">
          ¿Todavía no tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-foreground underline">
            Crea una aquí
          </Link>
        </p>
      </div>
    </main>
  );
}
