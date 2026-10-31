-- Apply only after CMS pages exist (fresh install: seed first, then migrate again).
DO $cms_guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pages WHERE deleted_at IS NULL) THEN
    RAISE EXCEPTION 'CMS_CONTENT_MISSING';
  END IF;
END
$cms_guard$;

UPDATE site_settings
SET value = replace(replace(value, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'), updated_at = NOW();

INSERT INTO site_settings (key, value) VALUES
  ('brand_name', 'Iname'),
  ('logo_alt', 'Iname'),
  ('company_name', 'CÔNG TY TNHH CÔNG NGHỆ INAME'),
  ('company_address', 'Phòng Co-founder, Tầng 1, Tòa nhà N01-T2 Khu Đoàn Ngoại Giao, Đường Hoàng Minh Thảo, Phường Xuân Đỉnh, TP Hà Nội, Việt Nam'),
  ('hotline', '0981988357'),
  ('hotline_href', 'tel:0981988357'),
  ('zalo_url', 'https://zalo.me/0981988357'),
  ('sticky_contacts_visible', 'true'),
  ('sticky_phone_visible', 'true'),
  ('sticky_phone_label', 'Gọi 0981988357'),
  ('sticky_phone_href', 'tel:0981988357'),
  ('sticky_zalo_visible', 'true'),
  ('sticky_zalo_url', 'https://zalo.me/0981988357'),
  ('sticky_messenger_visible', 'false'),
  ('sticky_messenger_url', ''),
  ('sticky_facebook_visible', 'false'),
  ('sticky_facebook_url', '')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

INSERT INTO site_settings (key, value) VALUES ('logo_url', '/iname-icon.svg')
ON CONFLICT (key) DO NOTHING;
UPDATE site_settings SET value = '/iname-icon.svg', updated_at = NOW()
WHERE key = 'logo_url' AND value = '';

UPDATE site_settings
SET value = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(value::jsonb, '{0,label}', '"Trụ sở Hà Nội"'::jsonb, TRUE),
      '{0,address}', '"Phòng Co-founder, Tầng 1, Tòa nhà N01-T2 Khu Đoàn Ngoại Giao, Đường Hoàng Minh Thảo, Phường Xuân Đỉnh, TP Hà Nội, Việt Nam"'::jsonb, TRUE
    ),
    '{0,phone}', '"0981988357"'::jsonb, TRUE
  ),
  '{0,phoneHref}', '"tel:0981988357"'::jsonb, TRUE
)::text, updated_at = NOW()
WHERE key = 'offices' AND jsonb_typeof(value::jsonb) = 'array' AND jsonb_array_length(value::jsonb) > 0;

UPDATE pages SET slug = 'tin-tuc', path = '/tin-tuc', title = 'Tin tức', seo_title = 'Tin tức | Iname', updated_at = NOW()
WHERE slug = 'kien-thuc' AND deleted_at IS NULL;

