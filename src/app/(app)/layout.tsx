import type { ReactNode } from "react";

import { requireUser } from "@/lib/authz";
import { Header } from "@/components/Header";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return (
    <>
      <Header user={user} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        {children}
      </main>
    </>
  );
}
