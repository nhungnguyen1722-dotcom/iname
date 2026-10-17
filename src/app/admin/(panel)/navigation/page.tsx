import { Notice, buttonClass, inputClass, secondaryButtonClass } from "@/components/admin/AdminShell";
import { saveNavigation } from "@/server/admin";
import { getNavigation } from "@/lib/content";

export default async function NavigationAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const query = await searchParams;
  const items = await getNavigation(false);
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Main Menu</h1>
      <Notice saved={query.saved} error={query.error} />
      <form action={saveNavigation} className="mt-6 space-y-4">
        <input type="hidden" name="count" value={items.length} />
        {items.map((item, index) => (
          <div key={item.id} className="grid gap-2 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
            <input type="hidden" name={`id_${index}`} value={item.id} />
            <input name={`label_${index}`} defaultValue={item.label} className={inputClass} />
            <input name={`href_${index}`} defaultValue={item.href} className={inputClass} />
            <label className="text-sm"><input type="checkbox" name={`visible_${index}`} defaultChecked={item.visible} /> Hiện</label>
            <label className="text-sm"><input type="checkbox" name={`desktop_${index}`} defaultChecked={item.show_desktop} /> Desktop</label>
            <label className="text-sm"><input type="checkbox" name={`mobile_${index}`} defaultChecked={item.show_mobile} /> Mobile</label>
            <label className="text-sm"><input type="checkbox" name={`new_${index}`} defaultChecked={item.open_in_new_tab} /> Tab mới</label>
            <div className="flex gap-2">
              <button className={secondaryButtonClass} name="intent" value={`move:${index}:-1`}>Lên</button>
              <button className={secondaryButtonClass} name="intent" value={`move:${index}:1`}>Xuống</button>
              <button className={secondaryButtonClass} name="intent" value={`remove:${index}`}>Ẩn mục</button>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <button className={buttonClass} name="intent" value="save">Lưu menu</button>
          <button className={secondaryButtonClass} name="intent" value="add">Thêm mục</button>
        </div>
      </form>
    </div>
  );
}
