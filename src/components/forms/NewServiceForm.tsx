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
      className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="teamId" className="text-sm font-medium text-zinc-700">
          Equipo
        </label>
        <select
          id="teamId"
          name="teamId"
          required
          defaultValue={teams.length === 1 ? teams[0].id : ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
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
        <label htmlFor="title" className="text-sm font-medium text-zinc-700">
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Ej. Culto del sábado"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm font-medium text-zinc-700">
          Fecha y hora
        </label>
        <input
          id="date"
          name="date"
          type="datetime-local"
          required
          defaultValue={`${defaultDate}T18:00`}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium text-zinc-700">
          Notas (opcional)
        </label>
        <input
          id="notes"
          name="notes"
          type="text"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
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
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear servicio"}
      </button>
    </form>
  );
}
