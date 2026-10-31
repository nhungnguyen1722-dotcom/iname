import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { cache } from "react";
import { asList, sql, parseJson } from "./db";
import { getCurrentAdmin } from "./auth";

export type GalleryImage = {
  url: string;
  alt: string;
  caption?: string;
};

export type SectionItem = Record<string, unknown>;

export type SectionRecord = {
  id: number;
  page_id: number;
  section_key: string;
  section_type: string;
  admin_name: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  button_label: string | null;
  button_url: string | null;
  secondary_button_label: string | null;
  secondary_button_url: string | null;
  items_json: string | null;
  gallery_json: string | null;
  config_json: string | null;
  visible: boolean;
  status: string;
  sort_order: number;
  updated_at: string;
};

export type PublicSection = SectionRecord & {
  items: SectionItem[];
  gallery: GalleryImage[];
  config: Record<string, unknown>;
};

export type PageRecord = {
  id: number;
  slug: string;
  path: string;
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  status: string;
  is_system: boolean;
  updated_at: string;
  section_count?: number;
};

export type NavItem = {
  id: number;
  label: string;
  href: string;
  open_in_new_tab: boolean;
  visible: boolean;
  show_desktop: boolean;
  show_mobile: boolean;
  parent_id: number | null;
  sort_order: number;
};

export type Office = {
  id: string;
  label: string;
  address: string;
  phone: string;
  phoneHref: string;
  mapUrl: string;
};

export type OfficeLocation = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  address: string;
  price_label: string;
  cover_url: string | null;
  cover_alt: string | null;
  banner_url: string | null;
  banner_alt: string | null;
  gallery: GalleryImage[];
  amenities: string[];
  sort_order: number;
};

export type FooterGroup = {
  id: number;
  group_key: string;
  title: string | null;
  body: string | null;
  links_json: string | null;
  visible: boolean;
  sort_order: number;
  links: { label: string; href: string }[];
};

export type ServiceRecord = {
  id: number;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  icon: string | null;
  button_label: string | null;
  button_url: string | null;
  category: string;
  visible: boolean;
  sort_order: number;
};

export type PricingPlan = {
  id: number;
  name: string;
  slug: string;
  category: string;
  summary: string | null;
  price_label: string;
  period: string | null;
  features_json: string;
  highlighted: boolean;
  badge: string | null;
  button_label: string | null;
  button_url: string | null;
  visible: boolean;
  sort_order: number;
  features: string[];
};

export type ArticleCard = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  status: string;
  read_minutes: number | null;
  published_at: string | null;
  content?: string | null;
  category_name: string | null;
  category_slug: string | null;
};

function mapSection(row: SectionRecord): PublicSection {
  return {
    ...row,
    items: parseJson<SectionItem[]>(row.items_json, []),
    gallery: parseJson<GalleryImage[]>(row.gallery_json, []),
    config: parseJson<Record<string, unknown>>(row.config_json, {}),
  };
}

export const getSettings = cache(async () => {
  const rows = await sql<{ key: string; value: string }>("SELECT key, value FROM site_settings");
  const settings: Record<string, string> = {};
  for (const row of rows) settings[row.key] = row.value;
  return settings;
});

export const getNavigation = cache(async (publicOnly = true) => {
  const rows = await sql<NavItem>(
    `SELECT id, label, href, open_in_new_tab, visible, show_desktop, show_mobile, parent_id, sort_order
     FROM navigation_items
     WHERE deleted_at IS NULL
     ORDER BY sort_order, id`,
  );
  return publicOnly ? rows.filter((item) => item.visible) : rows;
});

type ChromeRow = {
  settings: { key: string; value: string }[] | string | null;
  navigation: NavItem[] | string | null;
  footer: Omit<FooterGroup, "links">[] | string | null;
  plans: Omit<PricingPlan, "features">[] | string | null;
  services: ServiceRecord[] | string | null;
};

type PageData = { page: PageRecord; sections: PublicSection[] };

const CONTENT_TAG = "site-content";

