import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/authz";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  // La franja de cabecera es siempre blanca (no sigue el tema), así que sus
  // botones usan colores fijos en vez de los tokens de tema: si usaran los
  // tokens, en modo oscuro el texto se volvería casi blanco y desaparecería
  // sobre este fondo blanco.
  const headerButtonBase =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md h-8 px-2 text-xs font-medium transition sm:px-3 sm:text-sm";

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-2 bg-white py-4 pl-3 pr-12 sm:gap-3 sm:pl-10 sm:pr-20">
        <Image
          src="/LuaOne-logo-claro.svg"
          alt="LuaOne"
          width={400}
          height={160}
          priority
          className="h-9 w-auto shrink-0 sm:h-16"
        />
        <div className="flex shrink-0 gap-1.5 sm:gap-3">
          <Link
            href="/login"
            className={`${headerButtonBase} border border-zinc-300 text-zinc-900 hover:bg-zinc-100`}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className={`${headerButtonBase} bg-zinc-900 text-white hover:opacity-90`}
          >
            Crear cuenta
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden bg-page px-6 py-20 text-center sm:py-28">
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[49%] lg:block">
          <Image
            src="/zane-persaud-Mz7yqJGB6Ls-unsplash.jpg"
            alt=""
            fill
            sizes="49vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-r from-transparent to-page" />
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[49%] lg:block">
          <Image
            src="/annie-spratt-MChSQHxGZrQ-unsplash.jpg"
            alt=""
            fill
            sizes="49vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-l from-transparent to-page" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 rounded-2xl bg-page/90 px-6 py-8 shadow-lg backdrop-blur-sm sm:px-12 sm:py-10">
          <h1 className="max-w-xl text-3xl font-bold text-foreground sm:text-4xl">
            Organiza equipos, calendarios y turnos de servicio en un solo
            lugar
          </h1>
        </div>
      </main>
    </div>
  );
}
