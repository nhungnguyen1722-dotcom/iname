import { Notice, buttonClass, inputClass } from "@/components/admin/AdminShell";
import { CmsImage } from "@/components/site/CmsImage";
import { saveLogo } from "@/server/admin";
import { getSettings } from "@/lib/content";

export default async function LogoAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const query = await searchParams;
  const settings = await getSettings();
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Logo</h1>
      <Notice saved={query.saved} error={query.error} />
      <form action={saveLogo} className="mt-6 max-w-xl space-y-4 rounded-xl border border-border bg-card p-5">
        {settings.logo_url ? <span className="relative block h-20 w-40"><CmsImage src={settings.logo_url} alt={settings.logo_alt || ""} className="object-contain" sizes="160px" /></span> : <p className="text-sm text-muted-foreground">Đang dùng biểu tượng mặc định kèm tên thương hiệu.</p>}
        <label className="block text-sm font-semibold">Tải logo mới<input name="file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className={inputClass} /></label>
        <label className="block text-sm font-semibold">Hoặc URL HTTPS<input name="logo_url" defaultValue={settings.logo_url || ""} className={inputClass} /></label>
        <label className="block text-sm font-semibold">Văn bản thay thế<input name="logo_alt" defaultValue={settings.logo_alt || ""} className={inputClass} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="clear" /> Ngừng dùng logo ảnh, quay lại biểu tượng</label>
        <button className={buttonClass} type="submit">Lưu logo</button>
      </form>
    </div>
  );
}
