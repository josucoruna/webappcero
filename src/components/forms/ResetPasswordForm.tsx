"use client";

import { useActionState } from "react";

import {
  resetPassword,
  type ResetPasswordState,
} from "@/lib/actions/passwordReset";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    resetPassword,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <div className="flex flex-col gap-1">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Nueva contraseña
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-foreground"
        >
          Repite la contraseña
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending} className="mt-2">
        {pending ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  );
}
