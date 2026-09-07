import { headers } from "next/headers";

/** URL base de la app a partir de la petición actual (funciona igual en
 * local y en Vercel, sin depender de una variable de entorno aparte). */
export async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
