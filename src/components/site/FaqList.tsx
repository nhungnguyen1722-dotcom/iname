"use client";

import { memo, useCallback, useState } from "react";
import type { SectionItem } from "@/lib/content";

const FaqItem = memo(function FaqItem({
  question,
  answer,
  expanded,
  onToggle,
  index,
  accentColor,
}: {
  question: string;
  answer: string;
  expanded: boolean;
  onToggle: (index: number) => void;
  index: number;
  accentColor?: string;
}) {
  const toggle = useCallback(() => onToggle(index), [onToggle, index]);
  return (
    <div className="border-b border-border">
      <h3>
        <button type="button" className="flex w-full items-center justify-between gap-4 py-4 text-left font-display text-base font-bold sm:text-lg" aria-expanded={expanded} onClick={toggle}>
          <span className="pr-2">{question}</span>
          <span
            aria-hidden="true"
            className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full text-lg font-semibold transition ${
              expanded ? "bg-[#094690] text-white" : "bg-[#dbeafe] text-[#094690]"
            }`}
            style={accentColor ? {
              backgroundColor: expanded ? accentColor : "color-mix(in srgb, " + accentColor + " 14%, white)",
              color: expanded ? "#fff" : accentColor,
            } : undefined}
          >
            {expanded ? "×" : "+"}
          </span>
        </button>
      </h3>
      {expanded ? <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{answer}</p> : null}
    </div>
  );
});

export const FaqList = memo(function FaqList({ items, accentColor }: { items: SectionItem[]; accentColor?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const toggle = useCallback((index: number) => {
    setOpen((current) => (current === index ? null : index));
  }, []);
  return (
    <div>
      {items.map((item, index) => (
        <FaqItem
          key={String(item.question || index)}
          question={String(item.question || "")}
          answer={String(item.answer || "")}
          expanded={open === index}
          onToggle={toggle}
          index={index}
          accentColor={accentColor}
        />
      ))}
    </div>
  );
});
