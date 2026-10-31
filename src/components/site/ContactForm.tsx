"use client";

import { memo, useActionState, useMemo } from "react";
import { submitContact, type ContactState } from "@/server/contact";
import type { PricingPlan } from "@/lib/content";

const initial: ContactState = { ok: false, message: "" };

export const ContactForm = memo(function ContactForm({
  settings,
  plans,
  sourcePath,
  compact = false,
}: {
  settings: Record<string, string>;
  plans: PricingPlan[];
  sourcePath: string;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState(submitContact, initial);
  const visiblePlans = useMemo(() => plans.filter((plan) => plan.visible), [plans]);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="sourcePath" value={sourcePath} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <Field label="Họ và tên" name="fullName" required placeholder="Ví dụ: Nguyễn Minh Anh" />
        <Field label="Số điện thoại" name="phone" required placeholder="Ví dụ: 0912 345 678" />
        <Field label="Email" name="email" type="email" placeholder="ban@congty.vn" />
        <Field label="Tên doanh nghiệp hoặc hộ kinh doanh" name="companyName" placeholder="Để trống nếu bạn chưa thành lập" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Dịch vụ quan tâm <span className="text-destructive">*</span>
          <select name="service" required className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal" defaultValue="">
            <option value="" disabled>Chọn dịch vụ</option>
            <option>Văn phòng ảo</option>
            <option>Dịch vụ kế toán</option>
            <option>Cả văn phòng ảo và kế toán</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Gói quan tâm
          <select name="packageName" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal" defaultValue="">
            <option value="">Chọn gói hoặc để trống để được tư vấn</option>
            <option>Chưa rõ, cần tư vấn thêm</option>
            {visiblePlans.map((plan) => (
              <option key={plan.id}>{plan.name}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Nội dung cần tư vấn
        <textarea name="message" rows={4} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal" placeholder="Ví dụ: Cần địa chỉ đăng ký kinh doanh tại Cầu Giấy cho công ty thương mại và kế toán trọn gói." />
      </label>
      <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-card hover:bg-accent/90 disabled:opacity-60">
        {pending ? "Đang gửi..." : "Gửi yêu cầu tư vấn"}
      </button>
      <p className="text-xs text-muted-foreground">Thông tin của bạn chỉ dùng để tư vấn dịch vụ và không chia sẻ cho bên thứ ba. Hotline {settings.hotline}.</p>
      {state.message ? (
        <p className={state.ok ? "text-sm font-medium text-accent" : "text-sm font-medium text-destructive"} role="status">{state.message}</p>
      ) : null}
    </form>
  );
});

function Field({ label, name, required = false, type = "text", placeholder }: { label: string; name: string; required?: boolean; type?: string; placeholder?: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label} {required ? <span className="text-destructive">*</span> : null}
      <input name={name} type={type} required={required} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal" />
    </label>
  );
}
