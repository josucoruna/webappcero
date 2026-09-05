"use client";

import { useActionState } from "react";

import { createService, type ActionState } from "@/lib/actions/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cardClassName } from "@/components/ui/Card";

const initialState: ActionState = {};

export function CreateServiceForm({ teamId }: { teamId: string }) {
  const createServiceForTeam = createService.bind(null, teamId);
  const [state, formAction, pending] = useActionState(
    createServiceForTeam,
    initialState,
  );

  return (
    <form
      action={formAction}
      className={cardClassName({
        className: "flex flex-col gap-3 sm:flex-row sm:items-end",
      })}
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Título
        </label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Ej. Culto del domingo"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm font-medium text-foreground">
          Fecha y hora
        </label>
        <Input id="date" name="date" type="datetime-local" required />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium text-foreground">
          Notas (opcional)
        </label>
        <Input id="notes" name="notes" type="text" />
      </div>
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Creando…" : "Crear servicio"}
      </Button>
      {state.error && (
        <p
          className="text-sm text-red-600 dark:text-red-400 sm:basis-full"
          role="alert"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
