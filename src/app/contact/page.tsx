import Link from "next/link";

import { ContactForm } from "@/components/forms/ContactForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Contacto · LuaOne",
};

export default function ContactPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <Card padding="p-8" className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-foreground">Contacto</h1>
        <p className="mt-1 text-sm text-muted">
          ¿Tienes alguna duda? Escríbenos y te responderemos por email.
        </p>
        <div className="mt-6">
          <ContactForm />
        </div>
        <p className="mt-6 text-sm text-muted">
          <Link href="/" className="font-medium text-foreground underline">
            Volver al inicio
          </Link>
        </p>
      </Card>
    </main>
  );
}
