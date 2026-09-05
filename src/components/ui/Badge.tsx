import type { ReactNode } from "react";

// Colores fijos a propósito (no usan los tokens de --color-*): son insignias
// pequeñas y autocontenidas que deben leerse bien sobre cualquier fondo.
export type BadgeVariant = "neutral" | "info" | "warning" | "success" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-accent text-muted",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  warning:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  success:
    "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

export function Badge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={[
        "inline-block rounded px-1.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
