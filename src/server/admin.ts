"use server";

import { randomBytes } from "crypto";
import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseJson, sql } from "@/lib/db";
import { clearContentCache } from "@/lib/content";
import { requireAdmin } from "@/lib/auth";
import { createSessionToken } from "@/lib/session";
import { SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import { safeHref, safeImageUrl, sanitizeRichText, slugify } from "@/lib/sanitize";

function refresh() {
  clearContentCache();
  revalidatePath("/", "layout");
}

async function audit(userId: number, action: string, entity: string, entityId: string, detail = "") {
  await sql(
    "INSERT INTO audit_logs (admin_user_id, action, entity, entity_id, detail) VALUES ($1,$2,$3,$4,$5)",
    [userId, action, entity, entityId, detail.slice(0, 500)],
  );
}

function text(formData: FormData, key: string, max = 4000) {
  return String(formData.get(key) || "").trim().slice(0, max);
}

export async function loginAdmin(_prev: { error: string }, formData: FormData) {
  const email = text(formData, "email", 255).toLowerCase();
  const password = String(formData.get("password") || "");
  const next = text(formData, "next", 180);
  const rows = await sql<{ id: number; password_hash: string; role: string }>(
    "SELECT id, password_hash, role FROM admin_users WHERE email = $1",
    [email],
  );
  const user = rows[0];
  if (!user || user.role !== "admin" || !(await bcrypt.compare(password, user.password_hash))) {
    return { error: "Email hoặc mật khẩu không đúng." };
  }
  const token = await createSessionToken(user.id, user.role);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function savePage(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id"));
  const title = text(formData, "title", 255);
  const seoTitle = text(formData, "seoTitle", 255);
  const seoDescription = text(formData, "seoDescription", 500);
  const ogImage = safeImageUrl(text(formData, "ogImage", 1000));
  if (!title) redirect(`/admin/pages/${id}?error=` + encodeURIComponent("Tên trang không được để trống."));
  const pages = await sql<{ is_system: boolean }>("SELECT is_system FROM pages WHERE id = $1 AND deleted_at IS NULL", [id]);
  if (!pages[0]) redirect("/admin/pages?error=" + encodeURIComponent("Không tìm thấy trang."));
  await sql(
    `UPDATE pages SET title = $1, seo_title = $2, seo_description = $3, og_image = $4, updated_at = NOW()
     WHERE id = $5`,
    [title, seoTitle || null, seoDescription || null, ogImage || null, id],
  );
  await audit(user.id, "update", "page", String(id), title);
  refresh();
  redirect(`/admin/pages/${id}?saved=1`);
}

function readItems(type: string, formData: FormData) {
  const count = Number(formData.get("item_count") || 0);
  const items: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    if (type === "faq") items.push({ question: text(formData, `item_question_${i}`, 500), answer: text(formData, `item_answer_${i}`) });
    else if (type === "team") items.push({ name: text(formData, `item_name_${i}`, 255), role: text(formData, `item_role_${i}`, 255), credential: text(formData, `item_credential_${i}`), initials: text(formData, `item_initials_${i}`, 8) });
    else if (type === "testimonials") items.push({ quote: text(formData, `item_quote_${i}`), author: text(formData, `item_author_${i}`, 255), company: text(formData, `item_company_${i}`, 255), avatar: text(formData, `item_avatar_${i}`, 8), rating: Math.min(5, Math.max(1, Number(formData.get(`item_rating_${i}`) || 5))) });
    else if (type === "stats") items.push({ value: text(formData, `item_value_${i}`, 80), label: text(formData, `item_label_${i}`, 255) });
    else if (type === "addons") items.push({ name: text(formData, `item_name_${i}`, 255), price: text(formData, `item_price_${i}`, 80) });
    else if (type === "notes" || type === "hero" || type === "page-hero") items.push({ label: text(formData, `item_label_${i}`, 255), text: text(formData, `item_text_${i}`) });
    else if (type === "comparison") items.push({ label: text(formData, `item_label_${i}`, 255), values: [0, 1, 2].map((col) => text(formData, `item_value_${i}_${col}`, 255)) });
    else if (type === "pillars") items.push({ title: text(formData, `item_title_${i}`, 255), description: text(formData, `item_description_${i}`), href: safeHref(text(formData, `item_href_${i}`, 500)), cta: text(formData, `item_cta_${i}`, 80), icon: text(formData, `item_icon_${i}`, 64), points: text(formData, `item_points_${i}`).split("\n").map((line) => line.trim()).filter(Boolean) });
    else items.push({ title: text(formData, `item_title_${i}`, 255), description: text(formData, `item_description_${i}`), href: safeHref(text(formData, `item_href_${i}`, 500)), cta: text(formData, `item_cta_${i}`, 80), icon: text(formData, `item_icon_${i}`, 64) });
  }
  return items;
}

function blankItem(type: string) {
  if (type === "faq") return { question: "", answer: "" };
  if (type === "team") return { name: "", role: "", credential: "", initials: "" };
  if (type === "testimonials") return { quote: "", author: "", company: "", avatar: "", rating: 5 };
  if (type === "comparison") return { label: "", values: ["", "", ""] };
  if (type === "stats") return { value: "", label: "" };
  if (type === "addons") return { name: "", price: "" };
  if (type === "notes" || type === "hero" || type === "page-hero") return { label: "", text: "" };
  if (type === "pillars") return { title: "", description: "", href: "", cta: "", icon: "building", points: [] };
  return { title: "", description: "", href: "", cta: "", icon: "building" };
}

async function readGallery(formData: FormData) {
  const count = Number(formData.get("gallery_count") || 0);
  const images: { url: string; alt: string; caption: string }[] = [];
  for (let i = 0; i < count; i++) {
    const alt = text(formData, `gallery_alt_${i}`, 300);
    const uploaded = await uploadImageAsset(formData.get(`gallery_file_${i}`), alt);
    const raw = text(formData, `gallery_url_${i}`, 1000);
    const url = uploaded || (raw ? safeImageUrl(raw) : "");
    if (raw && !url) throw new Error("URL ảnh không hợp lệ. Chỉ dùng đường dẫn nội bộ hoặc HTTPS.");
    images.push({ url, alt, caption: text(formData, `gallery_caption_${i}`, 300) });
  }
  return images;
}

export async function saveSection(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id"));
  const rows = await sql<{ id: number; page_id: number; section_type: string; config_json: string | null }>(
    "SELECT id, page_id, section_type, config_json FROM page_sections WHERE id = $1 AND deleted_at IS NULL",
    [id],
  );
  const current = rows[0];
  if (!current) redirect("/admin/pages?error=" + encodeURIComponent("Không tìm thấy Section."));
  const intent = text(formData, "intent", 80) || "save";
  let items = readItems(current.section_type, formData);
  let gallery: { url: string; alt: string; caption: string }[] = [];
  try {
    gallery = await readGallery(formData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ảnh không hợp lệ.";
    redirect(`/admin/pages/${current.page_id}/sections/${id}?error=` + encodeURIComponent(message));
  }
  if (intent === "add-item") items.push(blankItem(current.section_type));
  if (intent.startsWith("remove-item:")) items.splice(Number(intent.split(":")[1]), 1);
  if (intent.startsWith("move-item:")) {
    const [, indexText, directionText] = intent.split(":");
    const index = Number(indexText);
    const target = index + Number(directionText);
    if (items[index] && items[target]) {
      const copy = items[index];
      items[index] = items[target];
      items[target] = copy;
    }
  }
  if (intent === "add-gallery") {
    const alt = text(formData, "new_gallery_alt", 300);
    let uploaded = "";
    try {
      uploaded = await uploadImageAsset(formData.get("new_gallery_file"), alt);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ảnh không hợp lệ.";
      redirect(`/admin/pages/${current.page_id}/sections/${id}?error=` + encodeURIComponent(message));
    }
    const raw = text(formData, "new_gallery_url", 1000);
    const url = uploaded || (raw ? safeImageUrl(raw) : "");
    if (!url) redirect(`/admin/pages/${current.page_id}/sections/${id}?error=` + encodeURIComponent("URL ảnh mới không hợp lệ."));
    gallery.push({ url, alt, caption: text(formData, "new_gallery_caption", 300) });
  }
  if (intent.startsWith("remove-gallery:")) gallery.splice(Number(intent.split(":")[1]), 1);
  if (intent.startsWith("move-gallery:")) {
    const [, indexText, directionText] = intent.split(":");
    const index = Number(indexText);
    const target = index + Number(directionText);
    if (gallery[index] && gallery[target]) {
      const copy = gallery[index];
      gallery[index] = gallery[target];
      gallery[target] = copy;
    }
  }
  const rawImage = text(formData, "imageUrl", 1000);
  let uploadedImage = "";
  try {
    uploadedImage = await uploadImageAsset(formData.get("image_file"), text(formData, "imageAlt", 300));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ảnh không hợp lệ.";
    redirect(`/admin/pages/${current.page_id}/sections/${id}?error=` + encodeURIComponent(message));
  }
  const imageUrl = uploadedImage || (rawImage ? safeImageUrl(rawImage) : "");
  if (rawImage && !imageUrl) {
    redirect(`/admin/pages/${current.page_id}/sections/${id}?error=` + encodeURIComponent("URL ảnh chính không hợp lệ."));
  }
  const status = intent === "draft" ? "draft" : intent === "publish" ? "published" : (text(formData, "status", 32) === "draft" ? "draft" : "published");
  const visible = intent === "hide" ? false : intent === "show" || intent === "publish" ? true : formData.get("visible") === "on";
  const config = parseJson<Record<string, unknown>>(current.config_json, {});
  if (formData.has("configIcon")) config.icon = text(formData, "configIcon", 64);
  if (formData.has("officeSubtitle")) config.officeSubtitle = text(formData, "officeSubtitle");
  if (formData.has("accountingSubtitle")) config.accountingSubtitle = text(formData, "accountingSubtitle");
  await sql(
    `UPDATE page_sections SET
      admin_name = $1, eyebrow = $2, title = $3, subtitle = $4, description = $5,
      image_url = $6, image_alt = $7, button_label = $8, button_url = $9,
      secondary_button_label = $10, secondary_button_url = $11,
      items_json = $12, gallery_json = $13, config_json = $14, visible = $15, status = $16, updated_at = NOW()
     WHERE id = $17`,
    [
      text(formData, "adminName", 255) || "Section",
      text(formData, "eyebrow", 255) || null,
      text(formData, "title") || null,
      text(formData, "subtitle") || null,
      text(formData, "description") || null,
      imageUrl || null,
      text(formData, "imageAlt", 300) || null,
      text(formData, "buttonLabel", 120) || null,
      safeHref(text(formData, "buttonUrl", 500)) || null,
      text(formData, "secondaryButtonLabel", 120) || null,
      safeHref(text(formData, "secondaryButtonUrl", 500)) || null,
      JSON.stringify(items),
      JSON.stringify(gallery.filter((image) => image.url)),
      JSON.stringify(config),
      visible,
      status,
      id,
    ],
  );
  await audit(user.id, intent, "section", String(id));
  refresh();
  redirect(`/admin/pages/${current.page_id}/sections/${id}?saved=1`);
}

export async function createSection(formData: FormData) {
  const user = await requireAdmin();
  const pageId = Number(formData.get("pageId"));
  const type = text(formData, "sectionType", 64);
  const allowed = ["hero", "page-hero", "pillars", "cards", "steps", "pricing", "team", "testimonials", "faq", "cta", "media", "gallery", "comparison", "stats", "addons", "notes", "articles", "contact"];
  if (!allowed.includes(type)) redirect(`/admin/pages/${pageId}/sections?error=` + encodeURIComponent("Loại Section không được hỗ trợ."));
  const order = await sql<{ max: number }>("SELECT COALESCE(MAX(sort_order), 0)::int AS max FROM page_sections WHERE page_id = $1", [pageId]);
  const key = `${type}-${Date.now()}`;
  const inserted = await sql<{ id: number }>(
    `INSERT INTO page_sections (page_id, section_key, section_type, admin_name, items_json, gallery_json, config_json, sort_order, status)
     VALUES ($1,$2,$3,$4,'[]','[]','{}',$5,'draft') RETURNING id`,
    [pageId, key, type, `Section ${type}`, Number(order[0]?.max || 0) + 1],
  );
  await audit(user.id, "create", "section", String(inserted[0].id));
  refresh();
  redirect(`/admin/pages/${pageId}/sections/${inserted[0].id}?saved=1`);
}

export async function duplicateSection(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id"));
  const rows = await sql<Record<string, unknown>>("SELECT * FROM page_sections WHERE id = $1 AND deleted_at IS NULL", [id]);
  const source = rows[0];
  if (!source) redirect("/admin/pages");
  const inserted = await sql<{ id: number }>(
    `INSERT INTO page_sections (
      page_id, section_key, section_type, admin_name, eyebrow, title, subtitle, description, image_url, image_alt,
      button_label, button_url, secondary_button_label, secondary_button_url, items_json, gallery_json, config_json,
      visible, status, sort_order
    )
    SELECT page_id, $2, section_type, admin_name || ' (bản sao)', eyebrow, title, subtitle, description, image_url, image_alt,
      button_label, button_url, secondary_button_label, secondary_button_url, items_json, gallery_json, config_json,
      FALSE, 'draft', sort_order + 1
    FROM page_sections WHERE id = $1 RETURNING id`,
    [id, `${source.section_key}-copy-${Date.now()}`],
  );
  await audit(user.id, "duplicate", "section", String(id));
  refresh();
  redirect(`/admin/pages/${source.page_id}/sections/${inserted[0].id}?saved=1`);
}

export async function moveSection(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id"));
  const direction = Number(formData.get("direction"));
  const rows = await sql<{ id: number; page_id: number; sort_order: number }>(
    "SELECT id, page_id, sort_order FROM page_sections WHERE page_id = (SELECT page_id FROM page_sections WHERE id = $1) AND deleted_at IS NULL ORDER BY sort_order, id",
    [id],
  );
  const index = rows.findIndex((row) => row.id === id);
  const target = rows[index + direction];
  if (rows[index] && target) {
    await sql("UPDATE page_sections SET sort_order = $1, updated_at = NOW() WHERE id = $2", [target.sort_order, rows[index].id]);
    await sql("UPDATE page_sections SET sort_order = $1, updated_at = NOW() WHERE id = $2", [rows[index].sort_order, target.id]);
    await audit(user.id, "reorder", "section", String(id));
    refresh();
  }
  redirect(`/admin/pages/${rows[index]?.page_id}/sections?saved=1`);
}

export async function deleteSection(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id"));
  const rows = await sql<{ page_id: number }>("UPDATE page_sections SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING page_id", [id]);
  await audit(user.id, "soft-delete", "section", String(id));
  refresh();
  redirect(`/admin/pages/${rows[0]?.page_id || ""}/sections?saved=1`);
}

export async function saveNavigation(formData: FormData) {
  const user = await requireAdmin();
  const count = Number(formData.get("count") || 0);
  const intent = text(formData, "intent", 40);
  const items: { id: number; label: string; href: string; visible: boolean; newTab: boolean; desktop: boolean; mobile: boolean }[] = [];
  for (let i = 0; i < count; i++) {
    const href = safeHref(text(formData, `href_${i}`, 500));
    const label = text(formData, `label_${i}`, 255);
    if (!label || !href) {
      redirect("/admin/navigation?error=" + encodeURIComponent("Mỗi mục menu cần nhãn và URL hợp lệ."));
    }
    items.push({
      id: Number(formData.get(`id_${i}`) || 0),
      label,
      href,
      visible: formData.get(`visible_${i}`) === "on",
      newTab: formData.get(`new_${i}`) === "on",
      desktop: formData.get(`desktop_${i}`) === "on",
      mobile: formData.get(`mobile_${i}`) === "on",
    });
  }
  if (intent === "add") items.push({ id: 0, label: "Mục mới", href: "/", visible: false, newTab: false, desktop: true, mobile: true });
  if (intent.startsWith("remove:")) items.splice(Number(intent.split(":")[1]), 1);
  if (intent.startsWith("move:")) {
    const index = Number(intent.split(":")[1]);
    const direction = Number(intent.split(":")[2]);
    const target = index + direction;
    if (items[index] && items[target]) {
      const copy = items[index];
      items[index] = items[target];
      items[target] = copy;
    }
  }
  const ids = new Set(items.map((item) => item.id).filter(Boolean));
  const existing = await sql<{ id: number }>("SELECT id FROM navigation_items WHERE deleted_at IS NULL");
  for (const row of existing) {
    if (!ids.has(row.id)) await sql("UPDATE navigation_items SET deleted_at = NOW() WHERE id = $1", [row.id]);
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.id) {
      await sql(
        `UPDATE navigation_items SET label=$1, href=$2, visible=$3, open_in_new_tab=$4, show_desktop=$5, show_mobile=$6, sort_order=$7, deleted_at=NULL WHERE id=$8`,
        [item.label, item.href, item.visible, item.newTab, item.desktop, item.mobile, i + 1, item.id],
      );
    } else {
      await sql(
        `INSERT INTO navigation_items (label, href, visible, open_in_new_tab, show_desktop, show_mobile, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [item.label, item.href, item.visible, item.newTab, item.desktop, item.mobile, i + 1],
      );
    }
  }
  await audit(user.id, "update", "navigation", "main");
  refresh();
  redirect("/admin/navigation?saved=1");
}

async function upsertSetting(key: string, value: string) {
  const existing = await sql("SELECT key FROM site_settings WHERE key = $1", [key]);
  if (existing.length) await sql("UPDATE site_settings SET value = $1, updated_at = NOW() WHERE key = $2", [value, key]);
  else await sql("INSERT INTO site_settings (key, value) VALUES ($1, $2)", [key, value]);
}

export async function saveSettingsForm(formData: FormData) {
  const user = await requireAdmin();
  const keys = [
    "brand_name", "brand_tagline", "company_name", "company_address", "logo_alt", "header_cta_label", "header_cta_url", "hotline", "hotline_href",
    "email", "email_href", "zalo_url", "zalo_label", "sticky_phone_label", "sticky_phone_href", "sticky_zalo_url", "sticky_messenger_url", "sticky_facebook_url", "tax_code", "hours_weekday_label", "hours_weekday",
    "hours_saturday_label", "hours_saturday", "hours_sunday_label", "hours_sunday", "hours_summary",
    "hours_saturday_summary", "footer_description", "copyright", "legal_note", "not_found_title", "not_found_description",
  ];
  for (const key of keys) {
    if (formData.has(key)) {
      const value = key.endsWith("_url") || key.endsWith("_href") ? safeHref(text(formData, key, 1000)) : text(formData, key);
      if ((key.endsWith("_url") || key.endsWith("_href")) && text(formData, key, 1000) && !value) {
        redirect("/admin/settings?error=" + encodeURIComponent(`Liên kết ${key} không hợp lệ.`));
      }
      await upsertSetting(key, value);
    }
  }
  for (const flag of ["sticky_contacts_visible", "sticky_phone_visible", "sticky_zalo_visible", "sticky_messenger_visible", "sticky_facebook_visible"]) {
    await upsertSetting(flag, formData.get(flag) === "on" ? "true" : "false");
  }
  if (formData.has("office_count")) {
    const count = Number(formData.get("office_count"));
    const offices = [];
    for (let i = 0; i < count; i++) {
      const mapUrl = text(formData, `office_map_${i}`, 1000);
      offices.push({
        id: text(formData, `office_id_${i}`, 40) || `office-${i + 1}`,
        label: text(formData, `office_label_${i}`, 255),
        address: text(formData, `office_address_${i}`),
        phone: text(formData, `office_phone_${i}`, 80),
        phoneHref: safeHref(text(formData, `office_phone_href_${i}`, 80)) || "",
        mapUrl: mapUrl ? safeHref(mapUrl) : "",
      });
    }
    await upsertSetting("offices", JSON.stringify(offices));
  }
  await audit(user.id, "update", "settings", "site");
  refresh();
  const back = text(formData, "returnTo", 180);
  redirect((back.startsWith("/admin/") ? back : "/admin/settings") + "?saved=1");
}

function imageType(buffer: Buffer) {
  if (buffer.length < 12 || buffer.length > 4 * 1024 * 1024) return null;
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return { mime: "image/png", ext: "png" };
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (buffer.toString("ascii", 0, 3) === "GIF") return { mime: "image/gif", ext: "gif" };
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return { mime: "image/webp", ext: "webp" };
  return null;
}

async function uploadImageAsset(value: FormDataEntryValue | null, alt: string) {
  if (!(value instanceof File) || value.size === 0) return "";
  if (value.size > 4 * 1024 * 1024) throw new Error("Ảnh tải lên tối đa 4MB.");
  const buffer = Buffer.from(await value.arrayBuffer());
  const detected = imageType(buffer);
  if (!detected) throw new Error("Ảnh phải là PNG, JPEG, WEBP hoặc GIF, tối đa 4MB.");
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${detected.ext}`;
  let url: string;
  if (process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("Chưa kết nối Vercel Blob. Hãy tạo Blob Store trong mục Storage của dự án Vercel rồi thử lại.");
    }
    const blob = await put(`uploads/${name}`, buffer, {
      access: "public",
      contentType: detected.mime,
      addRandomSuffix: false,
    });
    url = blob.url;
  } else {
    await fs.mkdir(path.join(process.cwd(), "public", "uploads"), { recursive: true });
    await fs.writeFile(path.join(process.cwd(), "public", "uploads", name), buffer);
    url = `/uploads/${name}`;
  }
  await sql(
    "INSERT INTO media_assets (url, alt, mime_type, file_name) VALUES ($1,$2,$3,$4) ON CONFLICT (url) DO NOTHING",
    [url, alt, detected.mime, name],
  );
  return url;
}

export async function saveLogo(formData: FormData) {
  const user = await requireAdmin();
  const alt = text(formData, "logo_alt", 255) || "Logo";
  let logoUrl = safeImageUrl(text(formData, "logo_url", 1000));
  const file = formData.get("file");
  if (text(formData, "logo_url", 1000) && !logoUrl && !(file instanceof File && file.size > 0)) {
    redirect("/admin/logo?error=" + encodeURIComponent("URL logo không hợp lệ."));
  }
  if (file instanceof File && file.size > 0) {
    try {
      logoUrl = await uploadImageAsset(file, alt);
    } catch (error) {
      redirect("/admin/logo?error=" + encodeURIComponent(error instanceof Error ? error.message : "Ảnh logo không hợp lệ."));
    }
  }
  if (formData.get("clear") === "on") logoUrl = "";
  await upsertSetting("logo_url", logoUrl);
  await upsertSetting("logo_alt", alt);
  await audit(user.id, "update", "logo", logoUrl || "cleared");
  refresh();
  redirect("/admin/logo?saved=1");
}

export async function saveFooter(formData: FormData) {
  const user = await requireAdmin();
  const count = Number(formData.get("count") || 0);
  for (let i = 0; i < count; i++) {
    const links = text(formData, `links_${i}`, 8000)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, href] = line.split("|").map((part) => part.trim());
        return { label, href: safeHref(href || "") };
      });
    if (links.some((link) => link.label && !link.href)) {
      redirect("/admin/footer?error=" + encodeURIComponent("Có liên kết Footer không hợp lệ. Dùng dạng Nhãn | /duong-dan"));
    }
    await sql(
      "UPDATE footer_groups SET title = $1, body = $2, links_json = $3, visible = $4, sort_order = $5, updated_at = NOW() WHERE id = $6",
      [text(formData, `title_${i}`, 255), text(formData, `body_${i}`), JSON.stringify(links.filter((link) => link.label && link.href)), formData.get(`visible_${i}`) === "on", i + 1, Number(formData.get(`id_${i}`))],
    );
  }
  await audit(user.id, "update", "footer", "groups");
  refresh();
  redirect("/admin/footer?saved=1");
}