export function clearContentCache() {
  revalidateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

async function loadPublicChrome() {
  const rows = await sql<ChromeRow>(`
    SELECT
      (SELECT COALESCE(json_agg(row_to_json(s)), '[]'::json) FROM site_settings s) AS settings,
      (SELECT COALESCE(json_agg(row_to_json(n)), '[]'::json) FROM (
         SELECT id, label, href, open_in_new_tab, visible, show_desktop, show_mobile, parent_id, sort_order
         FROM navigation_items
         WHERE deleted_at IS NULL AND visible = TRUE
         ORDER BY sort_order, id
       ) n) AS navigation,
      (SELECT COALESCE(json_agg(row_to_json(f)), '[]'::json) FROM (
         SELECT id, group_key, title, body, links_json, visible, sort_order
         FROM footer_groups
         ORDER BY sort_order, id
       ) f) AS footer,
      (SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json) FROM (
         SELECT id, name, slug, category, summary, price_label, period, features_json, highlighted, badge,
                button_label, button_url, visible, sort_order
         FROM pricing_plans
         WHERE deleted_at IS NULL AND visible = TRUE
         ORDER BY sort_order, id
       ) p) AS plans,
      (SELECT COALESCE(json_agg(row_to_json(sv)), '[]'::json) FROM (
         SELECT id, name, slug, summary, description, image_url, image_alt,
                CASE category
                  WHEN 'office' THEN CASE sort_order WHEN 1 THEN 'pin' WHEN 2 THEN 'building' WHEN 3 THEN 'monitor' WHEN 4 THEN 'mail' WHEN 5 THEN 'message' ELSE 'file' END
                  WHEN 'accounting' THEN CASE sort_order WHEN 1 THEN 'calculator' WHEN 2 THEN 'receipt' WHEN 3 THEN 'file' WHEN 4 THEN 'search' WHEN 5 THEN 'badge' WHEN 6 THEN 'file' ELSE 'scale' END
                  ELSE 'file'
                END AS icon,
                button_label, button_url, category, visible, sort_order
         FROM services
         WHERE deleted_at IS NULL AND visible = TRUE
         ORDER BY sort_order, id
       ) sv) AS services
  `);
  const row = rows[0];
  const settings: Record<string, string> = {};
  for (const item of asList<{ key: string; value: string }>(row?.settings)) settings[item.key] = item.value;
  const groups = asList<Omit<FooterGroup, "links">>(row?.footer).map((group) => ({
    ...group,
    links: parseJson<{ label: string; href: string }[]>(group.links_json, []),
  }));
  const plans = asList<Omit<PricingPlan, "features">>(row?.plans).map((plan) => ({
    ...plan,
    features: parseJson<string[]>(plan.features_json, []),
  }));
  return {
    settings,
    navigation: asList<NavItem>(row?.navigation),
    groups,
    plans,
    services: asList<ServiceRecord>(row?.services),
  };
}

const cachedPublicChrome = unstable_cache(loadPublicChrome, ["site-public-chrome"], {
  revalidate: 60,
  tags: [CONTENT_TAG],
});

export const getPublicChrome = cache(async () => cachedPublicChrome());

export const getFooterGroups = cache(async () => {
  const rows = await sql<Omit<FooterGroup, "links">>(
    `SELECT id, group_key, title, body, links_json, visible, sort_order
     FROM footer_groups ORDER BY sort_order, id`,
  );
  return rows.map((row) => ({
    ...row,
    links: parseJson<{ label: string; href: string }[]>(row.links_json, []),
  }));
});

export const getServices = cache(async (publicOnly = true) => {
  const rows = await sql<ServiceRecord>(
    `SELECT id, name, slug, summary, description, image_url, image_alt,
            CASE category
              WHEN 'office' THEN CASE sort_order WHEN 1 THEN 'pin' WHEN 2 THEN 'building' WHEN 3 THEN 'monitor' WHEN 4 THEN 'mail' WHEN 5 THEN 'message' ELSE 'file' END
              WHEN 'accounting' THEN CASE sort_order WHEN 1 THEN 'calculator' WHEN 2 THEN 'receipt' WHEN 3 THEN 'file' WHEN 4 THEN 'search' WHEN 5 THEN 'badge' WHEN 6 THEN 'file' ELSE 'scale' END
              ELSE 'file'
            END AS icon,
            button_label, button_url, category, visible, sort_order
     FROM services WHERE deleted_at IS NULL ORDER BY sort_order, id`,
  );
  return publicOnly ? rows.filter((row) => row.visible) : rows;
});

export const getPricingPlans = cache(async (publicOnly = true) => {
  const rows = await sql<Omit<PricingPlan, "features">>(
    `SELECT id, name, slug, category, summary, price_label, period, features_json, highlighted, badge, button_label, button_url, visible, sort_order
     FROM pricing_plans WHERE deleted_at IS NULL ORDER BY sort_order, id`,
  );
  const plans = rows.map((row) => ({
    ...row,
    features: parseJson<string[]>(row.features_json, []),
  }));
  return publicOnly ? plans.filter((row) => row.visible) : plans;
});

type PageBundleRow = PageRecord & { sections: SectionRecord[] | string | null };

async function loadPage(path: string, preview: boolean): Promise<PageData | null> {
  const pages = await sql<PageBundleRow>(
    `SELECT p.id, p.slug, p.path, p.title, p.seo_title, p.seo_description, p.og_image, p.status, p.is_system,
            p.updated_at::text AS updated_at,
            COALESCE((
              SELECT json_agg(row_to_json(s))
              FROM (
                SELECT id, page_id, section_key, section_type, admin_name, eyebrow, title, subtitle, description,
                       image_url, image_alt, button_label, button_url, secondary_button_label, secondary_button_url,
                       items_json, gallery_json, config_json, visible, status, sort_order, updated_at::text AS updated_at
                FROM page_sections
                WHERE page_id = p.id AND deleted_at IS NULL
                ORDER BY sort_order, id
              ) s
            ), '[]'::json) AS sections
     FROM pages p
     WHERE p.path = $1 AND p.deleted_at IS NULL`,
    [path],
  );
  const page = pages[0];
  if (!page) return null;
  if (page.status !== "published" && !preview) return null;
  const sections = asList<SectionRecord>(page.sections)
    .filter((section) => (preview ? true : section.visible && section.status === "published"))
    .map(mapSection);
  return { page, sections };
}

const cachedPublishedPage = unstable_cache(
  async (path: string) => loadPage(path, false),
  ["site-page-published"],
  { revalidate: 60, tags: [CONTENT_TAG] },
);

export const getPageByPath = cache(async (path: string, preview = false) => {
  if (preview) return loadPage(path, true);
  return cachedPublishedPage(path);
});

export const canPreview = cache(async () => Boolean(await getCurrentAdmin()));

export function officesFromSettings(settings: Record<string, string>): Office[] {
  return parseJson<Office[]>(settings.offices, []);
}

async function loadPublicOfficeLocations() {
  const rows = await sql<Omit<OfficeLocation, "gallery" | "amenities"> & {
    gallery_json: string | null;
    amenities_json: string | null;
  }>(
    `SELECT id, title, slug, excerpt, content, address, price_label, cover_url, cover_alt, banner_url, banner_alt,
            gallery_json::text AS gallery_json, amenities_json::text AS amenities_json, sort_order
     FROM office_locations
     WHERE deleted_at IS NULL AND visible = TRUE AND status = 'published'
     ORDER BY sort_order, id`,
  );
  return rows.map((location) => ({
    ...location,
    gallery: parseJson<GalleryImage[]>(location.gallery_json, []),
    amenities: parseJson<string[]>(location.amenities_json, []),
  }));
}

const cachedOfficeLocations = unstable_cache(loadPublicOfficeLocations, ["site-office-locations"], {
  revalidate: 60,
  tags: [CONTENT_TAG],
});

export const getPublicOfficeLocations = cache(async () => cachedOfficeLocations());

export const getOfficeLocationBySlug = cache(async (slug: string, includeHidden = false) => {
  const rows = await sql<Omit<OfficeLocation, "gallery" | "amenities"> & {
    gallery_json: string | null;
    amenities_json: string | null;
  }>(
    `SELECT id, title, slug, excerpt, content, address, price_label, cover_url, cover_alt, banner_url, banner_alt,
            gallery_json::text AS gallery_json, amenities_json::text AS amenities_json, sort_order
     FROM office_locations
     WHERE slug = $1 AND deleted_at IS NULL${includeHidden ? "" : " AND visible = TRUE AND status = 'published'"}
     LIMIT 1`,
    [slug],
  );
  const location = rows[0];
  if (!location) return null;
  return {
    ...location,
    gallery: parseJson<GalleryImage[]>(location.gallery_json, []),
    amenities: parseJson<string[]>(location.amenities_json, []),
  };
});

export const getPublishedArticles = cache(async (filters: {
  q?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}) => {
  const pageSize = filters.pageSize ?? 6;
  const page = Math.max(1, filters.page ?? 1);
  const params: unknown[] = [];
  const where = ["a.deleted_at IS NULL", "a.status = 'published'"];
  if (filters.q) {
    params.push(`%${filters.q}%`);
    where.push(`(a.title ILIKE $${params.length} OR a.excerpt ILIKE $${params.length})`);
  }
  if (filters.category && filters.category !== "all") {
    params.push(filters.category);
    where.push(`c.slug = $${params.length}`);
  }
  const whereSql = where.join(" AND ");
  const listParams = [...params, pageSize, (page - 1) * pageSize];
  const [countRows, items] = await Promise.all([
    sql<{ total: number }>(
      `SELECT COUNT(*)::int AS total
       FROM articles a LEFT JOIN article_categories c ON c.id = a.category_id
       WHERE ${whereSql}`,
      params,
    ),
    sql<ArticleCard>(
      `SELECT a.id, a.title, a.slug, a.excerpt, a.cover_url, a.cover_alt, a.seo_title, a.seo_description,
              a.status, a.read_minutes, a.published_at::text AS published_at, c.name AS category_name, c.slug AS category_slug
       FROM articles a LEFT JOIN article_categories c ON c.id = a.category_id
       WHERE ${whereSql}
       ORDER BY a.published_at DESC NULLS LAST, a.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      listParams,
    ),
  ]);
  const total = Number(countRows[0]?.total ?? 0);
  return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
});

export const getArticleBySlug = cache(async (slug: string, preview = false) => {
  const rows = await sql<ArticleCard>(
    `SELECT a.id, a.title, a.slug, a.excerpt, a.content, a.cover_url, a.cover_alt, a.seo_title, a.seo_description,
            a.status, a.read_minutes, a.published_at::text, c.name AS category_name, c.slug AS category_slug
     FROM articles a LEFT JOIN article_categories c ON c.id = a.category_id
     WHERE a.slug = $1 AND a.deleted_at IS NULL`,
    [slug],
  );
  const article = rows[0];
  if (!article) return null;
  if (article.status !== "published" && !preview) return null;
  return article;
});

const cachedCategories = unstable_cache(
  async () => sql<{ id: number; name: string; slug: string; description: string | null; sort_order: number }>(
    "SELECT id, name, slug, description, sort_order FROM article_categories ORDER BY sort_order, id",
  ),
  ["site-categories"],
  { revalidate: 60, tags: [CONTENT_TAG] },
);

export const getCategories = cache(async () => cachedCategories());

export const getRelatedArticles = cache(async (slug: string, categorySlug: string | null) => {
  return sql<ArticleCard>(
    `SELECT a.id, a.title, a.slug, a.excerpt, a.cover_url, a.cover_alt, a.seo_title, a.seo_description,
            a.status, a.read_minutes, a.published_at::text, c.name AS category_name, c.slug AS category_slug
     FROM articles a LEFT JOIN article_categories c ON c.id = a.category_id
     WHERE a.deleted_at IS NULL AND a.status = 'published' AND a.slug <> $1
       AND ($2::text IS NULL OR c.slug = $2)
     ORDER BY a.published_at DESC NULLS LAST
     LIMIT 3`,
    [slug, categorySlug],
  );
});

const cachedPopularArticles = unstable_cache(
  async () => sql<ArticleCard>(
    `SELECT a.id, a.title, a.slug, a.excerpt, a.cover_url, a.cover_alt, a.seo_title, a.seo_description,
            a.status, a.read_minutes, a.published_at::text, c.name AS category_name, c.slug AS category_slug
     FROM articles a LEFT JOIN article_categories c ON c.id = a.category_id
     WHERE a.deleted_at IS NULL AND a.status = 'published'
     ORDER BY a.published_at DESC NULLS LAST, a.id DESC
     LIMIT 5`,
  ),
  ["site-popular-articles"],
  { revalidate: 60, tags: [CONTENT_TAG] },
);

export const getPopularArticles = cache(async () => cachedPopularArticles());

export const getMediaAssets = cache(async () => sql<{ url: string; alt: string | null; file_name: string | null }>(
  "SELECT url, alt, file_name FROM media_assets ORDER BY created_at DESC, id DESC LIMIT 120",
));
