import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { ensureOrganization } from "@/lib/organization";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutos

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
        });
        if (!user) return null;

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          const attempts = user.failedLoginAttempts + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: attempts,
              lockedUntil:
                attempts >= MAX_LOGIN_ATTEMPTS
                  ? new Date(Date.now() + LOCKOUT_MS)
                  : null,
            },
          });
          return null;
        }

        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isSuperAdmin: user.isSuperAdmin,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.isSuperAdmin = Boolean(
          (user as { isSuperAdmin?: boolean }).isSuperAdmin,
        );
        token.organizationId =
          (user as { organizationId?: string | null }).organizationId ??
          undefined;
      }

      // Sesiones creadas antes de introducir organizaciones (o de una
      // fila todavía no migrada) no traen organizationId: lo rellenamos
      // aquí para no obligar a todo el mundo a volver a iniciar sesión.
      if (!token.organizationId && token.id) {
        let dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { organizationId: true },
        });
        if (!dbUser?.organizationId) {
          await ensureOrganization();
          dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { organizationId: true },
          });
        }
        token.organizationId = dbUser?.organizationId ?? undefined;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isSuperAdmin = Boolean(token.isSuperAdmin);
        session.user.organizationId = (token.organizationId as string) ?? "";
      }
      return session;
    },
  },
});
