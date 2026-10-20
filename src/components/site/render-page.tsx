import { notFound } from "next/navigation";
import { PageSections } from "@/components/site/PageSections";
import {
  canPreview,
  getCategories,
  getPageByPath,
  getPopularArticles,
  getPublicChrome,
  getPublicOfficeLocations,
  getPublishedArticles,
  officesFromSettings,
} from "@/lib/content";

export async function renderContentPage(path: string, previewRequested: boolean, extra?: {
  q?: string;
  category?: string;
  page?: string;
}) {
  const articleQuery = path === "/tin-tuc"
    ? getPublishedArticles({
        q: extra?.q,
        category: extra?.category,
        page: Number(extra?.page || 1),
      })
    : Promise.resolve(undefined);
  const [preview, chrome, categories, popularArticles, articles, officeLocations] = await Promise.all([
    previewRequested ? canPreview() : Promise.resolve(false),
    getPublicChrome(),
    path === "/tin-tuc" ? getCategories() : Promise.resolve([]),
    path === "/tin-tuc" ? getPopularArticles() : Promise.resolve([]),
    articleQuery,
    path === "/van-phong-ao" ? getPublicOfficeLocations() : Promise.resolve([]),
  ]);
  const data = await getPageByPath(path, preview)
    || (path === "/tin-tuc" ? await getPageByPath("/kien-thuc", preview) : null);
  if (!data) notFound();
  return (
    <PageSections
      sections={data.sections}
      services={chrome.services}
      plans={chrome.plans}
      settings={chrome.settings}
      offices={officesFromSettings(chrome.settings)}
      officeLocations={officeLocations}
      path={path}
      articles={articles}
      categories={categories}
      popularArticles={popularArticles}
      query={{ q: extra?.q, category: extra?.category }}
    />
  );
}
