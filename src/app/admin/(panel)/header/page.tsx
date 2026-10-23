import { Notice, buttonClass, inputClass } from "@/components/admin/AdminShell";
import { saveSettingsForm } from "@/server/admin";
import { getSettings } from "@/lib/content";

export default async function HeaderAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const query = await searchParams;
  const settings = await getSettings();
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Header</h1>
      <Notice saved={query.saved} error={query.error} />
      <form action={saveSettingsForm} className="mt-6 max-w-2xl space-y-4 rounded-xl border border-border bg-card p-5">
        <input type="hidden" name="returnTo" value="/admin/header" />
        <input type="hidden" name="flags" value="1" />
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="header_visible" defaultChecked={settings.header_visible !== "false"} /> Hiện header</label>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="topbar_visible" defaultChecked={settings.topbar_visible !== "false"} /> Hiện thanh thông tin</label>
        <label className="block text-sm font-semibold">Nhãn nút<input name="header_cta_label" defaultValue={settings.header_cta_label || ""} className={inputClass} /></label>
        <label className="block text-sm font-semibold">URL nút<input name="header_cta_url" defaultValue={settings.header_cta_url || "#tu-van"} className={inputClass} /></label>
        <label className="block text-sm font-semibold">Hotline<input name="hotline" defaultValue={settings.hotline || ""} className={inputClass} /></label>
        <label className="block text-sm font-semibold">Liên kết gọi<input name="hotline_href" defaultValue={settings.hotline_href || ""} className={inputClass} /></label>
        <button className={buttonClass} type="submit">Lưu header</button>
      </form>
    </div>
  );
}
