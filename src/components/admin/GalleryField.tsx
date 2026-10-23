"use client";

import { useMemo, useState } from "react";
import { uploadMediaFiles } from "@/server/admin";
import type { MediaChoice } from "./ImageField";

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
const buttonClass = "inline-flex h-10 items-center rounded-md border border-border bg-card px-3 text-sm font-semibold";

export function GalleryField({
  initialValue = "",
  media = [],
}: {
  initialValue?: string;
  media?: MediaChoice[];
}) {
  const [text, setText] = useState(initialValue);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const urls = useMemo(() => text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean), [text]);

  function append(next: string[]) {
    const merged = [...urls];
    for (const url of next) {
      if (url && !merged.includes(url)) merged.push(url);
    }
    setText(merged.join("\n"));
  }

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    const data = new FormData();
    for (const file of Array.from(files)) data.append("files", file);
    setPending(true);
    const result = await uploadMediaFiles(data);
    setPending(false);
    if (result.error) setError(result.error);
    append(result.urls);
  }

  function remove(url: string) {
    setText(urls.filter((item) => item !== url).join("\n"));
  }

  return (
    <div className="space-y-3 rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">Thư viện ảnh — mỗi URL một dòng</p>
        <div className="flex flex-wrap gap-2">
          <label className={`${buttonClass} cursor-pointer`}>
            {pending ? "Đang tải..." : "Chọn ảnh từ máy tính"}
            <input type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" disabled={pending} onChange={(event) => { void onUpload(event.currentTarget.files); event.currentTarget.value = ""; }} />
          </label>
          <button type="button" className={buttonClass} onClick={() => setLibraryOpen(true)}>Chọn ảnh từ thư viện</button>
        </div>
      </div>
      <textarea name="galleryUrls" value={text} onChange={(event) => setText(event.currentTarget.value)} rows={4} className={inputClass} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {urls.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {urls.map((url) => (
            <figure key={url} className="overflow-hidden rounded-lg border border-border bg-secondary">
              <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
              <button type="button" className="w-full px-2 py-1.5 text-xs font-semibold text-destructive" onClick={() => remove(url)}>Xóa khỏi danh sách</button>
            </figure>
          ))}
        </div>
      ) : <p className="text-sm text-muted-foreground">Chưa có ảnh trong thư viện của địa điểm này.</p>}
      {libraryOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/50 p-4" onClick={() => setLibraryOpen(false)}>
          <section className="max-h-[85vh] w-full max-w-4xl overflow-auto rounded-2xl border border-border bg-card p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold">Thư viện ảnh</h2>
              <button type="button" className={buttonClass} onClick={() => setLibraryOpen(false)}>Đóng</button>
            </div>
            {media.length ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {media.map((asset) => (
                  <button key={asset.url} type="button" onClick={() => { append([asset.url]); }} className={`overflow-hidden rounded-xl border text-left ${urls.includes(asset.url) ? "border-primary" : "border-border"}`}>
                    <span className="flex aspect-[4/3] items-center justify-center bg-secondary"><img src={asset.url} alt={asset.alt || ""} className="max-h-full max-w-full object-contain" /></span>
                    <span className="block truncate px-2 py-1.5 text-xs">{urls.includes(asset.url) ? "Đã chọn · " : ""}{asset.file_name || asset.alt || "Ảnh"}</span>
                  </button>
                ))}
              </div>
            ) : <p className="mt-4 text-sm text-muted-foreground">Thư viện chưa có ảnh.</p>}
          </section>
        </div>
      ) : null}
    </div>
  );
}
