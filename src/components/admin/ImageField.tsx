"use client";

import { useEffect, useState } from "react";

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
const secondaryButtonClass = "inline-flex h-10 items-center rounded-md border border-border bg-card px-3 text-sm font-semibold";

export type MediaChoice = { url: string; alt: string | null; file_name: string | null };

export function ImageField({
  name,
  uploadName = "image_file",
  value = "",
  media = [],
  label = "Ảnh",
}: {
  name: string;
  uploadName?: string;
  value?: string;
  media?: MediaChoice[];
  label?: string;
}) {
  const [url, setUrl] = useState(value);
  const [libraryOpen, setLibraryOpen] = useState(false);

  useEffect(() => {
    setUrl(value);
  }, [value]);
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">{label}</label>
      {url ? <img src={url} alt="" className="max-h-40 max-w-full rounded-lg border border-border bg-secondary object-contain" /> : null}
      <input type="hidden" name={name} value={url} />
      <input name={uploadName} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary`} onChange={(event) => { if (event.currentTarget.files?.length) setUrl(""); }} />
      <div className="flex flex-wrap items-center gap-2">
        <input aria-label={`${label}: URL HTTPS`} value={url} onChange={(event) => setUrl(event.currentTarget.value)} className={`${inputClass} min-w-64 flex-1`} placeholder="URL HTTPS hoặc /uploads/..." />
        <button className={secondaryButtonClass} type="button" onClick={() => setLibraryOpen(true)}>Chọn từ thư viện</button>
        {url ? <button className={secondaryButtonClass} type="button" onClick={() => setUrl("")}>Xóa ảnh</button> : null}
      </div>
      {libraryOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/50 p-4" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setLibraryOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby={`${name}-library-title`} className="max-h-[85vh] w-full max-w-4xl overflow-auto rounded-2xl border border-border bg-card p-5 shadow-elegant">
            <div className="flex items-center justify-between gap-3"><h2 id={`${name}-library-title`} className="font-display text-xl font-bold">Thư viện phương tiện</h2><button type="button" className={secondaryButtonClass} onClick={() => setLibraryOpen(false)}>Đóng</button></div>
            {media.length ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{media.map((asset) => (
              <button key={asset.url} type="button" onClick={() => { setUrl(asset.url); setLibraryOpen(false); }} className="overflow-hidden rounded-xl border border-border text-left transition hover:border-primary">
                <span className="flex aspect-[4/3] items-center justify-center bg-secondary"><img src={asset.url} alt={asset.alt || ""} className="max-h-full max-w-full object-contain" /></span>
                <span className="block truncate px-2 py-1.5 text-xs">{asset.file_name || asset.alt || asset.url}</span>
              </button>
            ))}</div> : <p className="mt-4 text-sm text-muted-foreground">Thư viện chưa có ảnh. Tải ảnh lên từ thiết bị để thêm ảnh vào thư viện.</p>}
          </section>
        </div>
      ) : null}
    </div>
  );
}
