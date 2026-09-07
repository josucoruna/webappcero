"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireTeamManager } from "@/lib/authz";

export type ActionState = { error?: string };

function canonicalPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/** El líder marca a dos personas del equipo como incompatibles entre sí. */
export async function addIncompatibility(
  teamId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireTeamManager(teamId);

  const userAId = String(formData.get("userAId") ?? "");
  const userBId = String(formData.get("userBId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!userAId || !userBId) return { error: "Elige a las dos personas" };
  if (userAId === userBId) return { error: "Elige a dos personas distintas" };

  const memberships = await prisma.teamMembership.findMany({
    where: { teamId, userId: { in: [userAId, userBId] } },
  });
  if (memberships.length !== 2) {
    return { error: "Las dos personas deben pertenecer a este equipo" };
  }

  const [userA, userB] = canonicalPair(userAId, userBId);

  const existing = await prisma.incompatibility.findUnique({
    where: { teamId_userAId_userBId: { teamId, userAId: userA, userBId: userB } },
  });
  if (existing) {
    return { error: "Esas dos personas ya están marcadas como incompatibles" };
  }

  await prisma.incompatibility.create({
    data: { teamId, userAId: userA, userBId: userB, reason: reason || null },
  });

  revalidatePath(`/teams/${teamId}`);
  return {};
}

export async function deleteIncompatibility(
  teamId: string,
  incompatibilityId: string,
) {
  await requireTeamManager(teamId);

  const existing = await prisma.incompatibility.findUnique({
    where: { id: incompatibilityId },
    select: { teamId: true },
  });
  if (!existing || existing.teamId !== teamId) {
    throw new Error("Esa incompatibilidad no pertenece a este equipo");
  }

  await prisma.incompatibility.delete({ where: { id: incompatibilityId } });
  revalidatePath(`/teams/${teamId}`);
}
