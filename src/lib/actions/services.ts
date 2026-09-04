"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { canManageTeam, requireTeamManager, requireUser } from "@/lib/authz";

export type ActionState = { error?: string };

const serviceSchema = z.object({
  title: z.string().trim().min(2, "El título es demasiado corto"),
  date: z.string().min(1, "Indica una fecha"),
  notes: z.string().trim().optional(),
});

export async function createService(
  teamId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireTeamManager(teamId);

  const parsed = serviceSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  }

  const date = new Date(parsed.data.date);
  if (Number.isNaN(date.getTime())) {
    return { error: "La fecha no es válida" };
  }

  await prisma.service.create({
    data: {
      title: parsed.data.title,
      date,
      notes: parsed.data.notes || null,
      teamId,
    },
  });

  revalidatePath(`/teams/${teamId}`);
  return {};
}

/** Crear un servicio desde el calendario, eligiendo el equipo en el propio formulario. */
export async function createServiceFromCalendar(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const teamId = String(formData.get("teamId") ?? "");
  if (!teamId) return { error: "Elige un equipo" };

  const user = await requireUser();
  const allowed = await canManageTeam(user, teamId);
  if (!allowed) return { error: "No puedes crear servicios en ese equipo" };

  const parsed = serviceSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  }

  const date = new Date(parsed.data.date);
  if (Number.isNaN(date.getTime())) {
    return { error: "La fecha no es válida" };
  }

  const service = await prisma.service.create({
    data: {
      title: parsed.data.title,
      date,
      notes: parsed.data.notes || null,
      teamId,
    },
  });

  revalidatePath("/calendar");
  revalidatePath(`/teams/${teamId}`);
  redirect(`/teams/${teamId}/services/${service.id}`);
}

export async function deleteService(teamId: string, serviceId: string) {
  await requireTeamManager(teamId);
  await prisma.service.delete({ where: { id: serviceId } });
  revalidatePath(`/teams/${teamId}`);
}

export async function addPosition(
  teamId: string,
  serviceId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireTeamManager(teamId);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Indica un nombre para el puesto" };

  const assignedUserId = String(formData.get("assignedUserId") ?? "") || null;

  if (assignedUserId) {
    const isMember = await prisma.teamMembership.findUnique({
      where: { teamId_userId: { teamId, userId: assignedUserId } },
    });
    if (!isMember) {
      return { error: "Esa persona no pertenece a este equipo" };
    }
  }

  await prisma.position.create({
    data: {
      name,
      serviceId,
      assignedUserId,
      status: "PENDING",
    },
  });

  revalidatePath(`/teams/${teamId}/services/${serviceId}`);
  return {};
}

export async function deletePosition(
  teamId: string,
  serviceId: string,
  positionId: string,
) {
  await requireTeamManager(teamId);
  await prisma.position.delete({ where: { id: positionId } });
  revalidatePath(`/teams/${teamId}/services/${serviceId}`);
}

export async function assignPosition(
  teamId: string,
  serviceId: string,
  positionId: string,
  formData: FormData,
) {
  await requireTeamManager(teamId);

  const assignedUserId = String(formData.get("assignedUserId") ?? "");

  if (assignedUserId) {
    const isMember = await prisma.teamMembership.findUnique({
      where: { teamId_userId: { teamId, userId: assignedUserId } },
    });
    if (!isMember) throw new Error("Esa persona no pertenece a este equipo");
  }

  await prisma.position.update({
    where: { id: positionId },
    data: {
      assignedUserId: assignedUserId || null,
      status: "PENDING",
    },
  });

  revalidatePath(`/teams/${teamId}/services/${serviceId}`);
}

async function getOwnAssignedPosition(positionId: string) {
  const user = await requireUser();

  const position = await prisma.position.findUnique({
    where: { id: positionId },
    select: { assignedUserId: true, service: { select: { teamId: true } } },
  });
  if (!position || position.assignedUserId !== user.id) {
    throw new Error("No tienes permiso para responder a esta asignación");
  }
  return position;
}

/** El propio miembro confirma su asignación. */
export async function confirmAssignment(positionId: string) {
  const position = await getOwnAssignedPosition(positionId);

  await prisma.position.update({
    where: { id: positionId },
    data: { status: "CONFIRMED", declineReason: null },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/teams/${position.service.teamId}`);
}

const MAX_DECLINE_REASON_LENGTH = 150;

/** El propio miembro rechaza su asignación, indicando un motivo. */
export async function declineAssignment(
  positionId: string,
  formData: FormData,
) {
  const position = await getOwnAssignedPosition(positionId);

  const declineReason = String(formData.get("declineReason") ?? "").trim();
  if (!declineReason) {
    throw new Error("Indica un motivo para rechazar la asignación");
  }
  if (declineReason.length > MAX_DECLINE_REASON_LENGTH) {
    throw new Error(
      `El motivo no puede superar los ${MAX_DECLINE_REASON_LENGTH} caracteres`,
    );
  }

  await prisma.position.update({
    where: { id: positionId },
    data: { status: "DECLINED", declineReason },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/teams/${position.service.teamId}`);
}
