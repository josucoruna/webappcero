"use client";

import { useActionState } from "react";

import { createTeam, type ActionState } from "@/lib/actions/teams";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cardClassName } from "@/components/ui/Card";

const initialState: ActionState = {};

export function CreateTeamForm() {
  const [state, formAction, pending] = useActionState(
    createTeam,
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
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Nombre del equipo
        </label>
        <Input id="name" name="name" type="text" required placeholder="Ej. Alabanza" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-foreground"
        >
          Descripción (opcional)
        </label>
        <Input
          id="description"
          name="description"
          type="text"
          placeholder="Ej. Música y cantantes del culto"
        />
      </div>
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Creando…" : "Crear equipo"}
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
