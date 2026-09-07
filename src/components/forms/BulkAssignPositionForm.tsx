"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  bulkAssignPosition,
  type BulkAssignState,
} from "@/lib/actions/services";
import { Button } from "@/components/ui/Button";
import { Input, inputClassName } from "@/components/ui/Input";
import { cardClassName } from "@/components/ui/Card";

const initialState: BulkAssignState = {};

type Member = { userId: string; name: string };
type ServiceOption = { id: string; title: string; date: Date };

export function BulkAssignPositionForm({
  teamId,
  members,
  services,
}: {
  teamId: string;
  members: Member[];
  services: ServiceOption[];
}) {
  const action = bulkAssignPosition.bind(null, teamId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className={cardClassName({ className: "flex flex-col gap-3" })}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="bulk-assignedUserId"
            className="text-sm font-medium text-foreground"
          >
            Persona
          </label>
          <select
            id="bulk-assignedUserId"
            name="assignedUserId"
            required
            defaultValue=""
            className={inputClassName()}
          >
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
          <label
            htmlFor="bulk-positionName"
            className="text-sm font-medium text-foreground"
          >
            Puesto
          </label>
          <Input
            id="bulk-positionName"
            name="positionName"
            type="text"
            placeholder="Ej. Voz"
            required
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm font-medium text-foreground">
          Servicios en los que asignarlo
        </legend>
        {services.length === 0 ? (
          <p className="text-sm text-muted">
            No hay servicios próximos en este equipo.
          </p>
        ) : (
          <div className="mt-1 flex max-h-56 flex-col gap-1 overflow-y-auto rounded-md border border-input p-2">
            {services.map((service) => (
              <label
                key={service.id}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <input type="checkbox" name="serviceIds" value={service.id} />
                {service.title} ·{" "}
                {service.date.toLocaleString("es-ES", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Asignando…" : "Asignar a los servicios elegidos"}
        </Button>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}

      {state.result && (
        <div className="flex flex-col gap-2 rounded-md border border-input p-3 text-sm">
          <p className="text-foreground">
            Asignado en {state.result.assignedCount} servicio
            {state.result.assignedCount === 1 ? "" : "s"}.
          </p>
          {state.result.skippedExisting.length > 0 && (
            <p className="text-muted">
              Sin tocar (ya tenían ese puesto):{" "}
              {state.result.skippedExisting.join(", ")}
            </p>
          )}
          {state.result.warnings.length > 0 && (
            <div>
              <p className="font-medium text-amber-600 dark:text-amber-400">
                Revisar (no bloquea, pero puede que quieras cambiarlo):
              </p>
              <ul className="mt-1 flex flex-col gap-1">
                {state.result.warnings.map((warning) => (
                  <li key={warning.serviceId}>
                    <Link
                      href={`/teams/${teamId}/services/${warning.serviceId}`}
                      className="text-foreground underline hover:no-underline"
                    >
                      {warning.label}
                    </Link>
                    : {warning.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
