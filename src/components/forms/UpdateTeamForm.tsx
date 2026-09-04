"use client";

import { useActionState } from "react";

import { updateTeamDetails, type ActionState } from "@/lib/actions/teams";

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
        <label htmlFor="name" className="text-sm font-medium text-zinc-700">
          Nombre del equipo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={name}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-zinc-700"
        >
          Descripción
        </label>
        <input
          id="description"
          name="description"
          type="text"
          defaultValue={description}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
      {state.error && (
        <p className="text-sm text-red-600 sm:basis-full" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
