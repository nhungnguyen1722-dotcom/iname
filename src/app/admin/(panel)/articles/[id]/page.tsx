import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function EditArticle({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string; from?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const returnTo = query.from === "accounting" || query.category ? "/admin/accounting-articles" : "";
  return <div><h1 className="font-display text-3xl font-extrabold">{id === "new" ? "Tạo bài viết" : "Sửa bài viết"}</h1><ArticleForm id={id} initialCategoryId={query.category} returnTo={returnTo} /></div>;
}
