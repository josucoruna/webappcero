"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";

export type ActionState = { error?: string };

const unavailabilitySchema = z
  .object({
    startDate: z.string().min(1, "Indica una fecha de inicio"),
    endDate: z.string().min(1, "Indica una fecha de fin"),
    reason: z.string().trim().max(150, "El motivo no puede superar los 150 caracteres").optional(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "La fecha de fin debe ser igual o posterior a la de inicio",
    path: ["endDate"],
  });

/** El propio usuario marca un rango de fechas en el que no está disponible. */
export async function addUnavailability(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = unavailabilitySchema.safeParse({
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  }

  const startDate = new Date(parsed.data.startDate);
  const endDate = new Date(parsed.data.endDate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { error: "Fechas no válidas" };
  }

  await prisma.unavailability.create({
    data: {
      userId: user.id,
      startDate,
      endDate,
      reason: parsed.data.reason || null,
    },
  });

  revalidatePath("/availability");
  return {};
}

/** Borra un rango de fechas, solo si es del propio usuario. */
export async function deleteUnavailability(id: string) {
  const user = await requireUser();

  const existing = await prisma.unavailability.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!existing || existing.userId !== user.id) {
    throw new Error("Ese rango de fechas no es tuyo");
  }

  await prisma.unavailability.delete({ where: { id } });
  revalidatePath("/availability");
}
