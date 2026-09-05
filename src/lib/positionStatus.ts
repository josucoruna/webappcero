import type { BadgeVariant } from "@/components/ui/Badge";

export const positionStatusLabels: Record<string, string> = {
  PENDING: "Pendiente de confirmar",
  CONFIRMED: "Confirmado",
  DECLINED: "Rechazado",
};

export const positionStatusVariant: Record<string, BadgeVariant> = {
  PENDING: "neutral",
  CONFIRMED: "success",
  DECLINED: "danger",
};
