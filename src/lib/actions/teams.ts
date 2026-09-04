"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, requireTeamManager, requireUser } from "@/lib/authz";

export type ActionState = { error?: string };

const teamSchema = z.object({
  name: z.string().trim().min(2, "El nombre del equipo es demasiado corto"),
  description: z.string().trim().optional(),
});

export async function createTeam(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSuperAdmin();

  const parsed = teamSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  }

  await prisma.team.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
    },
  });

  revalidatePath("/admin/teams");
  return {};
}

export async function deleteTeam(teamId: string): Promise<void> {
  await requireSuperAdmin();
  await prisma.team.delete({ where: { id: teamId } });
  revalidatePath("/admin/teams");
}

export async function addTeamMember(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  await requireTeamManager(teamId);

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = formData.get("role") === "LEADER" ? "LEADER" : "MEMBER";

  if (!email) return { error: "Indica un email" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "No existe ninguna persona registrada con ese email" };
  }

  await prisma.teamMembership.upsert({
    where: { teamId_userId: { teamId, userId: user.id } },
    update: { role },
    create: { teamId, userId: user.id, role },
  });

  revalidatePath(`/teams/${teamId}`);
  return {};
}

export async function removeTeamMember(
  teamId: string,
  userId: string,
): Promise<void> {
  await requireTeamManager(teamId);
  await prisma.teamMembership.delete({
    where: { teamId_userId: { teamId, userId } },
  });
  revalidatePath(`/teams/${teamId}`);
}

export async function setTeamMemberRole(
  teamId: string,
  userId: string,
  role: "LEADER" | "MEMBER",
): Promise<void> {
  await requireTeamManager(teamId);
  await prisma.teamMembership.update({
    where: { teamId_userId: { teamId, userId } },
    data: { role },
  });
  revalidatePath(`/teams/${teamId}`);
}

export async function updateTeamDetails(
  teamId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireTeamManager(teamId);

  const parsed = teamSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  }

  await prisma.team.update({
    where: { id: teamId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
    },
  });

  revalidatePath(`/teams/${teamId}`);
  return {};
}

/** Equipos a los que pertenece el usuario actual (para el panel principal). */
export async function getMyTeams() {
  const user = await requireUser();
  const memberships = await prisma.teamMembership.findMany({
    where: { userId: user.id },
    include: { team: true },
    orderBy: { team: { name: "asc" } },
  });
  return memberships;
}
