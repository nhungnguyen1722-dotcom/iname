import type { MetadataRoute } from "next";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pages = await sql<{ path: string; updated_at: string }>(
    "SELECT path, updated_at::text FROM pages WHERE deleted_at IS NULL AND status = 'published'",
  );
  const articles = await sql<{ slug: string; updated_at: string }>(
    "SELECT slug, updated_at::text FROM articles WHERE deleted_at IS NULL AND status = 'published'",
  );
  return [
    ...pages.map((page) => ({
      url: `${base}${page.path === "/" ? "" : page.path}`,
      lastModified: page.updated_at,
    })),
    ...articles.map((article) => ({
      url: `${base}/tin-tuc/${article.slug}`,
      lastModified: article.updated_at,
    })),
  ];
}
