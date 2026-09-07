"use client";

import { useActionState } from "react";

import {
  addUnavailability,
  type ActionState,
} from "@/lib/actions/availability";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cardClassName } from "@/components/ui/Card";

const initialState: ActionState = {};

export function AddUnavailabilityForm() {
  const [state, formAction, pending] = useActionState(
    addUnavailability,
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
        <label htmlFor="startDate" className="text-sm font-medium text-foreground">
          Desde
        </label>
        <Input id="startDate" name="startDate" type="date" required />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="endDate" className="text-sm font-medium text-foreground">
          Hasta
        </label>
        <Input id="endDate" name="endDate" type="date" required />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="reason" className="text-sm font-medium text-foreground">
          Motivo (opcional)
        </label>
        <Input
          id="reason"
          name="reason"
          type="text"
          maxLength={150}
          placeholder="Ej. Vacaciones, viaje…"
        />
      </div>
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Guardando…" : "Bloquear estas fechas"}
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
