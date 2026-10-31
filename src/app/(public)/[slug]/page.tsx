import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getPageByPath } from "@/lib/content";
import { renderContentPage } from "@/components/site/render-page";

export const revalidate = 60;

const paths = new Set(["/van-phong-ao", "/ke-toan", "/bang-gia", "/bang-gia-cu", "/giai-phap-cong-nghe", "/lien-he", "/trang-chu-cu"]);

export function generateStaticParams() {
  return [...paths].map((path) => ({ slug: path.slice(1) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "kien-thuc") redirect("/tin-tuc");
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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "kien-thuc") redirect("/tin-tuc");
  const path = `/${slug}`;
  if (!paths.has(path)) notFound();
  return renderContentPage(path, false);
}
