import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

export function cardClassName({
  padding = "p-4",
  interactive = false,
  className = "",
}: {
  padding?: string;
  interactive?: boolean;
  className?: string;
} = {}) {
  return [
    "rounded-lg border border-line bg-surface",
    padding,
    interactive && "transition hover:border-muted",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Card({
  as,
  padding = "p-4",
  className,
  children,
  ...props
}: {
  as?: ElementType;
  padding?: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "className" | "children">) {
  const Component = as ?? "div";
  return (
    <Component className={cardClassName({ padding, className })} {...props}>
      {children}
    </Component>
  );
}
