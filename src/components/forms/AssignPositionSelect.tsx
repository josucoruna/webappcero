"use client";

import { useRef } from "react";

import { assignPosition } from "@/lib/actions/services";

type Member = { userId: string; name: string };

export function AssignPositionSelect({
  teamId,
  serviceId,
  positionId,
  assignedUserId,
  members,
}: {
  teamId: string;
  serviceId: string;
  positionId: string;
  assignedUserId: string | null;
  members: Member[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const assignForPosition = assignPosition.bind(
    null,
    teamId,
    serviceId,
    positionId,
  );

  return (
    <form ref={formRef} action={assignForPosition}>
      <select
        name="assignedUserId"
        defaultValue={assignedUserId ?? ""}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-md border border-input px-2 py-1.5 text-sm outline-none focus:border-foreground"
      >
        <option value="">Sin asignar</option>
        {members.map((member) => (
          <option key={member.userId} value={member.userId}>
            {member.name}
          </option>
        ))}
      </select>
    </form>
  );
}