UPDATE pages SET title = replace(replace(title, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  seo_title = replace(replace(seo_title, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  seo_description = replace(replace(seo_description, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'), updated_at = NOW();

UPDATE page_sections SET
  admin_name = replace(replace(admin_name, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  eyebrow = replace(replace(eyebrow, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  title = replace(replace(title, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  subtitle = replace(replace(subtitle, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  description = replace(replace(description, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  image_alt = replace(replace(image_alt, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  items_json = replace(replace(items_json, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  gallery_json = replace(replace(gallery_json, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  config_json = replace(replace(config_json, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  updated_at = NOW();

UPDATE footer_groups SET title = replace(replace(title, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  body = replace(replace(body, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  links_json = replace(replace(links_json, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'), updated_at = NOW();

UPDATE services SET name = replace(replace(name, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  summary = replace(replace(summary, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  description = replace(replace(description, 'An Việt Office', 'Iname'), 'An Việt', 'Iname');

UPDATE pricing_plans SET summary = replace(replace(summary, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  features_json = replace(replace(features_json, 'An Việt Office', 'Iname'), 'An Việt', 'Iname');

UPDATE articles SET excerpt = replace(replace(excerpt, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  content = replace(replace(content, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  seo_title = replace(replace(seo_title, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  seo_description = replace(replace(seo_description, 'An Việt Office', 'Iname'), 'An Việt', 'Iname'),
  cover_alt = replace(replace(cover_alt, 'An Việt Office', 'Iname'), 'An Việt', 'Iname');

UPDATE navigation_items SET label = 'Tin tức', href = '/tin-tuc'
WHERE href = '/kien-thuc' AND deleted_at IS NULL;
UPDATE footer_groups SET links_json = replace(links_json, '/kien-thuc', '/tin-tuc') WHERE links_json LIKE '%/kien-thuc%';
UPDATE page_sections SET button_url = replace(button_url, '/kien-thuc', '/tin-tuc'),
  secondary_button_url = replace(secondary_button_url, '/kien-thuc', '/tin-tuc')
WHERE button_url LIKE '%/kien-thuc%' OR secondary_button_url LIKE '%/kien-thuc%';
UPDATE navigation_items SET label = replace(replace(label, 'An Việt Office', 'Iname'), 'An Việt', 'Iname')
WHERE deleted_at IS NULL;

UPDATE page_sections SET
  eyebrow = '— QUY TRÌNH HỢP TÁC —',
  title = 'Bắt đầu chỉ trong 4 bước',
  description = 'Quy trình tinh gọn, rõ ràng từng bước — để bạn luôn biết chính xác doanh nghiệp mình đang ở giai đoạn nào.',
  items_json = '[{"title":"Liên hệ tư vấn","description":"Chia sẻ nhu cầu, nhận tư vấn miễn phí từ chuyên viên Iname."},{"title":"Chọn gói phù hợp","description":"So sánh dịch vụ và mức giá, chọn giải pháp đúng nhu cầu và ngân sách."},{"title":"Hoàn tất hồ sơ","description":"Ký hợp đồng, chuẩn bị hồ sơ pháp lý với sự hỗ trợ trọn vẹn từ đội ngũ."},{"title":"Bắt đầu vận hành","description":"Doanh nghiệp chính thức hoạt động với đầy đủ hỗ trợ đi kèm."}]',
  updated_at = NOW()
WHERE section_key = 'home-process';

UPDATE page_sections SET items_json = (
  SELECT COALESCE(jsonb_agg(
    jsonb_set(item, '{icon}', to_jsonb(CASE section_key
      WHEN 'home-pillars' THEN CASE ordinality WHEN 1 THEN 'building' ELSE 'calculator' END
      WHEN 'home-why' THEN CASE ordinality WHEN 1 THEN 'pin' WHEN 2 THEN 'badge' WHEN 3 THEN 'file' ELSE 'timer' END
      WHEN 'vo-benefits' THEN CASE ordinality WHEN 1 THEN 'piggy' WHEN 2 THEN 'calendar' WHEN 3 THEN 'building' WHEN 4 THEN 'mail' WHEN 5 THEN 'shield' ELSE 'handshake' END
      WHEN 'ac-commitments' THEN CASE ordinality WHEN 1 THEN 'calendar' WHEN 2 THEN 'lock' WHEN 3 THEN 'wallet' ELSE 'message' END
      WHEN 'ac-credentials' THEN CASE ordinality WHEN 1 THEN 'badge' WHEN 2 THEN 'shield' WHEN 3 THEN 'file' ELSE 'calculator' END
      ELSE 'file'
    END), TRUE) ORDER BY ordinality
  ), '[]'::jsonb)::text
  FROM jsonb_array_elements(COALESCE(NULLIF(page_sections.items_json, '')::jsonb, '[]'::jsonb)) WITH ORDINALITY AS each_item(item, ordinality)
), updated_at = NOW()
WHERE section_key IN ('home-pillars', 'home-why', 'vo-benefits', 'ac-commitments', 'ac-credentials');

UPDATE page_sections SET items_json = (
  SELECT COALESCE(jsonb_agg(jsonb_set(item, '{rating}', to_jsonb(5), TRUE) ORDER BY ordinality), '[]'::jsonb)::text
  FROM jsonb_array_elements(COALESCE(NULLIF(page_sections.items_json, '')::jsonb, '[]'::jsonb)) WITH ORDINALITY AS each_item(item, ordinality)
), updated_at = NOW()
WHERE section_key = 'home-testimonials';

UPDATE page_sections SET config_json = COALESCE(NULLIF(config_json, '')::jsonb, '{}'::jsonb) || '{"icon":"building"}'::jsonb, updated_at = NOW()
WHERE section_key = 'vo-hero';
UPDATE page_sections SET image_url = COALESCE(image_url, 'https://cdn.enter.pro/resources/uid_100635008/van-phong-ao-reception_b1846114.png'), image_alt = COALESCE(image_alt, 'Văn phòng tiếp khách tại Hà Nội'), updated_at = NOW()
WHERE section_key = 'vo-hero';
UPDATE page_sections SET config_json = COALESCE(NULLIF(config_json, '')::jsonb, '{}'::jsonb) || '{"icon":"calculator"}'::jsonb, updated_at = NOW()
WHERE section_key = 'ac-hero';
UPDATE page_sections SET image_url = COALESCE(image_url, 'https://cdn.enter.pro/resources/uid_100635008/ke-toan-doi-ngu_9caaa18c.png'), image_alt = COALESCE(image_alt, 'Đội ngũ tư vấn kế toán Iname'), updated_at = NOW()
WHERE section_key = 'ac-hero';
UPDATE page_sections SET config_json = COALESCE(NULLIF(config_json, '')::jsonb, '{}'::jsonb) || '{"icon":"wallet"}'::jsonb, updated_at = NOW()
WHERE section_key = 'price-hero';
UPDATE page_sections SET image_url = COALESCE(image_url, 'https://cdn.enter.pro/resources/uid_100635008/van-phong-ao-hero_6a9b5130.png'), image_alt = COALESCE(image_alt, 'Không gian làm việc chuyên nghiệp'), updated_at = NOW()
WHERE section_key = 'price-hero';
UPDATE page_sections SET config_json = COALESCE(NULLIF(config_json, '')::jsonb, '{}'::jsonb) || '{"icon":"file"}'::jsonb,
  eyebrow = 'Tin tức', image_url = COALESCE(image_url, 'https://cdn.enter.pro/resources/uid_100635008/ke-toan-doi-ngu_9caaa18c.png'), updated_at = NOW()
WHERE section_key = 'blog-hero';

UPDATE page_sections SET config_json = COALESCE(NULLIF(config_json, '')::jsonb, '{}'::jsonb) || '{"officeSubtitle":"Gói địa chỉ và dịch vụ văn phòng, hợp đồng tối thiểu 6 tháng.","accountingSubtitle":"Phí theo quy mô chứng từ, hợp đồng theo năm và được báo giá lại mỗi kỳ."}'::jsonb,
  updated_at = NOW()
WHERE section_key = 'price-plans';
