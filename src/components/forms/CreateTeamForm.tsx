"use client";

import { useActionState } from "react";

import { createTeam, type ActionState } from "@/lib/actions/teams";

const initialState: ActionState = {};

export function CreateTeamForm() {
  const [state, formAction, pending] = useActionState(
    createTeam,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700">
          Nombre del equipo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Ej. Alabanza"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-zinc-700"
        >
          Descripción (opcional)
        </label>
        <input
          id="description"
          name="description"
          type="text"
          placeholder="Ej. Música y cantantes del culto"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear equipo"}
      </button>
      {state.error && (
        <p className="text-sm text-red-600 sm:basis-full" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
