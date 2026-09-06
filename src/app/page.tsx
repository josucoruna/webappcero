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
      <header className="flex flex-wrap items-center justify-between gap-x-2 gap-y-3 bg-white py-4 pl-3 pr-16 sm:gap-x-3 sm:pl-10 sm:pr-24">
        <Image
          src="/LuaOne-logo-claro.svg"
          alt="LuaOne"
          width={400}
          height={160}
          priority
          className="h-[72px] w-auto shrink-0 sm:h-32"
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

      <main className="relative flex flex-1 flex-col overflow-hidden bg-page">
        {/* Móvil: las dos fotos apiladas casi pegadas, con el titular flotando sobre la unión. */}
        <div className="relative min-h-[420px] flex-1 lg:hidden">
          <div className="absolute inset-x-0 top-0 h-1/2">
            <Image
              src="/zane-persaud-Mz7yqJGB6Ls-unsplash.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-page" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1/2">
            <Image
              src="/annie-spratt-MChSQHxGZrQ-unsplash.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-t from-transparent to-page" />
          </div>
          <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
            <div className="rounded-2xl bg-page/60 px-6 py-6 shadow-md backdrop-blur-xl">
              <h1 className="text-3xl font-bold text-foreground">
                Organiza equipos, calendarios y turnos de servicio en un solo
                lugar
              </h1>
            </div>
          </div>
        </div>

        {/* Escritorio: las dos fotos casi pegadas a los lados, con el titular hacia la parte baja. */}
        <div className="relative hidden flex-1 lg:flex lg:flex-col lg:items-center lg:justify-end lg:px-6 lg:pb-24">
          <div className="absolute inset-y-0 left-0 w-[49%]">
            <Image
              src="/zane-persaud-Mz7yqJGB6Ls-unsplash.jpg"
              alt=""
              fill
              sizes="49vw"
              className="object-cover"
              priority
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-r from-transparent to-page" />
          </div>
          <div className="absolute inset-y-0 right-0 w-[49%]">
            <Image
              src="/annie-spratt-MChSQHxGZrQ-unsplash.jpg"
              alt=""
              fill
              sizes="49vw"
              className="object-cover"
              priority
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-l from-transparent to-page" />
          </div>
          <div className="relative z-10 rounded-2xl bg-page/70 px-12 py-10 text-center shadow-md backdrop-blur-2xl">
            <h1 className="max-w-xl text-4xl font-bold text-foreground">
              Organiza equipos, calendarios y turnos de servicio en un solo
              lugar
            </h1>
          </div>
        </div>
      </main>
    </div>
  );
}
