"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function ModalBackdrop({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      className="ds-modal-backdrop"
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose?.();
      }}
    >
      {children}
    </div>
  );
}

export function Modal({
  title,
  children,
  footer,
  onClose,
  id,
}: {
  title: string;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  id?: string;
}) {
  const titleId = id ?? "modal-title";

  return (
    <ModalBackdrop onClose={onClose}>
      <div
        className="ds-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ds-modal__head">
          <h2 id={titleId} className="ds-modal__title">
            {title}
          </h2>
        </div>
        {children ? <div className="ds-modal__body">{children}</div> : null}
        {footer ? <div className="ds-modal__foot">{footer}</div> : null}
      </div>
    </ModalBackdrop>
  );
}

export function ModalActions({
  onCancel,
  onConfirm,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  danger = false,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <>
      <Button variant="ghost" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </>
  );
}
