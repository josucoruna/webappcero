"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { ensureOrganization } from "@/lib/organization";

const registerSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 letras"),
  email: z.string().trim().toLowerCase().email("Email no válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  code: z.string().trim().min(1, "Indica el código de acceso"),
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
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos" };
  }

  const { name, email, password, code } = parsed.data;

  await ensureOrganization();
  const organization = await prisma.organization.findUnique({
    where: { registrationCode: code },
  });
  if (!organization) {
    return { error: "Código de acceso incorrecto" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese email" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // El primer usuario registrado en la organización se convierte en su
  // admin principal.
  const usersInOrgCount = await prisma.user.count({
    where: { organizationId: organization.id },
  });

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      isSuperAdmin: usersInOrgCount === 0,
      organizationId: organization.id,
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
