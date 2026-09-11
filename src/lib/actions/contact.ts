"use server";

import { z } from "zod";

import { sendContactEmail } from "@/lib/email";

export type ContactState = { error?: string; sent?: boolean };

const contactSchema = z.object({
  name: z.string().trim().min(1, "Indica tu nombre"),
  email: z.string().trim().toLowerCase().email("Email no válido"),
  message: z.string().trim().min(1, "Escribe un mensaje"),
});

export async function sendContactMessage(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  }

  try {
    await sendContactEmail(parsed.data);
  } catch (error) {
    console.error("Error enviando email de contacto", error);
    return { error: "No se ha podido enviar el mensaje. Inténtalo de nuevo." };
  }

  return { sent: true };
}
