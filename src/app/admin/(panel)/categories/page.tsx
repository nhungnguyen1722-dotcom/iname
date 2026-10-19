import { Notice, buttonClass, inputClass } from "@/components/admin/AdminShell";
import { deleteArticleCategory, saveArticleCategory } from "@/server/admin";
import { getCategories } from "@/lib/content";

export default async function ArticleCategories({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [query, categories] = await Promise.all([searchParams, getCategories()]);
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">Chuyên mục tin tức</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Quản lý tên, đường dẫn và mô tả các chuyên mục. Bài viết có thể được gán vào chuyên mục từ màn hình chỉnh sửa bài viết.</p>
      <Notice saved={query.saved} error={query.error} />
      <form action={saveArticleCategory} className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-5 md:grid-cols-2">
        <h2 className="font-display text-lg font-bold md:col-span-2">Tạo chuyên mục</h2>
        <input name="name" required className={inputClass} placeholder="Tên chuyên mục" />
        <input name="slug" className={inputClass} placeholder="Slug (tự tạo nếu để trống)" />
        <textarea name="description" className={`${inputClass} md:col-span-2`} rows={2} placeholder="Mô tả chuyên mục" />
        <input name="sortOrder" type="number" defaultValue={categories.length + 1} className={inputClass} aria-label="Thứ tự" />
        <button className={buttonClass}>Thêm chuyên mục</button>
      </form>
      <div className="mt-6 space-y-3">
        {categories.map((category) => (
          <form key={category.id} action={saveArticleCategory} className="grid gap-3 rounded-xl border border-border bg-card p-5 md:grid-cols-2">
            <input type="hidden" name="id" value={category.id} />
            <input name="name" required defaultValue={category.name} className={inputClass} />
            <input name="slug" defaultValue={category.slug} className={inputClass} />
            <textarea name="description" defaultValue={category.description || ""} className={`${inputClass} md:col-span-2`} rows={2} />
            <input name="sortOrder" type="number" defaultValue={category.sort_order} className={inputClass} aria-label="Thứ tự" />
            <div className="flex gap-2"><button className={buttonClass}>Lưu</button><button formAction={deleteArticleCategory} className="text-sm font-semibold text-destructive">Xóa chuyên mục</button></div>
          </form>
        ))}
      </div>
    </div>
  );
}
