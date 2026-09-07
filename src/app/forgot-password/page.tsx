import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/authz";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";
import { Card } from "@/components/ui/Card";

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <Card padding="p-8" className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-foreground">
          Recuperar contraseña
        </h1>
        <p className="mt-1 text-sm text-muted">
          Te enviaremos un enlace a tu email para elegir una nueva.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
        <p className="mt-6 text-sm text-muted">
          <Link href="/login" className="font-medium text-foreground underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </Card>
    </main>
  );
}
