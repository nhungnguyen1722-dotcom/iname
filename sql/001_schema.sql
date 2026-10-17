-- INAME CMS schema for PostgreSQL 9.3+
-- Safe to re-run: creates missing tables only. Does not drop data.

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  path VARCHAR(180) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  seo_title VARCHAR(255),
  seo_description TEXT,
  og_image TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'published',
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_sections (
  id SERIAL PRIMARY KEY,
  page_id INTEGER NOT NULL REFERENCES pages(id),
  section_key VARCHAR(160) NOT NULL,
  section_type VARCHAR(64) NOT NULL,
  admin_name VARCHAR(255) NOT NULL,
  eyebrow TEXT,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  image_alt TEXT,
  button_label TEXT,
  button_url TEXT,
  secondary_button_label TEXT,
  secondary_button_url TEXT,
  items_json TEXT,
  gallery_json TEXT,
  config_json TEXT,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(32) NOT NULL DEFAULT 'published',
  sort_order INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (page_id, section_key)
);

CREATE INDEX page_sections_page_sort_idx
  ON page_sections (page_id, sort_order);

CREATE TABLE IF NOT EXISTS navigation_items (
  id SERIAL PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  href VARCHAR(500) NOT NULL,
  open_in_new_tab BOOLEAN NOT NULL DEFAULT FALSE,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  show_desktop BOOLEAN NOT NULL DEFAULT TRUE,
  show_mobile BOOLEAN NOT NULL DEFAULT TRUE,
  parent_id INTEGER REFERENCES navigation_items(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(120) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  summary TEXT,
  description TEXT,
  image_url TEXT,
  image_alt TEXT,
  button_label TEXT,
  button_url TEXT,
  category VARCHAR(64) NOT NULL DEFAULT 'office',
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  category VARCHAR(64) NOT NULL,
  summary TEXT,
  price_label VARCHAR(120) NOT NULL,
  period VARCHAR(64),
  features_json TEXT NOT NULL,
  highlighted BOOLEAN NOT NULL DEFAULT FALSE,
  badge TEXT,
  button_label TEXT,
  button_url TEXT,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS article_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES article_categories(id),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_url TEXT,
  cover_alt TEXT,
  seo_title VARCHAR(255),
  seo_description TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  read_minutes INTEGER,
  published_at TIMESTAMP,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX articles_status_idx ON articles (status, published_at);

CREATE TABLE IF NOT EXISTS contact_requests (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  company_name VARCHAR(255),
  service VARCHAR(255),
  package_name VARCHAR(255),
  message TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'new',
  internal_note TEXT,
  source_path VARCHAR(180),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX contact_requests_status_idx
  ON contact_requests (status, created_at);

CREATE TABLE IF NOT EXISTS media_assets (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  alt TEXT,
  mime_type VARCHAR(120),
  file_name VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS footer_groups (
  id SERIAL PRIMARY KEY,
  group_key VARCHAR(64) NOT NULL UNIQUE,
  title VARCHAR(255),
  body TEXT,
  links_json TEXT,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER,
  action VARCHAR(64) NOT NULL,
  entity VARCHAR(64) NOT NULL,
  entity_id VARCHAR(64),
  detail TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
