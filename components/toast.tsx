"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastInput = {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastRecord = ToastInput & { id: string };

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function variantIcon(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return <CheckCircle2 size={18} aria-hidden />;
    case "error":
      return <XCircle size={18} aria-hidden />;
    case "warning":
      return <AlertCircle size={18} aria-hidden />;
    default:
      return <Info size={18} aria-hidden />;
  }
}

function ToastItem({
  item,
  onDismiss,
}: {
  item: ToastRecord;
  onDismiss: (id: string) => void;
}) {
  const variant = item.variant ?? "info";
  return (
    <div
      className={`glass toast-item toast-item--${variant}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast-item-icon">{variantIcon(variant)}</span>
      <div className="toast-item-copy">
        <p className="toast-item-title">{item.title}</p>
        {item.description ? (
          <p className="toast-item-desc">{item.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-icon toast-item-close"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss"
      >
        <X size={16} aria-hidden />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = input.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const record: ToastRecord = { ...input, id, variant: input.variant ?? "info" };
      setItems((prev) => [...prev, record]);
      const duration = input.duration ?? 4000;
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-label="Notifications">
        {items.map((item) => (
          <ToastItem key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
