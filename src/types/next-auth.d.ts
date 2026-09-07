import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isSuperAdmin: boolean;
      organizationId: string;
    } & DefaultSession["user"];
  }

  interface User {
    isSuperAdmin?: boolean;
    organizationId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isSuperAdmin?: boolean;
    organizationId?: string;
  }
}
