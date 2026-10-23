import { sql } from "./db";

export type AdminPage = {
  id: number;
  slug: string;
  path: string;
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  is_system: boolean;
};

export async function findAdminPage(key: string) {
  const rows = await sql<AdminPage>(
    `SELECT id, slug, path, title, seo_title, seo_description, og_image, is_system
     FROM pages
     WHERE deleted_at IS NULL
       AND (slug = $1 OR id = CASE WHEN $1 ~ '^[0-9]+$' THEN $1::int ELSE NULL END)
     LIMIT 1`,
    [key],
  );
  return rows[0] || null;
}
