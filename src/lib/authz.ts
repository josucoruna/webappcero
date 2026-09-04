import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { TeamRole } from "@/generated/prisma/client";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    isSuperAdmin: session.user.isSuperAdmin,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireSuperAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.isSuperAdmin) redirect("/dashboard");
  return user;
}

/** Rol de un usuario dentro de un equipo concreto, o null si no pertenece. */
export async function getTeamRole(
  userId: string,
  teamId: string,
): Promise<TeamRole | null> {
  const membership = await prisma.teamMembership.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { role: true },
  });
  return membership?.role ?? null;
}

/** El admin principal siempre puede; un líder solo en su propio equipo. */
export async function canManageTeam(
  user: CurrentUser,
  teamId: string,
): Promise<boolean> {
  if (user.isSuperAdmin) return true;
  const role = await getTeamRole(user.id, teamId);
  return role === "LEADER";
}

export async function requireTeamManager(teamId: string): Promise<CurrentUser> {
  const user = await requireUser();
  const allowed = await canManageTeam(user, teamId);
  if (!allowed) redirect("/dashboard");
  return user;
}
