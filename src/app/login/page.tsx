import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/authz";
import { LoginForm } from "@/components/forms/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8">
        <h1 className="text-xl font-semibold text-zinc-900">
          Iniciar sesión
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Entra con tu email y contraseña.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-sm text-zinc-500">
          ¿Todavía no tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-zinc-900 underline">
            Crea una aquí
          </Link>
        </p>
      </div>
    </main>
  );
}
