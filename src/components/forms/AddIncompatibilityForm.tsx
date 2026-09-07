"use client";

import { useActionState } from "react";

import {
  addIncompatibility,
  type ActionState,
} from "@/lib/actions/incompatibilities";
import { Button } from "@/components/ui/Button";
import { Input, inputClassName } from "@/components/ui/Input";
import { cardClassName } from "@/components/ui/Card";

const initialState: ActionState = {};

type Member = { userId: string; name: string };

export function AddIncompatibilityForm({
  teamId,
  members,
}: {
  teamId: string;
  members: Member[];
}) {
  const addIncompatibilityForTeam = addIncompatibility.bind(null, teamId);
  const [state, formAction, pending] = useActionState(
    addIncompatibilityForTeam,
    initialState,
  );

  return (
    <form
      action={formAction}
      className={cardClassName({
        className: "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end",
      })}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="userAId" className="text-sm font-medium text-foreground">
          Persona 1
        </label>
        <select id="userAId" name="userAId" required defaultValue="" className={inputClassName()}>
          <option value="" disabled>
            Elige a alguien
          </option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="userBId" className="text-sm font-medium text-foreground">
          Persona 2
        </label>
        <select id="userBId" name="userBId" required defaultValue="" className={inputClassName()}>
          <option value="" disabled>
            Elige a alguien
          </option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="reason" className="text-sm font-medium text-foreground">
          Motivo (opcional, solo lo ven los líderes)
        </label>
        <Input id="reason" name="reason" type="text" placeholder="Opcional" />
      </div>
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Guardando…" : "Marcar como incompatibles"}
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
