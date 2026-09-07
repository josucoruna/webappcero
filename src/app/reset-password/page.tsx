import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/authz";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { Card } from "@/components/ui/Card";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const { token } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <Card padding="p-8" className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-foreground">
          Elegir nueva contraseña
        </h1>
        {token ? (
          <>
            <p className="mt-1 text-sm text-muted">
              Escribe tu nueva contraseña.
            </p>
            <div className="mt-6">
              <ResetPasswordForm token={token} />
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-foreground">
            Este enlace no es válido. Pide uno nuevo desde{" "}
            <Link
              href="/forgot-password"
              className="font-medium underline"
            >
              recuperar contraseña
            </Link>
            .
          </p>
        )}
      </Card>
    </main>
  );
}
