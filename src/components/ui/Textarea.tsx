import type { TextareaHTMLAttributes } from "react";

import { inputClassName, type InputSize } from "@/components/ui/Input";

export function Textarea({
  uiSize = "md",
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { uiSize?: InputSize }) {
  return (
    <textarea className={inputClassName({ size: uiSize, className })} {...props} />
  );
}
