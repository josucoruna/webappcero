import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/authz";
import { LoginForm } from "@/components/forms/LoginForm";
import { Card } from "@/components/ui/Card";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <Card padding="p-8" className="w-full max-w-sm">
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
      </Card>
    </main>
  );
}
