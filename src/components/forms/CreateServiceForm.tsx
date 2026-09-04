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
      className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Ej. Culto del domingo"
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
          className="rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
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
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
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
