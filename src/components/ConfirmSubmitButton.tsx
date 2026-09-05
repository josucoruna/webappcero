"use client";

import type { ReactNode } from "react";

import {
  buttonClassName,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/Button";

export function ConfirmSubmitButton({
  children,
  confirmMessage,
  variant = "danger",
  size = "sm",
  className,
}: {
  children: ReactNode;
  confirmMessage: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={buttonClassName({ variant, size, className })}
      onClick={(event) => {
        if (!confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
