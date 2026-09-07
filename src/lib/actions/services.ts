"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { canManageTeam, requireTeamManager, requireUser } from "@/lib/authz";
import { sendAssignmentEmail, sendDeclineNotificationEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/url";

export type ActionState = { error?: string };

const serviceSchema = z.object({
  title: z.string().trim().min(2, "El título es demasiado corto"),
  date: z.string().min(1, "Indica una fecha"),
  notes: z.string().trim().optional(),
});

const MAX_RECURRING_OCCURRENCES = 52;

/** Genera fechas semanales (mismo día y hora que `start`) hasta `until`
 * inclusive, con un tope para no crear cientos de servicios por error. */
function generateWeeklyDates(start: Date, until: Date): Date[] {
  const dates: Date[] = [];
  let current = start;
  while (current <= until && dates.length < MAX_RECURRING_OCCURRENCES) {
    dates.push(current);
    const next = new Date(current);
    next.setDate(next.getDate() + 7);
    current = next;
  }
  return dates;
}

/** Lee y valida los campos de recurrencia de un formulario de servicio.
 * Devuelve la lista de fechas a crear (solo `date` si no se repite). */
function resolveServiceDates(
  formData: FormData,
  date: Date,
): { dates: Date[] } | { error: string } {
  const repeatWeekly = formData.get("repeatWeekly") === "on";
  if (!repeatWeekly) return { dates: [date] };

  const repeatUntilRaw = String(formData.get("repeatUntil") ?? "");
  if (!repeatUntilRaw) {
    return { error: "Indica hasta qué fecha se repite" };
  }
  const repeatUntil = new Date(repeatUntilRaw);
  if (Number.isNaN(repeatUntil.getTime())) {
    return { error: "La fecha de fin no es válida" };
  }
  // El campo "hasta" es solo una fecha (sin hora): la extendemos al final
  // del día para no dejar fuera la última ocurrencia si su hora es
  // posterior a medianoche.
  repeatUntil.setHours(23, 59, 59, 999);
  if (repeatUntil < date) {
    return { error: "La fecha de fin debe ser posterior a la fecha de inicio" };
  }

  return { dates: generateWeeklyDates(date, repeatUntil) };
}

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

  const resolved = resolveServiceDates(formData, date);
  if ("error" in resolved) return { error: resolved.error };

  await prisma.service.createMany({
    data: resolved.dates.map((d) => ({
      title: parsed.data.title,
      date: d,
      notes: parsed.data.notes || null,
      teamId,
    })),
  });

  revalidatePath(`/teams/${teamId}`);
  revalidatePath("/calendar");
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

  const resolved = resolveServiceDates(formData, date);
  if ("error" in resolved) return { error: resolved.error };
  const [firstDate, ...restDates] = resolved.dates;

  const firstService = await prisma.service.create({
    data: {
      title: parsed.data.title,
      date: firstDate,
      notes: parsed.data.notes || null,
      teamId,
    },
  });
  if (restDates.length > 0) {
    await prisma.service.createMany({
      data: restDates.map((d) => ({
        title: parsed.data.title,
        date: d,
        notes: parsed.data.notes || null,
        teamId,
      })),
    });
  }

  revalidatePath("/calendar");
  revalidatePath(`/teams/${teamId}`);
  redirect(`/teams/${teamId}/services/${firstService.id}`);
}

/** Comprueba que el servicio existe y pertenece de verdad a ese equipo. */
async function requireServiceInTeam(teamId: string, serviceId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { teamId: true },
  });
  if (!service || service.teamId !== teamId) {
    throw new Error("Ese servicio no pertenece a este equipo");
  }
}

/** Comprueba que el puesto existe y pertenece de verdad a ese servicio. */
async function requirePositionInService(serviceId: string, positionId: string) {
  const position = await prisma.position.findUnique({
    where: { id: positionId },
    select: { serviceId: true },
  });
  if (!position || position.serviceId !== serviceId) {
    throw new Error("Ese puesto no pertenece a este servicio");
  }
}

export async function deleteService(teamId: string, serviceId: string) {
  await requireTeamManager(teamId);
  await requireServiceInTeam(teamId, serviceId);
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
  await requireServiceInTeam(teamId, serviceId);

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

  const position = await prisma.position.create({
    data: {
      name,
      serviceId,
      assignedUserId,
      status: "PENDING",
    },
  });

  if (assignedUserId) {
    await notifyPositionAssigned(position.id, teamId, serviceId);
  }

  revalidatePath(`/teams/${teamId}/services/${serviceId}`);
  return {};
}

export async function deletePosition(
  teamId: string,
  serviceId: string,
  positionId: string,
) {
  await requireTeamManager(teamId);
  await requireServiceInTeam(teamId, serviceId);
  await requirePositionInService(serviceId, positionId);
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
  await requireServiceInTeam(teamId, serviceId);
  await requirePositionInService(serviceId, positionId);

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

  if (assignedUserId) {
    await notifyPositionAssigned(positionId, teamId, serviceId);
  }

  revalidatePath(`/teams/${teamId}/services/${serviceId}`);
}

/** Avisa por email a quien acaba de ser asignado a un puesto. No lanza si
 * el envío falla: una asignación no debería fallar por culpa del email. */
async function notifyPositionAssigned(
  positionId: string,
  teamId: string,
  serviceId: string,
) {
  try {
    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: {
        assignedUser: { select: { email: true } },
        service: {
          select: { title: true, date: true, team: { select: { name: true } } },
        },
      },
    });
    if (!position?.assignedUser) return;

    const baseUrl = await getBaseUrl();
    await sendAssignmentEmail(position.assignedUser.email, {
      positionName: position.name,
      serviceTitle: position.service.title,
      teamName: position.service.team.name,
      serviceDate: position.service.date,
      serviceUrl: `${baseUrl}/teams/${teamId}/services/${serviceId}`,
    });
  } catch (error) {
    console.error("Error enviando email de asignación", error);
  }
}

async function getOwnAssignedPosition(positionId: string) {
  const user = await requireUser();

  const position = await prisma.position.findUnique({
    where: { id: positionId },
    select: {
      name: true,
      assignedUserId: true,
      service: {
        select: {
          id: true,
          title: true,
          date: true,
          teamId: true,
          team: { select: { name: true } },
        },
      },
    },
  });
  if (!position || position.assignedUserId !== user.id) {
    throw new Error("No tienes permiso para responder a esta asignación");
  }
  return { ...position, user };
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

  try {
    const leaders = await prisma.teamMembership.findMany({
      where: { teamId: position.service.teamId, role: "LEADER" },
      select: { user: { select: { email: true } } },
    });
    if (leaders.length > 0) {
      const baseUrl = await getBaseUrl();
      const serviceUrl = `${baseUrl}/teams/${position.service.teamId}/services/${position.service.id}`;
      await Promise.all(
        leaders.map((leader) =>
          sendDeclineNotificationEmail(leader.user.email, {
            memberName: position.user.name,
            positionName: position.name,
            serviceTitle: position.service.title,
            teamName: position.service.team.name,
            declineReason,
            serviceUrl,
          }),
        ),
      );
    }
  } catch (error) {
    console.error("Error enviando email de rechazo", error);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/teams/${position.service.teamId}`);
}
