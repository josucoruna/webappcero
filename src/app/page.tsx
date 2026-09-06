import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/authz";
import { buttonClassName } from "@/components/ui/Button";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 bg-white py-4 pl-4 pr-14 sm:pl-10 sm:pr-20">
        <Image
          src="/LuaOne-logo-claro.svg"
          alt="LuaOne"
          width={400}
          height={160}
          priority
          className="h-8 w-auto shrink-0 sm:h-10"
        />
        <div className="flex shrink-0 gap-2 sm:gap-3">
          <Link
            href="/login"
            className={buttonClassName({
              variant: "secondary",
              size: "sm",
              className: "whitespace-nowrap",
            })}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className={buttonClassName({
              variant: "primary",
              size: "sm",
              className: "whitespace-nowrap",
            })}
          >
            Crear cuenta
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden bg-page px-6 py-20 text-center sm:py-28">
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[28%] lg:block">
          <Image
            src="/zane-persaud-Mz7yqJGB6Ls-unsplash.jpg"
            alt=""
            fill
            sizes="28vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-page" />
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[28%] lg:block">
          <Image
            src="/annie-spratt-MChSQHxGZrQ-unsplash.jpg"
            alt=""
            fill
            sizes="28vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-page" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Equipos de trabajo
          </h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className={buttonClassName({ variant: "primary", size: "lg" })}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className={buttonClassName({ variant: "secondary", size: "lg" })}
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
