"use client";

import { useActionState } from "react";

import { updateTeamDetails, type ActionState } from "@/lib/actions/teams";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: ActionState = {};

export function UpdateTeamForm({
  teamId,
  name,
  description,
}: {
  teamId: string;
  name: string;
  description: string;
}) {
  const updateForTeam = updateTeamDetails.bind(null, teamId);
  const [state, formAction, pending] = useActionState(
    updateForTeam,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Nombre del equipo
        </label>
        <Input id="name" name="name" type="text" required defaultValue={name} />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-foreground"
        >
          Descripción
        </label>
        <Input
          id="description"
          name="description"
          type="text"
          defaultValue={description}
        />
      </div>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Guardando…" : "Guardar cambios"}
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
