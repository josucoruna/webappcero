"use client";

import { useActionState } from "react";

import {
  requestPasswordReset,
  type RequestResetState,
} from "@/lib/actions/passwordReset";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: RequestResetState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state.sent) {
    return (
      <p className="text-sm text-foreground">
        Si existe una cuenta con ese email, te hemos enviado un enlace para
        restablecer la contraseña. Revisa también la carpeta de spam.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending} className="mt-2">
        {pending ? "Enviando…" : "Enviar enlace"}
      </Button>
    </form>
  );
}
