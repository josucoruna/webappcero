"use client";

import { useActionState } from "react";

import { addPosition, type ActionState } from "@/lib/actions/services";

const initialState: ActionState = {};

type Member = { userId: string; name: string };

export function AddPositionForm({
  teamId,
  serviceId,
  members,
}: {
  teamId: string;
  serviceId: string;
  members: Member[];
}) {
  const addPositionForService = addPosition.bind(null, teamId, serviceId);
  const [state, formAction, pending] = useActionState(
    addPositionForService,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700">
          Puesto
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Ej. Guitarra, Sonido, Proyección…"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label
          htmlFor="assignedUserId"
          className="text-sm font-medium text-zinc-700"
        >
          Asignar a (opcional)
        </label>
        <select
          id="assignedUserId"
          name="assignedUserId"
          defaultValue=""
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        >
          <option value="">Sin asignar</option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Añadiendo…" : "Añadir puesto"}
      </button>
      {state.error && (
        <p className="text-sm text-red-600 sm:basis-full" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
