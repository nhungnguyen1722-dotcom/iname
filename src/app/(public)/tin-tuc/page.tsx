import type { Metadata } from "next";
import { getPageByPath } from "@/lib/content";
import { renderContentPage } from "@/components/site/render-page";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPageByPath("/tin-tuc", false) || await getPageByPath("/kien-thuc", false);
  if (!data) return { title: "Tin tức" };
  return {
    title: data.page.seo_title || data.page.title,
    description: data.page.seo_description || undefined,
    alternates: { canonical: "/tin-tuc" },
    openGraph: {
      title: data.page.seo_title || data.page.title,
      description: data.page.seo_description || undefined,
    },
  };
}

export default function NewsPage() {
  return renderContentPage("/tin-tuc", false);
}
