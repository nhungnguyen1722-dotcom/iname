"use client";

import { createContext, memo, useCallback, useContext, useMemo, useState } from "react";
import { ContactForm } from "./ContactForm";
import type { PricingPlan } from "@/lib/content";

type Settings = Record<string, string>;

const ConsultContext = createContext<{ openConsult: () => void }>({ openConsult: () => undefined });

export function useConsult() {
  return useContext(ConsultContext);
}

export function ConsultProvider({
  settings,
  plans,
  children,
}: {
  settings: Settings;
  plans: PricingPlan[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openConsult = useCallback(() => setOpen(true), []);
  const closeConsult = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ openConsult }), [openConsult]);
  return (
    <ConsultContext.Provider value={value}>
      {children}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-4 sm:items-center" role="presentation" onClick={closeConsult}>
          <div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl bg-card p-6 shadow-elegant" role="dialog" aria-modal="true" aria-labelledby="consult-title" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="consult-title" className="font-display text-2xl font-extrabold">Nhận tư vấn miễn phí</h2>
                <p className="mt-1 text-sm text-muted-foreground">Điền thông tin, chuyên viên sẽ gọi lại trong giờ làm việc.</p>
              </div>
              <button type="button" className="rounded-md border border-border px-3 py-1 text-sm" onClick={closeConsult}>Đóng</button>
            </div>
            <ContactForm settings={settings} plans={plans} sourcePath={typeof window !== "undefined" ? window.location.pathname : "/"} />
          </div>
        </div>
      ) : null}
    </ConsultContext.Provider>
  );
}

export const ConsultButton = memo(function ConsultButton({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  const { openConsult } = useConsult();
  return (
    <button type="button" className={className} onClick={openConsult}>
      {label}
    </button>
  );
});
