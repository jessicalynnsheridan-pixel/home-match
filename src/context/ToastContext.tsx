"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { Heart, Sparkles, Bell, CheckCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = "save" | "match" | "success" | "info";

interface Toast {
  id: string;
  message: string;
  sub?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, options?: { sub?: string; variant?: ToastVariant }) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

// ─── Toast item ───────────────────────────────────────────────────────────────

function ToastItem({ toast: t, onDone }: { toast: Toast; onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const out = setTimeout(() => setLeaving(true), 2800);
    const rm  = setTimeout(() => onDone(), 3100);
    return () => { clearTimeout(out); clearTimeout(rm); };
  }, [onDone]);

  const iconMap: Record<ToastVariant, React.ReactNode> = {
    save:    <Heart size={13} className="fill-rose-400 text-rose-400" />,
    match:   <Sparkles size={13} className="text-[#b8a88a]" />,
    success: <CheckCircle size={13} className="text-emerald-500" />,
    info:    <Bell size={13} className="text-[#b8a88a]" />,
  };

  return (
    <div
      className={`
        flex items-center gap-3 bg-[#2c2825] text-white
        rounded-2xl px-4 py-3 shadow-xl
        ${leaving ? "animate-toast-out" : "animate-toast-in"}
      `}
    >
      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
        {iconMap[t.variant]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{t.message}</p>
        {t.sub && <p className="text-[#e8e4de]/60 text-xs mt-0.5">{t.sub}</p>}
      </div>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const toast = useCallback((
    message: string,
    { sub, variant = "info" }: { sub?: string; variant?: ToastVariant } = {}
  ) => {
    const id = `t-${++counter.current}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, sub, variant }]);
  }, []);

  function remove(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast stack, bottom-center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none w-[min(360px,90vw)]">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
