import { Notice, buttonClass } from "@/components/admin/AdminShell";
import { ImageField } from "@/components/admin/ImageField";
import { saveLogo } from "@/server/admin";
import { getMediaAssets, getSettings } from "@/lib/content";

export default async function LogoAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const query = await searchParams;
  const [settings, media] = await Promise.all([getSettings(), getMediaAssets()]);
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Logo</h1>
      <Notice saved={query.saved} error={query.error} />
      <form action={saveLogo} className="mt-6 max-w-xl space-y-4 rounded-xl border border-border bg-card p-5">
        {settings.logo_url ? null : <p className="text-sm text-muted-foreground">Chọn ảnh tải lên hoặc ảnh có sẵn trong thư viện.</p>}
        <ImageField name="logo_url" uploadName="file" value={settings.logo_url || ""} media={media} label="Biểu tượng logo" />
        <label className="block text-sm font-semibold">Văn bản thay thế<input name="logo_alt" defaultValue={settings.logo_alt || "Iname"} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="clear" /> Ngừng dùng logo ảnh, quay lại biểu tượng</label>
        <button className={buttonClass} type="submit">Lưu logo</button>
      </form>
    </div>
  );
}
