import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageSections } from "@/components/site/PageSections";
import { canPreview, getPageByPath, getPublicChrome, officesFromSettings } from "@/lib/content";

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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const query = await searchParams;
  const preview = query.preview === "1" ? await canPreview() : false;
  const [chrome, data] = await Promise.all([
    getPublicChrome(),
    getPageByPath("/", preview),
  ]);
  if (!data || (data.page.status !== "published" && !preview)) notFound();
  const sections = preview
    ? data.sections
    : data.sections.filter((section) => section.visible && section.status === "published");
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
