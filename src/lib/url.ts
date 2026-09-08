import { headers } from "next/headers";

/** URL base de la app a partir de la petición actual (funciona igual en
 * local y en Vercel, sin depender de una variable de entorno aparte). */
export async function getBaseUrl() {
  const h = await headers();
  // x-forwarded-host es la que pone el proxy (Vercel) a partir del dominio
  // real solicitado; "host" a secas es más fácil de falsificar detrás de
  // otros proxies, así que preferimos la primera cuando existe.
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
