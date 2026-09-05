"use client";

import { useActionState } from "react";

import {
  createServiceFromCalendar,
  type ActionState,
} from "@/lib/actions/services";
import { Button } from "@/components/ui/Button";
import { Input, inputClassName } from "@/components/ui/Input";
import { cardClassName } from "@/components/ui/Card";

const initialState: ActionState = {};

type Team = { id: string; name: string };

export function NewServiceForm({
  teams,
  defaultDate,
}: {
  teams: Team[];
  defaultDate: string;
}) {
  const [state, formAction, pending] = useActionState(
    createServiceFromCalendar,
    initialState,
  );

  return (
    <form
      action={formAction}
      className={cardClassName({ padding: "p-6", className: "flex flex-col gap-4" })}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="teamId" className="text-sm font-medium text-foreground">
          Equipo
        </label>
        <select
          id="teamId"
          name="teamId"
          required
          defaultValue={teams.length === 1 ? teams[0].id : ""}
          className={inputClassName()}
        >
          <option value="" disabled>
            Elige un equipo
          </option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Título
        </label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Ej. Culto del sábado"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm font-medium text-foreground">
          Fecha y hora
        </label>
        <Input
          id="date"
          name="date"
          type="datetime-local"
          required
          defaultValue={`${defaultDate}T18:00`}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium text-foreground">
          Notas (opcional)
        </label>
        <Input id="notes" name="notes" type="text" />
      </div>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Creando…" : "Crear servicio"}
      </Button>
    </form>
  );
}
