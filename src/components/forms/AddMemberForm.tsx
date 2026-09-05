"use client";

import { useActionState } from "react";

import { addTeamMember, type ActionState } from "@/lib/actions/teams";
import { Button } from "@/components/ui/Button";
import { Input, inputClassName } from "@/components/ui/Input";
import { cardClassName } from "@/components/ui/Card";

const initialState: ActionState = {};

export function AddMemberForm({ teamId }: { teamId: string }) {
  const [state, formAction, pending] = useActionState(
    addTeamMember,
    initialState,
  );

  return (
    <form
      action={formAction}
      className={cardClassName({
        className: "flex flex-col gap-3 sm:flex-row sm:items-end",
      })}
    >
      <input type="hidden" name="teamId" value={teamId} />
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email de la persona
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Debe estar ya registrada en la app"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="role" className="text-sm font-medium text-foreground">
          Rol en el equipo
        </label>
        <select
          id="role"
          name="role"
          defaultValue="MEMBER"
          className={inputClassName()}
        >
          <option value="MEMBER">Miembro</option>
          <option value="LEADER">Líder</option>
        </select>
      </div>
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Añadiendo…" : "Añadir al equipo"}
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
