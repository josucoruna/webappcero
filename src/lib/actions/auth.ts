"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";

const registerSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 letras"),
  email: z.string().trim().toLowerCase().email("Email no válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type RegisterState = {
  error?: string;
};

export async function registerUser(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese email" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // El primer usuario registrado en toda la app se convierte en admin principal.
  const usersCount = await prisma.user.count();

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      isSuperAdmin: usersCount === 0,
    },
  });

  // Iniciamos sesión automáticamente tras registrarse.
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard",
  });

  return {};
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
