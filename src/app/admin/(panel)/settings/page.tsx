import { Notice, buttonClass, inputClass } from "@/components/admin/AdminShell";
import { saveSettingsForm } from "@/server/admin";
import { getSettings, officesFromSettings } from "@/lib/content";

export default async function SettingsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const query = await searchParams;
  const settings = await getSettings();
  const offices = officesFromSettings(settings);
  const fields = ["brand_name", "brand_tagline", "company_name", "company_address", "hotline", "hotline_href", "email", "email_href", "zalo_label", "zalo_url", "sticky_phone_label", "sticky_phone_href", "sticky_zalo_url", "sticky_messenger_url", "sticky_facebook_url", "tax_code", "hours_summary", "hours_saturday_summary", "not_found_title", "not_found_description"];
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Thiết lập website</h1>
      <Notice saved={query.saved} error={query.error} />
      <form action={saveSettingsForm} className="mt-6 max-w-2xl space-y-3 rounded-xl border border-border bg-card p-5">
        <input type="hidden" name="returnTo" value="/admin/settings" />
        <input type="hidden" name="office_count" value={offices.length} />
        {fields.map((field) => (
          <label key={field} className="block text-sm font-semibold">{field}
            <input name={field} defaultValue={settings[field] || ""} className={inputClass} />
          </label>
        ))}
        <fieldset className="space-y-3 rounded-lg border border-border p-4">
          <legend className="px-2 text-sm font-bold">Widget liên hệ nổi</legend>
          {["sticky_contacts_visible", "sticky_phone_visible", "sticky_zalo_visible", "sticky_messenger_visible", "sticky_facebook_visible"].map((flag) => (
            <label key={flag} className="flex items-center gap-2 text-sm"><input type="checkbox" name={flag} defaultChecked={settings[flag] !== "false" && (flag === "sticky_messenger_visible" || flag === "sticky_facebook_visible" ? settings[flag] === "true" : true)} />{flag}</label>
          ))}
        </fieldset>
        {offices.map((office, index) => (
          <div key={office.id} className="grid gap-2 rounded-lg bg-secondary/40 p-3">
            <input type="hidden" name={`office_id_${index}`} value={office.id} />
            <input name={`office_label_${index}`} defaultValue={office.label} className={inputClass} />
            <textarea name={`office_address_${index}`} defaultValue={office.address} className={inputClass} />
            <input name={`office_phone_${index}`} defaultValue={office.phone} className={inputClass} />
            <input name={`office_phone_href_${index}`} defaultValue={office.phoneHref} className={inputClass} />
            <input name={`office_map_${index}`} defaultValue={office.mapUrl} className={inputClass} />
          </div>
        ))}
        <button className={buttonClass}>Lưu thiết lập</button>
      </form>
    </div>
  );
}
