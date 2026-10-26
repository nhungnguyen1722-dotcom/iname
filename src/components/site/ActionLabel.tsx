import { memo } from "react";

export const ActionLabel = memo(function ActionLabel({ label }: { label: string }) {
  const cleanLabel = label.replace(/\s*(?:→|->)\s*$/, "").trim();
  const hasChatIcon = /liên hệ|tư vấn/i.test(cleanLabel);
  const hasArrow = /xem bảng giá|xem chi tiết|xem thêm/i.test(cleanLabel) || cleanLabel !== label.trim();

  return (
    <span className="inline-flex items-center justify-center gap-2">
      {hasChatIcon ? (
        <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 1 1 20 11.5Z" />
          <path d="M8 11h8m-8 3h5" />
        </svg>
      ) : null}
      <span>{cleanLabel}</span>
      {hasArrow ? <span aria-hidden="true">→</span> : null}
    </span>
  );
});
