"use client";

import { useActionState } from "react";

import { addPosition, type ActionState } from "@/lib/actions/services";
import { Button } from "@/components/ui/Button";
import { Input, inputClassName } from "@/components/ui/Input";
import { cardClassName } from "@/components/ui/Card";

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
      className={cardClassName({
        className: "flex flex-col gap-3 sm:flex-row sm:items-end",
      })}
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Puesto
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Ej. Guitarra, Sonido, Proyección…"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label
          htmlFor="assignedUserId"
          className="text-sm font-medium text-foreground"
        >
          Asignar a (opcional)
        </label>
        <select
          id="assignedUserId"
          name="assignedUserId"
          defaultValue=""
          className={inputClassName()}
        >
          <option value="">Sin asignar</option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Añadiendo…" : "Añadir puesto"}
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
