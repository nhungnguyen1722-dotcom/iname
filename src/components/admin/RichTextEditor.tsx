"use client";

import { useEffect, useRef, useState } from "react";
import { uploadMediaFiles } from "@/server/admin";
import type { MediaChoice } from "./ImageField";

const buttonClass = "rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-semibold hover:bg-secondary";

export function RichTextEditor({
  name,
  label,
  defaultValue = "",
  media = [],
}: {
  name: string;
  label: string;
  defaultValue?: string;
  media?: MediaChoice[];
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);
  const [html, setHtml] = useState(defaultValue);
  useEffect(() => {
    if (seeded.current || !editorRef.current) return;
    editorRef.current.innerHTML = defaultValue;
    seeded.current = true;
  }, [defaultValue]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [error, setError] = useState("");

  function sync() {
    setHtml(editorRef.current?.innerHTML || "");
  }

  function focusEditor() {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand("defaultParagraphSeparator", false, "p");
  }

  function format(command: string, value?: string) {
    focusEditor();
    document.execCommand(command, false, value);
    sync();
  }

  function insertImage(url: string) {
    if (!url) return;
    focusEditor();
    document.execCommand("insertHTML", false, `<img src="${url}" alt="" />`);
    sync();
    setLibraryOpen(false);
  }

  async function onUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("files", file);
    const result = await uploadMediaFiles(data);
    if (result.error) setError(result.error);
    if (result.urls[0]) insertImage(result.urls[0]);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-1.5 rounded-t-lg border border-b-0 border-border bg-secondary/50 p-2">
        <button type="button" className={buttonClass} onClick={() => format("formatBlock", "H1")}>H1</button>
        <button type="button" className={buttonClass} onClick={() => format("formatBlock", "H2")}>H2</button>
        <button type="button" className={buttonClass} onClick={() => format("formatBlock", "H3")}>H3</button>
        <button type="button" className={buttonClass} onClick={() => format("formatBlock", "P")}>Đoạn</button>
        <button type="button" className={buttonClass} onClick={() => format("bold")}>B</button>
        <button type="button" className={buttonClass} onClick={() => format("italic")}>I</button>
        <button type="button" className={buttonClass} onClick={() => format("insertUnorderedList")}>Danh sách</button>
        <label className={`${buttonClass} cursor-pointer`}>
          Tải ảnh
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(event) => { void onUpload(event.currentTarget.files); event.currentTarget.value = ""; }} />
        </label>
        <button type="button" className={buttonClass} onClick={() => setLibraryOpen(true)}>Thư viện ảnh</button>
      </div>
      <div
        ref={editorRef}
        className="prose-content min-h-40 rounded-b-lg border border-border bg-background px-3 py-2 text-sm outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
      />
      <textarea name={name} value={html} readOnly className="sr-only" aria-hidden="true" />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {libraryOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/50 p-4" onClick={() => setLibraryOpen(false)}>
          <section className="max-h-[85vh] w-full max-w-4xl overflow-auto rounded-2xl border border-border bg-card p-5 shadow-elegant" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold">Thư viện ảnh</h2>
              <button type="button" className={buttonClass} onClick={() => setLibraryOpen(false)}>Đóng</button>
            </div>
            {media.length ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {media.map((asset) => (
                  <button key={asset.url} type="button" onClick={() => insertImage(asset.url)} className="overflow-hidden rounded-xl border border-border text-left hover:border-primary">
                    <span className="flex aspect-[4/3] items-center justify-center bg-secondary"><img src={asset.url} alt={asset.alt || ""} className="max-h-full max-w-full object-contain" /></span>
                    <span className="block truncate px-2 py-1.5 text-xs">{asset.file_name || asset.alt || asset.url}</span>
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
