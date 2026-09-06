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

      <main className="relative flex flex-1 flex-col justify-center overflow-hidden bg-page lg:items-center lg:justify-end lg:px-6 lg:pb-24">
        <div className="relative h-52 w-full shrink-0 sm:h-64 lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[49%]">
          <Image
            src="/zane-persaud-Mz7yqJGB6Ls-unsplash.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 49vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-r from-transparent to-page lg:block" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-6 text-center lg:px-0 lg:py-0">
          <div className="rounded-2xl bg-page/60 px-6 py-6 shadow-md backdrop-blur-xl sm:px-12 sm:py-10 lg:bg-page/70 lg:backdrop-blur-2xl">
            <h1 className="max-w-xl text-3xl font-bold text-foreground sm:text-4xl">
              Organiza equipos, calendarios y turnos de servicio en un solo
              lugar
            </h1>
          </div>
        </div>

        <div className="relative h-52 w-full shrink-0 sm:h-64 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[49%]">
          <Image
            src="/annie-spratt-MChSQHxGZrQ-unsplash.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 49vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-l from-transparent to-page lg:block" />
        </div>
      </main>
    </div>
  );
}
