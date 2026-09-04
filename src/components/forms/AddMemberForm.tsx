"use client";

import { useActionState } from "react";

import { addTeamMember, type ActionState } from "@/lib/actions/teams";

const initialState: ActionState = {};

export function AddMemberForm({ teamId }: { teamId: string }) {
  const [state, formAction, pending] = useActionState(
    addTeamMember,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="teamId" value={teamId} />
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Email de la persona
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Debe estar ya registrada en la app"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="role" className="text-sm font-medium text-zinc-700">
          Rol en el equipo
        </label>
        <select
          id="role"
          name="role"
          defaultValue="MEMBER"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        >
          <option value="MEMBER">Miembro</option>
          <option value="LEADER">Líder</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Añadiendo…" : "Añadir al equipo"}
      </button>
      {state.error && (
        <p className="text-sm text-red-600 sm:basis-full" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
