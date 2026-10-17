import { notFound } from "next/navigation";
import { PageSections } from "@/components/site/PageSections";
import {
  canPreview,
  getCategories,
  getPageByPath,
  getPublicChrome,
  getPublishedArticles,
  officesFromSettings,
} from "@/lib/content";

export async function renderContentPage(path: string, previewRequested: boolean, extra?: {
  q?: string;
  category?: string;
  page?: string;
}) {
  const articleQuery = path === "/kien-thuc"
    ? getPublishedArticles({
        q: extra?.q,
        category: extra?.category,
        page: Number(extra?.page || 1),
      })
    : Promise.resolve(undefined);
  const [preview, chrome, categories, articles] = await Promise.all([
    previewRequested ? canPreview() : Promise.resolve(false),
    getPublicChrome(),
    path === "/kien-thuc" ? getCategories() : Promise.resolve([]),
    articleQuery,
  ]);
  const data = await getPageByPath(path, preview);
  if (!data) notFound();
  return (
    <PageSections
      sections={data.sections}
      services={chrome.services}
      plans={chrome.plans}
      settings={chrome.settings}
      offices={officesFromSettings(chrome.settings)}
      articles={articles}
      categories={categories}
      query={{ q: extra?.q, category: extra?.category }}
    />
  );
}
