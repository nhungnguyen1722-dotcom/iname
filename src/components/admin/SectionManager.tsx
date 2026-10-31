"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { duplicateSection, deleteSection, saveSectionOrder, toggleSectionVisible } from "@/server/admin";

type SectionRow = {
  id: number;
  admin_name: string;
  section_type: string;
  visible: boolean;
  status: string;
};

function SectionManagerList({
  pageSlug,
  sections,
}: {
  pageSlug: string;
  sections: SectionRow[];
}) {
  const [items, setItems] = useState(sections);
  const [dragId, setDragId] = useState<number | null>(null);
  const sectionKey = sections.map((section) => `${section.id}:${section.visible}:${section.status}:${section.admin_name}:${section.section_type}`).join("|");

  useEffect(() => {
    setItems(sections);
    setDragId(null);
  }, [sectionKey, sections]);

  const dropOn = useCallback((targetId: number) => {
    setItems((current) => {
      if (dragId == null || dragId === targetId) return current;
      const next = [...current];
      const from = next.findIndex((item) => item.id === dragId);
      const to = next.findIndex((item) => item.id === targetId);
      if (from < 0 || to < 0) return current;
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next;
    });
    setDragId(null);
  }, [dragId]);

  return (
    <div>
      <div className="space-y-3">
        {items.map((section, index) => (
          <article
            key={section.id}
            draggable
            onDragStart={() => setDragId(section.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => dropOn(section.id)}
            className={`flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between ${dragId === section.id ? "border-primary opacity-70" : "border-border"}`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="cursor-grab select-none rounded-md border border-border px-2 py-1 text-xs text-muted-foreground" aria-hidden="true">⋮⋮</span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{section.admin_name}</p>
                <p className="text-xs text-muted-foreground">{section.section_type} · {section.status === "published" ? "Xuất bản" : "Nháp"} · {section.visible ? "Đang hiện" : "Đang ẩn"}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <form action={toggleSectionVisible}>
                <input type="hidden" name="id" value={section.id} />
                <input type="hidden" name="pageSlug" value={pageSlug} />
                <button type="submit" className={`relative h-7 w-12 rounded-full transition ${section.visible ? "bg-[#094690]" : "bg-border"}`} aria-label={section.visible ? "Tắt section" : "Bật section"}>
                  <span className={`absolute top-0.5 size-6 rounded-full bg-white shadow ${section.visible ? "right-0.5" : "left-0.5"}`} />
                </button>
              </form>
              <Link className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" href={`/admin/pages/${pageSlug}/sections/${section.id}`}>Sửa</Link>
              <form action={duplicateSection}><input type="hidden" name="id" value={section.id} /><button className="rounded-md border px-3 py-2 text-sm">Sao chép</button></form>
              <form action={deleteSection}><input type="hidden" name="id" value={section.id} /><button className="rounded-md border px-3 py-2 text-sm text-destructive">Ẩn khỏi hệ thống</button></form>
            </div>
          </article>
        ))}
      </div>
      <form action={saveSectionOrder} className="mt-4">
        <input type="hidden" name="pageSlug" value={pageSlug} />
        <input type="hidden" name="order" value={items.map((item) => item.id).join(",")} />
        <button type="submit" className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">Lưu thứ tự</button>
      </form>
    </div>
  );
}

export function SectionManager(props: { pageSlug: string; sections: SectionRow[] }) {
  const sectionKey = props.sections.map((section) => `${section.id}:${section.visible}:${section.status}:${section.admin_name}:${section.section_type}`).join("|");
  return <SectionManagerList key={sectionKey} {...props} />;
}
