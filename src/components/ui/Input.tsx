import type { InputHTMLAttributes } from "react";

export type InputSize = "sm" | "md" | "lg";

const sizeClasses: Record<InputSize, string> = {
  sm: "px-2 py-1.5",
  md: "px-3 py-2",
  lg: "px-4 py-3",
};

export function inputClassName({
  size = "md",
  className = "",
}: {
  size?: InputSize;
  className?: string;
} = {}) {
  return [
    "rounded-md border border-input text-sm outline-none focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60",
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Input({
  uiSize = "md",
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { uiSize?: InputSize }) {
  return (
    <input className={inputClassName({ size: uiSize, className })} {...props} />
  );
}