export async function saveService(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const name = text(formData, "name", 255);
  const slug = slugify(text(formData, "slug", 180) || name);
  if (!name || !slug) redirect("/admin/services?error=" + encodeURIComponent("Tên dịch vụ là bắt buộc."));
  const rawImage = text(formData, "imageUrl", 1000);
  let uploadedImage = "";
  try {
    uploadedImage = await uploadImageAsset(formData.get("service_image_file"), text(formData, "imageAlt", 300));
  } catch (error) {
    redirect("/admin/services?error=" + encodeURIComponent(error instanceof Error ? error.message : "Ảnh dịch vụ không hợp lệ."));
  }
  const imageUrl = uploadedImage || (rawImage ? safeImageUrl(rawImage) : "");
  if (rawImage && !imageUrl) redirect("/admin/services?error=" + encodeURIComponent("URL ảnh không hợp lệ."));
  const values = [
    name,
    slug,
    text(formData, "summary"),
    text(formData, "description"),
    imageUrl || null,
    text(formData, "imageAlt", 300) || null,
    text(formData, "buttonLabel", 120) || null,
    safeHref(text(formData, "buttonUrl", 500)) || null,
    text(formData, "category", 64) || "office",
    formData.get("visible") === "on",
    Number(formData.get("sortOrder") || 0),
  ];
  if (id) {
    await sql(
      `UPDATE services SET name=$1, slug=$2, summary=$3, description=$4, image_url=$5, image_alt=$6, button_label=$7, button_url=$8, category=$9, visible=$10, sort_order=$11, updated_at=NOW() WHERE id=$12`,
      [...values, id],
    );
  } else {
    await sql(
      `INSERT INTO services (name, slug, summary, description, image_url, image_alt, button_label, button_url, category, visible, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      values,
    );
  }
  await audit(user.id, id ? "update" : "create", "service", slug);
  refresh();
  redirect("/admin/services?saved=1");
}

export async function deleteService(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id"));
  await sql("UPDATE services SET deleted_at = NOW() WHERE id = $1", [id]);
  await audit(user.id, "soft-delete", "service", String(id));
  refresh();
  redirect("/admin/services?saved=1");
}

export async function savePlan(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const name = text(formData, "name", 255);
  const slug = slugify(text(formData, "slug", 180) || name);
  const price = text(formData, "priceLabel", 120);
  if (!name || !slug || !price) redirect("/admin/pricing?error=" + encodeURIComponent("Tên gói và giá là bắt buộc."));
  const features = text(formData, "features", 8000).split("\n").map((line) => line.trim()).filter(Boolean);
  const values = [name, slug, text(formData, "category", 64) || "office", text(formData, "summary"), price, text(formData, "period", 64), JSON.stringify(features), formData.get("highlighted") === "on", text(formData, "badge", 80) || null, text(formData, "buttonLabel", 120) || null, safeHref(text(formData, "buttonUrl", 500)) || "#tu-van", formData.get("visible") === "on", Number(formData.get("sortOrder") || 0)];
  if (id) {
    await sql(`UPDATE pricing_plans SET name=$1, slug=$2, category=$3, summary=$4, price_label=$5, period=$6, features_json=$7, highlighted=$8, badge=$9, button_label=$10, button_url=$11, visible=$12, sort_order=$13, updated_at=NOW() WHERE id=$14`, [...values, id]);
  } else {
    await sql(`INSERT INTO pricing_plans (name, slug, category, summary, price_label, period, features_json, highlighted, badge, button_label, button_url, visible, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, values);
  }
  await audit(user.id, id ? "update" : "create", "pricing", slug, price);
  refresh();
  redirect("/admin/pricing?saved=1");
}

export async function deletePlan(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id"));
  await sql("UPDATE pricing_plans SET deleted_at = NOW() WHERE id = $1", [id]);
  await audit(user.id, "soft-delete", "pricing", String(id));
  refresh();
  redirect("/admin/pricing?saved=1");
}

export async function saveArticle(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const title = text(formData, "title", 255);
  const slug = slugify(text(formData, "slug", 180) || title);
  const status = text(formData, "status", 32) === "published" ? "published" : "draft";
  if (!title || !slug) redirect("/admin/articles?error=" + encodeURIComponent("Tiêu đề bài viết là bắt buộc."));
  const content = sanitizeRichText(String(formData.get("content") || ""));
  const categoryId = Number(formData.get("categoryId") || 0) || null;
  const rawCover = text(formData, "coverUrl", 1000);
  let uploadedCover = "";
  try {
    uploadedCover = await uploadImageAsset(formData.get("article_image_file"), text(formData, "coverAlt", 300));
  } catch (error) {
    redirect("/admin/articles?error=" + encodeURIComponent(error instanceof Error ? error.message : "Ảnh bài viết không hợp lệ."));
  }
  const coverUrl = uploadedCover || (rawCover ? safeImageUrl(rawCover) : "");
  if (rawCover && !coverUrl) redirect("/admin/articles?error=" + encodeURIComponent("URL ảnh bài viết không hợp lệ."));
  const values = [categoryId, title, slug, text(formData, "excerpt"), content, coverUrl || null, text(formData, "coverAlt", 300) || null, text(formData, "seoTitle", 255) || null, text(formData, "seoDescription", 500) || null, status, Number(formData.get("readMinutes") || 0) || null];
  if (id) {
    await sql(
      `UPDATE articles SET category_id=$1, title=$2, slug=$3, excerpt=$4, content=$5, cover_url=$6, cover_alt=$7, seo_title=$8, seo_description=$9, status=$10, read_minutes=$11,
        published_at = CASE WHEN $10 = 'published' THEN COALESCE(published_at, NOW()) ELSE published_at END, updated_at = NOW()
       WHERE id = $12 AND deleted_at IS NULL`,
      [...values, id],
    );
  } else {
    await sql(
      `INSERT INTO articles (category_id, title, slug, excerpt, content, cover_url, cover_alt, seo_title, seo_description, status, read_minutes, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, CASE WHEN $10 = 'published' THEN NOW() ELSE NULL END)`,
      values,
    );
  }
  await audit(user.id, status === "published" ? "publish" : "draft", "article", slug);
  refresh();
  redirect("/admin/articles?saved=1");
}

export async function deleteArticle(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id"));
  await sql("UPDATE articles SET deleted_at = NOW(), status = 'draft' WHERE id = $1", [id]);
  await audit(user.id, "soft-delete", "article", String(id));
  refresh();
  redirect("/admin/articles?saved=1");
}

export async function saveArticleCategory(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const name = text(formData, "name", 255);
  const slug = slugify(text(formData, "slug", 180) || name);
  if (!name || !slug) redirect("/admin/categories?error=" + encodeURIComponent("Tên chuyên mục là bắt buộc."));
  const values = [name, slug, text(formData, "description"), Number(formData.get("sortOrder") || 0)];
  if (id) {
    await sql("UPDATE article_categories SET name=$1, slug=$2, description=$3, sort_order=$4 WHERE id=$5", [...values, id]);
  } else {
    await sql("INSERT INTO article_categories (name, slug, description, sort_order) VALUES ($1,$2,$3,$4)", values);
  }
  await audit(user.id, id ? "update" : "create", "article-category", slug);
  refresh();
  redirect("/admin/categories?saved=1");
}

export async function deleteArticleCategory(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id"));
  await sql("UPDATE articles SET category_id=NULL, updated_at=NOW() WHERE category_id=$1", [id]);
  await sql("DELETE FROM article_categories WHERE id=$1", [id]);
  await audit(user.id, "delete", "article-category", String(id));
  refresh();
  redirect("/admin/categories?saved=1");
}

export async function saveContactRequest(formData: FormData) {
  const user = await requireAdmin();
  const id = Number(formData.get("id"));
  const status = text(formData, "status", 32);
  const allowed = ["new", "contacted", "won", "lost"];
  if (!allowed.includes(status)) redirect(`/admin/contact-requests/${id}?error=` + encodeURIComponent("Trạng thái không hợp lệ."));
  await sql("UPDATE contact_requests SET status = $1, internal_note = $2, updated_at = NOW() WHERE id = $3", [status, text(formData, "internalNote"), id]);
  await audit(user.id, "update", "contact_request", String(id), status);
  redirect(`/admin/contact-requests/${id}?saved=1`);
}
