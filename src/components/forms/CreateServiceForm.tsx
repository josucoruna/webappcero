"use client";

import { useActionState } from "react";

import { createService, type ActionState } from "@/lib/actions/services";

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
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-zinc-700">
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Ej. Culto del domingo"
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
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
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
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear servicio"}
      </button>
      {state.error && (
        <p className="text-sm text-red-600 sm:basis-full" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
