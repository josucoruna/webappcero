"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";

async function requireUserInSameOrganization(
  organizationId: string,
  userId: string,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });
  if (!user || user.organizationId !== organizationId) {
    throw new Error("Esa persona no pertenece a tu organización");
  }
}

export async function setSuperAdmin(userId: string, value: boolean) {
  const currentAdmin = await requireSuperAdmin();

  if (currentAdmin.id === userId && !value) {
    throw new Error("No puedes quitarte a ti mismo el rol de admin principal");
  }
  await requireUserInSameOrganization(currentAdmin.organizationId, userId);

  await prisma.user.update({
    where: { id: userId },
    data: { isSuperAdmin: value },
  });

  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const currentAdmin = await requireSuperAdmin();

  if (currentAdmin.id === userId) {
    throw new Error("No puedes eliminar tu propia cuenta");
  }
  await requireUserInSameOrganization(currentAdmin.organizationId, userId);

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
}
