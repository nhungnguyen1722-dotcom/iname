import fs from "fs";
import path from "path";
import pg from "pg";
import bcrypt from "bcryptjs";
import { pgConfig } from "./pg-config.mjs";

function loadEnv() {
  for (const envFile of [".env.local", ".env"]) {
  const envPath = path.join(process.cwd(), envFile);
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
  }
}

loadEnv();

const copy = JSON.parse(fs.readFileSync("scripts/i18n-keys.json", "utf8"));
const posts = JSON.parse(fs.readFileSync("scripts/posts.json", "utf8"));
const contact = JSON.parse(fs.readFileSync("scripts/contact.json", "utf8"));
const t = (key) => copy[key] || "";

const HERO = "https://cdn.enter.pro/resources/uid_100635008/van-phong-ao-hero_6a9b5130.png";
const RECEPTION = "https://cdn.enter.pro/resources/uid_100635008/van-phong-ao-reception_b1846114.png";
const TEAM = "https://cdn.enter.pro/resources/uid_100635008/ke-toan-doi-ngu_9caaa18c.png";

function numbered(prefix, count, build) {
  const items = [];
  for (let i = 1; i <= count; i++) {
    const item = build(i);
    if (item) items.push(item);
  }
  return items;
}

function faqs(prefix) {
  return numbered(prefix, 12, (i) => {
    const question = t(`${prefix}.q${i}`);
    if (!question) return null;
    return { question, answer: t(`${prefix}.a${i}`) };
  });
}

function steps(prefix) {
  return numbered(prefix, 8, (i) => {
    const title = t(`${prefix}.step${i}.title`);
    if (!title) return null;
    return { title, description: t(`${prefix}.step${i}.description`) };
  });
}

function cards(prefix, count = 8) {
  const iconsByGroup = {
    "home.why": ["pin", "badge", "file", "timer"],
    "vo.benefits": ["piggy", "calendar", "building", "mail", "shield", "handshake"],
    "ac.commitments": ["calendar", "lock", "wallet", "message"],
    "ac.credentials": ["badge", "shield", "file", "calculator"],
  };
  const icons = iconsByGroup[prefix] || [];
  return numbered(prefix, count, (i) => {
    const title = t(`${prefix}.item${i}.title`);
    if (!title) return null;
    return { title, description: t(`${prefix}.item${i}.description`), icon: icons[i - 1] || "file" };
  });
}

function stats(prefix) {
  const items = [];
  for (let i = 0; i < 8; i++) {
    const value = t(`${prefix}.${i}.value`);
    const label = t(`${prefix}.${i}.label`);
    if (!value && !label) break;
    items.push({ value, label });
  }
  return items;
}

function team(prefix) {
  return numbered(prefix, 8, (i) => {
    const name = t(`${prefix}.member${i}.name`);
    if (!name) return null;
    const initials = name
      .split(" ")
      .filter((part) => part && part[0] === part[0].toUpperCase())
      .slice(-2)
      .map((part) => part[0])
      .join("");
    return {
      name,
      role: t(`${prefix}.member${i}.role`),
      credential: t(`${prefix}.member${i}.credential`),
      initials,
    };
  });
}

function compareRows(prefix) {
  return numbered(prefix, 12, (i) => {
    const label = t(`${prefix}.row${i}.label`);
    if (!label) return null;
    return {
      label,
      values: [t(`${prefix}.row${i}.col1`), t(`${prefix}.row${i}.col2`), t(`${prefix}.row${i}.col3`)],
    };
  });
}

function features(prefix) {
  return numbered(prefix, 10, (i) => t(`${prefix}.feature${i}`) || null);
}

