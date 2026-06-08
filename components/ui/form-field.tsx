import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { Label } from "@/components/ui/label";

type ControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
};

/**
 * Form field molecule — label, control, optional help, optional error.
 * Clones a single child (Input, Select, Textarea) to wire ARIA ids.
 */
export function FormField({
  id,
  label,
  help,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<ControlProps>, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required ? true : undefined,
      })
    : children;

  return (
    <div className="ds-form-field">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {control}
      {help ? (
        <p id={helpId} className="ds-form-help">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="ds-form-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
