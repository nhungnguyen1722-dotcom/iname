import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div><h1 className="font-display text-3xl font-extrabold">{id === "new" ? "Tạo bài viết" : "Sửa bài viết"}</h1><ArticleForm id={id} /></div>;
}
