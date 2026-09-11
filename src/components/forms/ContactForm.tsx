"use client";

import { useActionState } from "react";

import { sendContactMessage, type ContactState } from "@/lib/actions/contact";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const initialState: ContactState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
    initialState,
  );

  if (state.sent) {
    return (
      <p className="text-sm text-foreground">
        Gracias por escribirnos. Te responderemos por email lo antes posible.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Nombre
        </label>
        <Input id="name" name="name" type="text" required autoComplete="name" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          Mensaje
        </label>
        <Textarea id="message" name="message" required rows={5} />
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending} className="mt-2">
        {pending ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
