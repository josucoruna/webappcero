import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/authz";
import { RegisterForm } from "@/components/forms/RegisterForm";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8">
        <h1 className="text-xl font-semibold text-zinc-900">Crear cuenta</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Solo pedimos lo mínimo: un nombre (puede ser inventado), tu email y
          una contraseña.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-sm text-zinc-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
