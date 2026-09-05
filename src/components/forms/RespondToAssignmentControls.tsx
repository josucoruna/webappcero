"use client";

import { useState } from "react";

import { confirmAssignment, declineAssignment } from "@/lib/actions/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
          <Button type="submit" variant="success-solid" size="lg">
            Confirmar
          </Button>
        </form>
      )}

      {status !== "DECLINED" && !showDeclineForm && (
        <Button
          type="button"
          variant="danger"
          size="lg"
          onClick={() => setShowDeclineForm(true)}
        >
          Rechazar
        </Button>
      )}

      {status !== "DECLINED" && showDeclineForm && (
        <form
          action={declineAssignment.bind(null, positionId)}
          className="flex flex-wrap items-center gap-2"
        >
          <Input
            type="text"
            name="declineReason"
            required
            maxLength={MAX_DECLINE_REASON_LENGTH}
            placeholder="Motivo del rechazo (obligatorio)"
            uiSize="lg"
            className="w-56"
          />
          <Button type="submit" variant="danger-solid" size="lg">
            Rechazar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => setShowDeclineForm(false)}
          >
            Cancelar
          </Button>
        </form>
      )}
    </div>
  );
}
