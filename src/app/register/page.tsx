import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/authz";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { Card } from "@/components/ui/Card";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <Card padding="p-8" className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-foreground">Crear cuenta</h1>
        <p className="mt-1 text-sm text-muted">
          Solo pedimos lo mínimo: un nombre (puede ser inventado), tu email y
          una contraseña.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-foreground underline">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </main>
  );
}
