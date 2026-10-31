import type { Metadata } from "next";
import { renderAccountingArticle } from "@/components/site/article-renderers";
import { getArticleBySlug } from "@/lib/content";
import { sql } from "@/lib/db";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const rows = await sql<{ slug: string }>(
      "SELECT slug FROM articles WHERE deleted_at IS NULL AND status = 'published'",
    );
    return rows.map((row) => ({ slug: row.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, false);
  if (!article) return { title: "Không tìm thấy dịch vụ kế toán" };
  return {
    title: `${article.seo_title || article.title} | Dịch Vụ Kế Toán iName`,
    description: article.seo_description || article.excerpt || undefined,
    alternates: { canonical: `/ke-toan/${article.slug}` },
    robots: article.status === "published" ? undefined : { index: false, follow: false },
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt || undefined,
      images: article.cover_url ? [article.cover_url] : undefined,
    },
  };
}

export default async function AccountingArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderAccountingArticle(slug, false);
}
