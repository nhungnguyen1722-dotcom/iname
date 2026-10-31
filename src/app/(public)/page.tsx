import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageSections } from "@/components/site/PageSections";
import { getPageByPath, getPublicChrome, officesFromSettings } from "@/lib/content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPageByPath("/", false);
  if (!data) return { title: "Trang chủ" };
  return {
    title: data.page.seo_title || data.page.title,
    description: data.page.seo_description || undefined,
    alternates: { canonical: "/" },
    openGraph: {
      title: data.page.seo_title || data.page.title,
      description: data.page.seo_description || undefined,
      images: data.page.og_image ? [data.page.og_image] : undefined,
    },
  };
}

export default async function HomePage() {
  const [chrome, data] = await Promise.all([
    getPublicChrome(),
    getPageByPath("/", false),
  ]);
  if (!data || data.page.status !== "published") notFound();
  const sections = data.sections.filter((section) => section.visible && section.status === "published");
  return (
    <PageSections
      sections={sections}
      services={chrome.services}
      plans={chrome.plans}
      settings={chrome.settings}
      offices={officesFromSettings(chrome.settings)}
      officeLocations={[]}
      path="/"
    />
  );
}
