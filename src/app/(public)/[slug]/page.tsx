import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageByPath } from "@/lib/content";
import { renderContentPage } from "@/components/site/render-page";

const paths = new Set(["/van-phong-ao", "/ke-toan", "/bang-gia", "/kien-thuc", "/lien-he"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = `/${slug}`;
  const data = await getPageByPath(path, false);
  if (!data) return { title: "Không tìm thấy trang" };
  return {
    title: data.page.seo_title || data.page.title,
    description: data.page.seo_description || undefined,
    alternates: { canonical: path },
    openGraph: {
      title: data.page.seo_title || data.page.title,
      description: data.page.seo_description || undefined,
    },
  };
}

export default async function ContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string; q?: string; category?: string; page?: string }>;
}) {
  const { slug } = await params;
  const path = `/${slug}`;
  if (!paths.has(path)) notFound();
  const query = await searchParams;
  return renderContentPage(path, query.preview === "1", query);
}
