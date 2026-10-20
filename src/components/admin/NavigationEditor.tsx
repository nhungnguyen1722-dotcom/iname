"use client";

import { useState } from "react";
import type { NavItem } from "@/lib/content";
import { saveNavigation } from "@/server/admin";
import { buttonClass, inputClass, secondaryButtonClass } from "./AdminShell";

export function NavigationEditor({ initialItems }: { initialItems: NavItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((current) => {
      const reordered = [...current];
      const [item] = reordered.splice(from, 1);
      reordered.splice(to, 0, item);
      return reordered;
    });
  }

  function update(index: number, values: Partial<NavItem>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...values } : item));
  }

  return (
    <form action={saveNavigation} className="mt-6 space-y-4">
      <input type="hidden" name="count" value={items.length} />
      {items.map((item, index) => (
        <div
          key={item.id || `new-${index}`}
          draggable
          onDragStart={() => setDraggedIndex(index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (draggedIndex !== null) move(draggedIndex, index);
            setDraggedIndex(null);
          }}
          onDragEnd={() => setDraggedIndex(null)}
          className={`grid gap-2 rounded-xl border border-border bg-card p-4 md:grid-cols-2 ${draggedIndex === index ? "opacity-50" : ""}`}
        >
          <input type="hidden" name={`id_${index}`} value={item.id || 0} />
          <label className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-2">
            <span aria-hidden="true" className="cursor-grab select-none text-lg">⠿</span>
            Kéo để sắp xếp
            <span className="sr-only">Mục {index + 1}</span>
          </label>
          <input name={`label_${index}`} value={item.label} onChange={(event) => update(index, { label: event.target.value })} className={inputClass} aria-label={`Tên mục ${index + 1}`} />
          <input name={`href_${index}`} value={item.href} onChange={(event) => update(index, { href: event.target.value })} className={inputClass} aria-label={`Đường dẫn mục ${index + 1}`} />
          <label className="text-sm"><input type="checkbox" name={`visible_${index}`} checked={item.visible} onChange={(event) => update(index, { visible: event.target.checked })} /> Hiện</label>
          <label className="text-sm"><input type="checkbox" name={`desktop_${index}`} checked={item.show_desktop} onChange={(event) => update(index, { show_desktop: event.target.checked })} /> Desktop</label>
          <label className="text-sm"><input type="checkbox" name={`mobile_${index}`} checked={item.show_mobile} onChange={(event) => update(index, { show_mobile: event.target.checked })} /> Mobile</label>
          <label className="text-sm"><input type="checkbox" name={`new_${index}`} checked={item.open_in_new_tab} onChange={(event) => update(index, { open_in_new_tab: event.target.checked })} /> Tab mới</label>
          <div className="flex gap-2">
            <button className={secondaryButtonClass} type="button" onClick={() => move(index, index - 1)} disabled={index === 0}>Lên</button>
            <button className={secondaryButtonClass} type="button" onClick={() => move(index, index + 1)} disabled={index === items.length - 1}>Xuống</button>
            <button className={secondaryButtonClass} type="submit" name="intent" value={`remove:${index}`}>Ẩn mục</button>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <button className={buttonClass} name="intent" value="save">Lưu menu</button>
        <button className={secondaryButtonClass} name="intent" value="add">Thêm mục</button>
      </div>
    </form>
  );
}
