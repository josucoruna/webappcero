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
      <header className="flex items-center justify-between gap-1 bg-white py-4 pl-2 pr-16 sm:gap-3 sm:pl-10 sm:pr-24">
        <Image
          src="/LuaOne-logo-claro.svg"
          alt="LuaOne"
          width={400}
          height={160}
          priority
          className="h-16 w-auto shrink-0 sm:h-20"
        />
        <div className="flex shrink-0 gap-1 sm:gap-3">
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
            <div className="rounded-2xl bg-zinc-900/70 px-6 py-6 shadow-md backdrop-blur-xl">
              <h1 className="text-3xl font-bold text-white">
                Organiza equipos, calendarios y turnos de servicio en un solo
                lugar
              </h1>
            </div>
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
          <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-10">
            <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-zinc-900/70 px-16 py-6 text-center shadow-md backdrop-blur-2xl">
              <h1 className="text-3xl font-bold text-white">
                Organiza equipos, calendarios y turnos de servicio en un solo
                lugar
              </h1>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