function points(prefix) {
  return numbered(prefix, 6, (i) => t(`${prefix}.point${i}`) || null);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function blocksToHtml(blocks) {
  return (blocks || [])
    .map((block) => {
      if (block.type === "h2") return `<h2>${escapeHtml(block.text || "")}</h2>`;
      if (block.type === "p") return `<p>${escapeHtml(block.text || "")}</p>`;
      if (block.type === "ul") {
        const items = (block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
        return `<ul>${items}</ul>`;
      }
      return "";
    })
    .join("");
}

function slugify(input) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const client = new pg.Client(pgConfig(process.env.DATABASE_URL));
await client.connect();

async function ensureAdmin() {
  const existing = await client.query("SELECT id FROM admin_users LIMIT 1");
  if (existing.rows.length) {
    console.log("Admin account already exists. Password was not changed.");
    return;
  }
  const email = process.env.ADMIN_EMAIL || "";
  const password = process.env.ADMIN_INITIAL_PASSWORD || "";
  if (!email || password.length < 12) {
    console.log("No admin created. Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD (12+ characters) then run seed again.");
    return;
  }
  const hash = bcrypt.hashSync(password, 12);
  await client.query(
    "INSERT INTO admin_users (email, password_hash, name, role) VALUES ($1, $2, $3, 'admin')",
    [email.toLowerCase(), hash, "Quản trị INAME"],
  );
  console.log(`Admin created for ${email}.`);
}

const pages = await client.query("SELECT COUNT(*)::int AS n FROM pages");
if (pages.rows[0].n > 0) {
  console.log("Pages already exist. Existing content was not overwritten.");
  await ensureAdmin();
  await client.end();
  process.exit(0);
}

async function setting(key, value) {
  await client.query(
    "INSERT INTO site_settings (key, value) VALUES ($1, $2)",
    [key, value],
  );
}

const offices = contact.IA.map((office) => ({
  id: office.id,
  label: t(office.labelKey),
  address: office.address,
  phone: office.phone,
  phoneHref: office.phoneHref,
  mapUrl: office.mapUrl,
}));

const settings = {
  brand_name: t("common.brand.name"),
  brand_tagline: t("common.brand.tagline"),
  company_name: "CÔNG TY TNHH CÔNG NGHỆ INAME",
  company_address: "Phòng Co-founder, Tầng 1, Tòa nhà N01-T2 Khu Đoàn Ngoại Giao, Đường Hoàng Minh Thảo, Phường Xuân Đỉnh, TP Hà Nội, Việt Nam",
  logo_url: "/iname-icon.svg",
  logo_alt: t("common.brand.name"),
  header_visible: "true",
  header_cta_label: t("common.actions.consult"),
  header_cta_url: "#tu-van",
  header_show_phone: "true",
  topbar_visible: "true",
  hotline: "0981988357",
  hotline_href: "tel:0981988357",
  email: contact.nn.email,
  email_href: contact.nn.emailHref,
  zalo_url: "https://zalo.me/0981988357",
  zalo_label: t("contact.channels.zaloValue"),
  sticky_contacts_visible: "true",
  sticky_phone_visible: "true",
  sticky_phone_label: "Gọi 0981988357",
  sticky_phone_href: "tel:0981988357",
  sticky_zalo_visible: "true",
  sticky_zalo_url: "https://zalo.me/0981988357",
  sticky_messenger_visible: "false",
  sticky_messenger_url: "",
  sticky_facebook_visible: "false",
  sticky_facebook_url: "",
  tax_code: contact.nn.taxCode,
  hours_weekday_label: t("contact.hours.weekdaysLabel"),
  hours_weekday: t("contact.hours.weekdaysValue"),
  hours_saturday_label: t("contact.hours.saturdayLabel"),
  hours_saturday: t("contact.hours.saturdayValue"),
  hours_sunday_label: t("contact.hours.sundayLabel"),
  hours_sunday: t("contact.hours.sundayValue"),
  hours_summary: t("common.labels.supportTime"),
  hours_saturday_summary: t("common.labels.saturdayHours"),
  footer_description: t("footer.description"),
  copyright: t("footer.copyright"),
  legal_note: `Mã số thuế: ${contact.nn.taxCode} — ${t("footer.license")}`,
  offices: JSON.stringify(offices.map((office, index) => index === 0 ? {
    ...office,
    label: "Trụ sở Hà Nội",
    address: "Phòng Co-founder, Tầng 1, Tòa nhà N01-T2 Khu Đoàn Ngoại Giao, Đường Hoàng Minh Thảo, Phường Xuân Đỉnh, TP Hà Nội, Việt Nam",
    phone: "0981988357",
    phoneHref: "tel:0981988357",
  } : office)),
  not_found_title: t("notFound.title") || "Không tìm thấy trang",
  not_found_description: t("notFound.description") || "Trang bạn tìm không tồn tại hoặc đã được chuyển.",
};

for (const [key, value] of Object.entries(settings)) await setting(key, value);

const nav = [
  [t("common.nav.home"), "/"],
  [t("common.nav.virtualOffice"), "/van-phong-ao"],
  [t("common.nav.accounting"), "/ke-toan"],
  [t("common.nav.pricing"), "/bang-gia"],
  [t("common.nav.blog"), "/tin-tuc"],
  [t("common.nav.contact"), "/lien-he"],
];
for (let i = 0; i < nav.length; i++) {
  await client.query(
    `INSERT INTO navigation_items (label, href, sort_order) VALUES ($1, $2, $3)`,
    [nav[i][0], nav[i][1], i + 1],
  );
}

const footerGroups = [
  {
    key: "brand",
    title: t("common.brand.name"),
    body: t("footer.description"),
    links: [],
    sort: 1,
  },
  {
    key: "services",
    title: t("footer.servicesTitle"),
    body: "",
    links: [1, 2, 3, 4, 5, 6].map((i) => ({
      label: t(`footer.service${i}`),
      href: i <= 2 ? "/van-phong-ao" : "/ke-toan",
    })),
    sort: 2,
  },
  {
    key: "links",
    title: t("footer.linksTitle"),
    body: "",
    links: nav.slice(1).map(([label, href]) => ({ label, href })),
    sort: 3,
  },
  {
    key: "contact",
    title: t("footer.contactTitle"),
    body: "",
    links: [],
    sort: 4,
  },
];
for (const group of footerGroups) {
  await client.query(
    `INSERT INTO footer_groups (group_key, title, body, links_json, sort_order)
     VALUES ($1, $2, $3, $4, $5)`,
    [group.key, group.title, group.body, JSON.stringify(group.links), group.sort],
  );
}

const pageDefs = [
  ["trang-chu", "/", "Trang chủ", t("home.hero.title"), t("home.hero.subtitle"), 1],
  ["van-phong-ao", "/van-phong-ao", "Văn phòng ảo", t("vo.hero.title"), t("vo.hero.subtitle"), 2],
  ["ke-toan", "/ke-toan", "Dịch vụ kế toán", t("ac.hero.title"), t("ac.hero.subtitle"), 3],
  ["bang-gia", "/bang-gia", "Bảng giá", t("pricing.hero.title"), t("pricing.hero.subtitle"), 4],
  ["tin-tuc", "/tin-tuc", "Tin tức", t("blog.hero.title"), t("blog.hero.subtitle"), 5],
  ["lien-he", "/lien-he", "Liên hệ", t("contact.hero.title"), t("contact.hero.subtitle"), 6],
];
const pageIds = {};
for (const [slug, pathName, title, seoTitle, seoDescription, sort] of pageDefs) {
  const inserted = await client.query(
    `INSERT INTO pages (slug, path, title, seo_title, seo_description, status, is_system, sort_order)
     VALUES ($1, $2, $3, $4, $5, 'published', TRUE, $6) RETURNING id`,
    [slug, pathName, title, seoTitle, seoDescription, sort],
  );
  pageIds[slug] = inserted.rows[0].id;
}

let sectionOrder = 0;
async function section(pageSlug, data) {
  sectionOrder += 1;
  await client.query(
    `INSERT INTO page_sections (
      page_id, section_key, section_type, admin_name, eyebrow, title, subtitle, description,
      image_url, image_alt, button_label, button_url, secondary_button_label, secondary_button_url,
      items_json, gallery_json, config_json, visible, status, sort_order
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,TRUE,'published',$18
    )`,
    [
      pageIds[pageSlug],
      data.key,
      data.type,
      data.adminName || data.title || data.key,
      data.eyebrow || null,
      data.title || null,
      data.subtitle || null,
      data.description || null,
      data.imageUrl || null,
      data.imageAlt || null,
      data.buttonLabel || null,
      data.buttonUrl || null,
      data.secondaryButtonLabel || null,
      data.secondaryButtonUrl || null,
      JSON.stringify(data.items || []),
      JSON.stringify(data.gallery || []),
      JSON.stringify(data.config || {}),
      data.sort || sectionOrder,
    ],
  );
}

await section("trang-chu", {
  key: "home-hero",
  type: "hero",
  adminName: "Hero — Địa chỉ kinh doanh hợp lệ, sổ sách chuẩn ngay từ ngày đầu",
  eyebrow: t("home.hero.eyebrow"),
  title: t("home.hero.title"),
  description: t("home.hero.subtitle"),
  imageUrl: HERO,
  imageAlt: t("home.hero.imageAlt") || "Không gian làm việc hiện đại tại Iname",
  buttonLabel: t("common.actions.consult"),
  buttonUrl: "#tu-van",
  secondaryButtonLabel: t("common.actions.viewPricing"),
  secondaryButtonUrl: "/bang-gia",
  items: [t("home.hero.badge1"), t("home.hero.badge2"), t("home.hero.badge3")].filter(Boolean).map((label) => ({ label })),
  config: {
    variant: "dark",
    stats: stats("home.stats"),
    floatCards: [
      { title: t("home.hero.floatCard.title"), value: t("home.hero.floatCard.value"), note: t("home.hero.floatCard.note") },
      { title: t("home.hero.floatCard2.title"), value: t("home.hero.floatCard2.value"), note: t("home.hero.floatCard2.note") },
    ],
  },
});

await section("trang-chu", {
  key: "home-pillars",
  type: "pillars",
  adminName: "Hai trụ dịch vụ",
  eyebrow: t("home.services.eyebrow"),
  title: t("home.services.title"),
  description: t("home.services.subtitle"),
  items: [
    {
      title: t("home.services.virtualOffice.title"),
      description: t("home.services.virtualOffice.description"),
      icon: "building",
      points: points("home.services.virtualOffice"),
      href: "/van-phong-ao",
      cta: t("common.actions.details"),
    },
    {
      title: t("home.services.accounting.title"),
      description: t("home.services.accounting.description"),
      icon: "calculator",
      points: points("home.services.accounting"),
      href: "/ke-toan",
      cta: t("common.actions.details"),
    },
  ],
});

await section("trang-chu", {
  key: "home-why",
  type: "cards",
  adminName: "Vì sao chọn Iname",
  eyebrow: t("home.why.eyebrow"),
  title: t("home.why.title"),
  description: t("home.why.subtitle"),
  items: cards("home.why"),
  config: { columns: 4, tone: "soft" },
});

await section("trang-chu", {
  key: "home-process",
  type: "steps",
  adminName: "Quy trình làm việc",
  eyebrow: "— QUY TRÌNH HỢP TÁC —",
  title: "Bắt đầu chỉ trong 4 bước",
  description: t("home.process.subtitle"),
  items: steps("home.process"),
});

await section("trang-chu", {
  key: "home-pricing",
  type: "pricing",
  adminName: "Mức phí tham khảo",
  eyebrow: t("home.pricing.eyebrow"),
  title: t("home.pricing.title"),
  description: t("home.pricing.subtitle"),
  buttonLabel: t("common.actions.viewPricing"),
  buttonUrl: "/bang-gia",
  config: { mode: "tabs", note: t("home.pricing.note") },
});

await section("trang-chu", {
  key: "home-team",
  type: "team",
  adminName: "Đội ngũ",
  eyebrow: t("home.team.eyebrow"),
  title: t("home.team.title"),
  description: t("home.team.subtitle"),
  items: team("home.team"),
});

await section("trang-chu", {
  key: "home-testimonials",
  type: "testimonials",
  adminName: "Khách hàng",
  eyebrow: t("home.testimonials.eyebrow"),
  title: t("home.testimonials.title"),
  description: t("home.testimonials.rating"),
  items: numbered("home.testimonials", 6, (i) => {
    const quote = t(`home.testimonials.item${i}.quote`);
    if (!quote) return null;
    return {
      quote,
      author: t(`home.testimonials.item${i}.author`),
      company: t(`home.testimonials.item${i}.company`),
    };
  }),
  config: { tone: "soft" },
});

await section("trang-chu", {
  key: "home-faq",
  type: "faq",
  adminName: "Câu hỏi thường gặp",
  title: t("home.faq.title"),
  description: t("home.faq.subtitle"),
  items: faqs("home.faq"),
  buttonLabel: t("common.actions.consult"),
  buttonUrl: "#tu-van",
});

await section("trang-chu", {
  key: "home-cta",
  type: "cta",
  adminName: "Kêu gọi tư vấn",
  title: t("home.cta.title"),
  description: t("home.cta.subtitle"),
  buttonLabel: t("common.actions.consult"),
  buttonUrl: "#tu-van",
  secondaryButtonLabel: t("common.actions.viewPricing"),
  secondaryButtonUrl: "/bang-gia",
  config: { note: t("home.cta.note") },
});

await section("van-phong-ao", {
  key: "vo-hero",
  type: "page-hero",
  adminName: "Hero văn phòng ảo",
  eyebrow: t("vo.hero.eyebrow"),
  title: t("vo.hero.title"),
  description: t("vo.hero.subtitle"),
  imageUrl: RECEPTION,
  imageAlt: "Văn phòng tiếp khách tại Hà Nội",
  buttonLabel: t("common.actions.consult"),
  buttonUrl: "#tu-van",
  secondaryButtonLabel: t("common.actions.viewPricing"),
  secondaryButtonUrl: "/bang-gia",
  config: { icon: "building" },
  items: [t("home.hero.badge1"), t("home.hero.badge2"), t("home.hero.badge3")].filter(Boolean).map((label) => ({ label })),
});

await section("van-phong-ao", {
  key: "vo-intro",
  type: "media",
  adminName: "Văn phòng ảo của Iname gồm những gì?",
  title: t("vo.intro.title"),
  description: t("vo.intro.description"),
  imageUrl: RECEPTION,
  imageAlt: t("vo.gallery.image2Caption") || "Quầy lễ tân tiếp nhận thư từ và giấy tờ thuế",
  config: { imageSide: "right" },
});

await section("van-phong-ao", {
  key: "vo-services",
  type: "cards",
  adminName: "Sáu hạng mục dịch vụ",
  title: t("vo.services.title"),
  description: t("vo.services.subtitle"),
  config: { columns: 3, source: "services", category: "office", tone: "soft" },
});

await section("van-phong-ao", {
  key: "vo-benefits",
  type: "cards",
  adminName: "Lợi ích văn phòng ảo",
  title: t("vo.benefits.title"),
  items: cards("vo.benefits"),
  config: { columns: 2 },
});

await section("van-phong-ao", {
  key: "vo-gallery",
  type: "gallery",
  adminName: "Không gian thực tế",
  title: t("vo.gallery.title"),
  description: t("vo.gallery.subtitle"),
  gallery: [
    {
      url: HERO,
      alt: t("vo.gallery.image1Caption"),
      caption: t("vo.gallery.image1Caption"),
    },
    {
      url: RECEPTION,
      alt: t("vo.gallery.image2Caption"),
      caption: t("vo.gallery.image2Caption"),
    },
  ],
  config: { tone: "dark" },
});

await section("van-phong-ao", {
  key: "vo-compare",
  type: "comparison",
  adminName: "So sánh gói văn phòng ảo",
  title: t("vo.compare.title"),
  items: compareRows("vo.compare"),
  config: {
    headers: ["Tiêu chí", "Gói Khởi nghiệp", "Gói Chuyên nghiệp", "Gói Doanh nghiệp"],
  },
});

await section("van-phong-ao", {
  key: "vo-process",
  type: "steps",
  adminName: "Bốn bước để bắt đầu",
  title: t("home.process.title"),
  description: t("home.process.subtitle"),
  items: steps("home.process"),
  config: { tone: "soft" },
});

await section("van-phong-ao", {
  key: "vo-faq",
  type: "faq",
  adminName: "Câu hỏi về văn phòng ảo",
  title: t("vo.faq.title"),
  description: t("vo.faq.subtitle"),
  items: faqs("vo.faq"),
  buttonLabel: t("common.actions.consult"),
  buttonUrl: "#tu-van",
});

await section("van-phong-ao", {
  key: "vo-cta",
  type: "cta",
  adminName: "Kêu gọi tư vấn",
  title: t("cta.title"),
  description: t("cta.subtitle"),
  buttonLabel: t("cta.primary"),
  buttonUrl: "#tu-van",
  secondaryButtonLabel: t("cta.secondary"),
  secondaryButtonUrl: "/bang-gia",
  config: { note: t("cta.note") },
});

await section("ke-toan", {
  key: "ac-hero",
  type: "page-hero",
  adminName: "Hero kế toán",
  eyebrow: t("ac.hero.eyebrow"),
  title: t("ac.hero.title"),
  description: t("ac.hero.subtitle"),
  imageUrl: TEAM,
  imageAlt: "Đội ngũ tư vấn kế toán Iname",
  buttonLabel: t("common.actions.consult"),
  buttonUrl: "#tu-van",
  secondaryButtonLabel: t("common.actions.viewPricing"),
  secondaryButtonUrl: "/bang-gia",
  config: { icon: "calculator" },
});

await section("ke-toan", {
  key: "ac-stats",
  type: "stats",
  adminName: "Số liệu kế toán",
  items: stats("ac.stats"),
});

await section("ke-toan", {
  key: "ac-services",
  type: "cards",
  adminName: "Bảy nhóm dịch vụ kế toán",
  title: t("ac.services.title"),
  description: t("ac.services.subtitle"),
  config: { columns: 3, source: "services", category: "accounting" },
});

await section("ke-toan", {
  key: "ac-process",
  type: "steps",
  adminName: "Quy trình kế toán",
  title: t("ac.process.title"),
  description: t("ac.process.subtitle"),
  items: steps("ac.process"),
  config: { tone: "soft" },
});

await section("ke-toan", {
  key: "ac-commitments",
  type: "cards",
  adminName: "Cam kết",
  title: t("ac.commitments.title"),
  items: cards("ac.commitments"),
  config: { columns: 2 },
});

await section("ke-toan", {
  key: "ac-team",
  type: "team",
  adminName: "Đội ngũ kế toán",
  title: t("ac.team.title"),
  description: t("ac.team.subtitle"),
  items: team("ac.team"),
  config: { tone: "soft" },
});

await section("ke-toan", {
  key: "ac-credentials",
  type: "media",
  adminName: "Chứng nhận và năng lực",
  title: t("ac.credentials.title"),
  description: t("ac.credentials.subtitle"),
  imageUrl: TEAM,
  imageAlt: "Dịch vụ tư vấn và hỗ trợ kế toán",
  items: cards("ac.credentials"),
  config: { imageSide: "left", list: true },
});

await section("ke-toan", {
  key: "ac-faq",
  type: "faq",
  adminName: "Câu hỏi về dịch vụ kế toán",
  title: t("ac.faq.title"),
  description: t("ac.faq.subtitle"),
  items: faqs("ac.faq"),
  buttonLabel: t("common.actions.consult"),
  buttonUrl: "#tu-van",
});

await section("ke-toan", {
  key: "ac-cta",
  type: "cta",
  adminName: "Kêu gọi tư vấn",
  title: t("cta.title"),
  description: t("cta.subtitle"),
  buttonLabel: t("cta.primary"),
  buttonUrl: "#tu-van",
  secondaryButtonLabel: t("cta.secondary"),
  secondaryButtonUrl: "/bang-gia",
  config: { note: t("cta.note") },
});

await section("bang-gia", {
  key: "price-hero",
  type: "page-hero",
  adminName: "Hero bảng giá",
  eyebrow: t("pricing.hero.eyebrow"),
  title: t("pricing.hero.title"),
  description: t("pricing.hero.subtitle"),
  imageUrl: HERO,
  imageAlt: "Không gian làm việc chuyên nghiệp",
  items: [{ label: t("home.hero.badge2") }].filter((item) => item.label),
  buttonLabel: t("common.labels.consultFree"),
  buttonUrl: "#tu-van",
  secondaryButtonLabel: t("common.nav.contact"),
  secondaryButtonUrl: "/lien-he",
  config: { icon: "wallet" },
});

await section("bang-gia", {
  key: "price-plans",
  type: "pricing",
  adminName: "Bảng giá dịch vụ",
  config: {
    mode: "stacked",
    officeSubtitle: "Gói địa chỉ và dịch vụ văn phòng, hợp đồng tối thiểu 6 tháng.",
    accountingSubtitle: "Phí theo quy mô chứng từ, hợp đồng theo năm và được báo giá lại mỗi kỳ.",
  },
});

await section("bang-gia", {
  key: "price-compare",
  type: "comparison",
  adminName: "So sánh gói văn phòng ảo",
  title: t("pricing.compare.title"),
  items: compareRows("vo.compare"),
  config: {
    headers: ["Tiêu chí", "Gói Khởi nghiệp", "Gói Chuyên nghiệp", "Gói Doanh nghiệp"],
  },
});

await section("bang-gia", {
  key: "price-addons",
  type: "addons",
  adminName: "Dịch vụ lẻ",
  title: t("pricing.addons.title"),
  description: t("pricing.addons.subtitle"),
  items: numbered("pricing.addons", 12, (i) => {
    const name = t(`pricing.addons.item${i}.name`);
    if (!name) return null;
    return { name, price: t(`pricing.addons.item${i}.price`) };
  }),
});

await section("bang-gia", {
  key: "price-notes",
  type: "notes",
  adminName: "Lưu ý bảng giá",
  title: t("pricing.note.title"),
  items: numbered("pricing.note", 8, (i) => {
    const textValue = t(`pricing.note.item${i}`);
    return textValue ? { text: textValue } : null;
  }),
});

await section("bang-gia", {
  key: "price-faq",
  type: "faq",
  adminName: "Câu hỏi về chi phí",
  title: t("pricing.faq.title"),
  description: t("pricing.faq.subtitle"),
  items: faqs("pricing.faq"),
});

await section("bang-gia", {
  key: "price-cta",
  type: "cta",
  adminName: "Báo giá riêng",
  title: t("pricing.cta.title"),
  description: t("pricing.cta.subtitle"),
  buttonLabel: t("common.actions.consult"),
  buttonUrl: "#tu-van",
  secondaryButtonLabel: t("common.nav.contact"),
  secondaryButtonUrl: "/lien-he",
});

await section("tin-tuc", {
  key: "blog-hero",
  type: "page-hero",
  adminName: "Hero kiến thức",
  eyebrow: t("blog.hero.eyebrow"),
  title: t("blog.hero.title"),
  description: t("blog.hero.subtitle"),
  imageUrl: TEAM,
  imageAlt: "Không gian làm việc và đội ngũ Iname",
  config: { icon: "file" },
});

await section("tin-tuc", {
  key: "blog-list",
  type: "articles",
  adminName: "Danh sách bài viết",
  config: { source: "articles" },
});

await section("tin-tuc", {
  key: "blog-cta",
  type: "cta",
  adminName: "Kêu gọi hỗ trợ hồ sơ",
  title: t("blog.cta.title"),
  description: t("blog.cta.subtitle"),
  buttonLabel: t("common.actions.consult"),
  buttonUrl: "#tu-van",
  secondaryButtonLabel: t("common.actions.viewPricing"),
  secondaryButtonUrl: "/bang-gia",
});

await section("lien-he", {
  key: "contact-hero",
  type: "page-hero",
  adminName: "Hero liên hệ",
  eyebrow: t("contact.hero.eyebrow"),
  title: t("contact.hero.title"),
  description: t("contact.hero.subtitle"),
});

await section("lien-he", {
  key: "contact-main",
  type: "contact",
  adminName: "Form và thông tin liên hệ",
  title: t("contact.form.title"),
  description: t("contact.form.description"),
  config: {
    infoTitle: t("contact.info.title"),
    hoursTitle: t("contact.hours.title"),
    branchesTitle: t("contact.branches.title"),
    branchesSubtitle: t("contact.branches.subtitle"),
    hotlineNote: t("contact.channels.hotlineNote"),
    emailNote: t("contact.channels.emailNote"),
    zaloNote: t("contact.channels.zaloNote"),
  },
});

const serviceGroups = [
  ["office", "vo.services", "/van-phong-ao", 6, ["pin", "building", "monitor", "mail", "message", "file"]],
  ["accounting", "ac.services", "/ke-toan", 7, ["calculator", "receipt", "file", "search", "badge", "file", "scale"]],
];
for (const [category, prefix, href, count, icons] of serviceGroups) {
  for (let i = 1; i <= count; i++) {
    const name = t(`${prefix}.item${i}.title`);
    if (!name) continue;
    await client.query(
      `INSERT INTO services (name, slug, summary, description, button_label, button_url, category, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [name, `${category}-${slugify(name)}`, t(`${prefix}.item${i}.description`), t(`${prefix}.item${i}.description`), t("common.actions.details"), href, category, i],
    );
  }
}

const plans = [
  ["office", "starter", false],
  ["office", "pro", true],
  ["office", "business", false],
  ["accounting", "starter", false],
  ["accounting", "growth", true],
  ["accounting", "full", false],
];
for (let index = 0; index < plans.length; index++) {
  const [category, key, highlighted] = plans[index];
  const prefix = `pricing.${category}.${key}`;
  await client.query(
    `INSERT INTO pricing_plans
      (name, slug, category, summary, price_label, period, features_json, highlighted, badge, button_label, button_url, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [
      t(`${prefix}.name`),
      `${category}-${key}`,
      category,
      t(`${prefix}.description`),
      t(`${prefix}.price`),
      t("common.labels.perMonth"),
      JSON.stringify(features(prefix)),
      highlighted,
      highlighted ? t("common.labels.popular") : null,
      t("common.actions.consult"),
      "#tu-van",
      index + 1,
    ],
  );
}

const categoryIds = {};
let categoryOrder = 0;
for (const post of posts) {
  if (!categoryIds[post.category]) {
    categoryOrder += 1;
    const inserted = await client.query(
      `INSERT INTO article_categories (name, slug, sort_order) VALUES ($1, $2, $3) RETURNING id`,
      [post.category, slugify(post.category), categoryOrder],
    );
    categoryIds[post.category] = inserted.rows[0].id;
  }
  await client.query(
    `INSERT INTO articles
      (category_id, title, slug, excerpt, content, seo_title, seo_description, status, read_minutes, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'published',$8,$9)`,
    [
      categoryIds[post.category],
      post.title,
      post.slug,
      post.excerpt,
      blocksToHtml(post.blocks),
      post.title,
      post.excerpt,
      post.readMinutes || null,
      post.publishedAt,
    ],
  );
}

for (const asset of [
  { url: HERO, alt: t("home.hero.imageAlt") || "Không gian làm việc hiện đại tại Iname" },
  { url: RECEPTION, alt: t("vo.gallery.image2Caption") },
  { url: TEAM, alt: "Dịch vụ tư vấn và hỗ trợ kế toán" },
]) {
  await client.query(
    "INSERT INTO media_assets (url, alt, mime_type, file_name) VALUES ($1, $2, 'image/png', $3)",
    [asset.url, asset.alt, asset.url.split("/").pop()],
  );
}

await ensureAdmin();
await client.end();
console.log("Seed completed.");
