"use client";

import { useState } from "react";

import { confirmAssignment, declineAssignment } from "@/lib/actions/services";

const MAX_DECLINE_REASON_LENGTH = 150;

export function RespondToAssignmentControls({
  positionId,
  status,
}: {
  positionId: string;
  status: "PENDING" | "CONFIRMED" | "DECLINED";
}) {
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "CONFIRMED" && (
        <form action={confirmAssignment.bind(null, positionId)}>
          <button
            type="submit"
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
          >
            Confirmar
          </button>
        </form>
      )}

      {status !== "DECLINED" && !showDeclineForm && (
        <button
          type="button"
          onClick={() => setShowDeclineForm(true)}
          className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        >
          Rechazar
        </button>
      )}

      {status !== "DECLINED" && showDeclineForm && (
        <form
          action={declineAssignment.bind(null, positionId)}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            name="declineReason"
            required
            maxLength={MAX_DECLINE_REASON_LENGTH}
            placeholder="Motivo del rechazo (obligatorio)"
            className="w-56 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => setShowDeclineForm(false)}
            className="text-sm text-zinc-500 hover:underline"
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
}
