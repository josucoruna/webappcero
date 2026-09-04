"use client";

import { useActionState } from "react";

import {
  createServiceFromCalendar,
  type ActionState,
} from "@/lib/actions/services";

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
      className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-6"
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
          className="rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-foreground"
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
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Ej. Culto del sábado"
          className="rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm font-medium text-foreground">
          Fecha y hora
        </label>
        <input
          id="date"
          name="date"
          type="datetime-local"
          required
          defaultValue={`${defaultDate}T18:00`}
          className="rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium text-foreground">
          Notas (opcional)
        </label>
        <input
          id="notes"
          name="notes"
          type="text"
          className="rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </div>
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear servicio"}
      </button>
    </form>
  );
}
