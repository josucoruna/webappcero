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
    "inline-flex items-center justify-center whitespace-nowrap rounded-md h-6 px-1.5 text-[10px] font-medium transition sm:h-8 sm:px-3 sm:text-sm";

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-1 border-b-4 border-[#0F766E] bg-white py-3 pl-2 pr-16 shadow-sm sm:gap-3 sm:py-4 sm:pl-10 sm:pr-24">
        <Image
          src="/LuaOne-logo-claro.svg"
          alt="LuaOne"
          width={400}
          height={160}
          priority
          className="h-20 w-auto shrink-0 sm:h-24"
        />
        <div className="flex shrink-0 gap-1 sm:gap-3">
          <Link
            href="/login"
            className={`${headerButtonBase} border border-[#0F766E] text-[#0F766E] hover:bg-[#0F766E]/10`}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className={`${headerButtonBase} bg-[#0F766E] text-white hover:opacity-90`}
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
          <div className="absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center px-8 text-center">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-44 -translate-y-1/2 bg-gradient-to-b from-transparent via-black/55 to-transparent" />
            <h1 className="relative max-w-xs text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              Turnos y calendarios de tu equipo, sin complicaciones
            </h1>
          </div>
        </div>

        {/* Escritorio: cuatro fotos ocupando todo el ancho, con el titular hacia la parte baja. */}
        <div className="relative hidden flex-1 overflow-hidden lg:block">
          <div className="absolute inset-y-0 left-0 w-1/4">
            <Image
              src="/zane-persaud-Mz7yqJGB6Ls-unsplash.jpg"
              alt=""
              fill
              sizes="25vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-y-0 left-1/4 w-1/4">
            <Image
              src="/jason-betz-klub_Ke-268-unsplash.jpg"
              alt=""
              fill
              sizes="25vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-y-0 left-2/4 w-1/4">
            <Image
              src="/luba-glazunova-ukTZrFNqCXU-unsplash.jpg"
              alt=""
              fill
              sizes="25vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-y-0 left-3/4 w-1/4">
            <Image
              src="/annie-spratt-MChSQHxGZrQ-unsplash.jpg"
              alt=""
              fill
              sizes="25vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-12">
            <h1 className="relative z-10 max-w-2xl text-center text-4xl font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
              Turnos y calendarios de tu equipo, sin complicaciones
            </h1>
          </div>
        </div>
      </main>
    </div>
  );
}
