import { Notice, buttonClass, inputClass } from "@/components/admin/AdminShell";
import { saveFooter, saveSettingsForm } from "@/server/admin";
import { getFooterGroups, getSettings, officesFromSettings } from "@/lib/content";

export default async function FooterAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const query = await searchParams;
  const [groups, settings] = await Promise.all([getFooterGroups(), getSettings()]);
  const offices = officesFromSettings(settings);
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-extrabold">Footer</h1>
      <Notice saved={query.saved} error={query.error} />
      <form action={saveSettingsForm} className="max-w-3xl space-y-3 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-xl font-bold">Thông tin dùng chung</h2>
        <input type="hidden" name="returnTo" value="/admin/footer" />
        <input type="hidden" name="office_count" value={offices.length} />
        <label className="block text-sm font-semibold">Mô tả<textarea name="footer_description" defaultValue={settings.footer_description || ""} className={inputClass} rows={3} /></label>
        <label className="block text-sm font-semibold">Bản quyền<input name="copyright" defaultValue={settings.copyright || ""} className={inputClass} /></label>
        <label className="block text-sm font-semibold">Dòng pháp lý<input name="legal_note" defaultValue={settings.legal_note || ""} className={inputClass} /></label>
        {offices.map((office, index) => (
          <div key={office.id} className="grid gap-2 rounded-lg bg-secondary/50 p-3">
            <input type="hidden" name={`office_id_${index}`} value={office.id} />
            <input name={`office_label_${index}`} defaultValue={office.label} className={inputClass} />
            <textarea name={`office_address_${index}`} defaultValue={office.address} className={inputClass} />
            <input name={`office_phone_${index}`} defaultValue={office.phone} className={inputClass} />
            <input name={`office_phone_href_${index}`} defaultValue={office.phoneHref} className={inputClass} />
            <input name={`office_map_${index}`} defaultValue={office.mapUrl} className={inputClass} />
          </div>
        ))}
        <button className={buttonClass}>Lưu thông tin</button>
      </form>
      <form action={saveFooter} className="max-w-3xl space-y-4">
        <input type="hidden" name="count" value={groups.length} />
        {groups.map((group, index) => (
          <div key={group.id} className="space-y-2 rounded-xl border border-border bg-card p-4">
            <input type="hidden" name={`id_${index}`} value={group.id} />
            <input name={`title_${index}`} defaultValue={group.title || ""} className={inputClass} />
            <textarea name={`body_${index}`} defaultValue={group.body || ""} className={inputClass} rows={3} />
            <textarea name={`links_${index}`} defaultValue={group.links.map((link) => `${link.label} | ${link.href}`).join("\n")} className={inputClass} rows={5} placeholder="Nhãn | /duong-dan" />
            <label className="text-sm"><input type="checkbox" name={`visible_${index}`} defaultChecked={group.visible} /> Hiện nhóm</label>
          </div>
        ))}
        <button className={buttonClass}>Lưu nhóm Footer</button>
      </form>
    </div>
  );
}
