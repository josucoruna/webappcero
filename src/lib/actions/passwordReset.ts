"use server";

import { randomBytes, createHash } from "crypto";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/url";
import { signIn } from "@/auth";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export type RequestResetState = { error?: string; sent?: boolean };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

const emailSchema = z.string().trim().toLowerCase().email("Email no válido");

/** Pide un enlace para restablecer la contraseña. Siempre responde igual,
 * exista o no una cuenta con ese email, para no revelar qué emails están
 * registrados. */
export async function requestPasswordReset(
  _prevState: RequestResetState,
  formData: FormData,
): Promise<RequestResetState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: "Indica un email válido" };
  }
  const email = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Invalidamos enlaces anteriores sin usar para que solo el último valga.
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    const rawToken = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        tokenHash: hashToken(rawToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const baseUrl = await getBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (error) {
      // No revelamos el fallo al usuario (evita filtrar si el email existe),
      // pero lo dejamos en los logs del servidor para poder diagnosticarlo.
      console.error("Error enviando email de recuperación de contraseña", error);
    }
  }

  return { sent: true };
}

const resetSchema = z
  .object({
    token: z.string().trim().min(1, "Enlace no válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordState = { error?: string };

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  }
  const { token, password } = parsed.data;

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt.getTime() < Date.now()
  ) {
    return { error: "El enlace no es válido o ha caducado. Pide uno nuevo." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  // Iniciamos sesión automáticamente con la contraseña nueva.
  await signIn("credentials", {
    email: resetToken.user.email,
    password,
    redirectTo: "/dashboard",
  });

  return {};
}
