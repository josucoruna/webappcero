import { prisma } from "@/lib/prisma";

let bootstrapped = false;

/**
 * Se asegura de que exista una Organization para el código de registro
 * actual (REGISTRATION_CODE), y mueve a ella cualquier usuario/equipo
 * antiguo que todavía no tenga organización asignada (datos de antes de
 * introducir este modelo). Es idempotente: repetirla no hace nada nuevo.
 */
export async function ensureOrganization() {
  if (bootstrapped) return;

  const code = process.env.REGISTRATION_CODE;
  if (!code) {
    bootstrapped = true;
    return;
  }

  const organization = await prisma.organization.upsert({
    where: { registrationCode: code },
    update: {},
    create: {
      name: process.env.ORGANIZATION_NAME || "Mi organización",
      registrationCode: code,
    },
  });

  await prisma.user.updateMany({
    where: { organizationId: null },
    data: { organizationId: organization.id },
  });
  await prisma.team.updateMany({
    where: { organizationId: null },
    data: { organizationId: organization.id },
  });

  bootstrapped = true;
}
