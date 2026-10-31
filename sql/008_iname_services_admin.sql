-- Apply only after CMS pages exist (fresh install: seed first, then migrate again).
DO $cms_guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pages WHERE deleted_at IS NULL) THEN
    RAISE EXCEPTION 'CMS_CONTENT_MISSING';
  END IF;
END
$cms_guard$;

UPDATE site_settings
SET value = replace(replace(value, 'hotro@anvietoffice.vn', 'support@iname'), 'Iname', 'iName'),
    updated_at = NOW()
WHERE value LIKE '%Iname%' OR value LIKE '%anvietoffice%'
;

UPDATE site_settings SET value = 'iName', updated_at = NOW() WHERE key IN ('brand_name', 'logo_alt')
;

UPDATE site_settings SET value = 'support@iname', updated_at = NOW() WHERE key = 'email'
;

UPDATE site_settings SET value = 'mailto:support@iname', updated_at = NOW() WHERE key = 'email_href'
;

UPDATE pages
SET title = replace(title, 'Iname', 'iName'),
    seo_title = replace(seo_title, 'Iname', 'iName'),
    seo_description = replace(seo_description, 'Iname', 'iName'),
    updated_at = NOW()
WHERE title LIKE '%Iname%' OR seo_title LIKE '%Iname%' OR seo_description LIKE '%Iname%'
;

UPDATE page_sections
SET admin_name = replace(admin_name, 'Iname', 'iName'),
    eyebrow = replace(eyebrow, 'Iname', 'iName'),
    title = replace(title, 'Iname', 'iName'),
    subtitle = replace(subtitle, 'Iname', 'iName'),
    description = replace(description, 'Iname', 'iName'),
    image_alt = replace(image_alt, 'Iname', 'iName'),
    items_json = replace(items_json, 'Iname', 'iName'),
    gallery_json = replace(gallery_json, 'Iname', 'iName'),
    config_json = replace(config_json, 'Iname', 'iName'),
    updated_at = NOW()
WHERE admin_name LIKE '%Iname%' OR eyebrow LIKE '%Iname%' OR title LIKE '%Iname%'
   OR subtitle LIKE '%Iname%' OR description LIKE '%Iname%' OR image_alt LIKE '%Iname%'
   OR items_json LIKE '%Iname%' OR gallery_json LIKE '%Iname%' OR config_json LIKE '%Iname%'
;

UPDATE footer_groups
SET title = replace(title, 'Iname', 'iName'),
    body = replace(replace(body, 'hotro@anvietoffice.vn', 'support@iname'), 'Iname', 'iName'),
    links_json = replace(replace(links_json, 'hotro@anvietoffice.vn', 'support@iname'), 'Iname', 'iName'),
    updated_at = NOW()
WHERE title LIKE '%Iname%' OR body LIKE '%Iname%' OR links_json LIKE '%Iname%'
   OR body LIKE '%anvietoffice%' OR links_json LIKE '%anvietoffice%'
;

UPDATE services
SET name = replace(name, 'Iname', 'iName'),
    summary = replace(summary, 'Iname', 'iName'),
    description = replace(description, 'Iname', 'iName')
WHERE name LIKE '%Iname%' OR summary LIKE '%Iname%' OR description LIKE '%Iname%'
;

UPDATE pricing_plans
SET name = replace(name, 'Iname', 'iName'),
    summary = replace(summary, 'Iname', 'iName'),
    features_json = replace(features_json, 'Iname', 'iName')
WHERE name LIKE '%Iname%' OR summary LIKE '%Iname%' OR features_json LIKE '%Iname%'
;

UPDATE articles
SET title = replace(title, 'Iname', 'iName'),
    excerpt = replace(excerpt, 'Iname', 'iName'),
    content = replace(replace(content, 'hotro@anvietoffice.vn', 'support@iname'), 'Iname', 'iName'),
    seo_title = replace(seo_title, 'Iname', 'iName'),
    seo_description = replace(seo_description, 'Iname', 'iName'),
    cover_alt = replace(cover_alt, 'Iname', 'iName'),
    updated_at = NOW()
WHERE title LIKE '%Iname%' OR excerpt LIKE '%Iname%' OR content LIKE '%Iname%'
   OR seo_title LIKE '%Iname%' OR seo_description LIKE '%Iname%' OR cover_alt LIKE '%Iname%'
   OR content LIKE '%anvietoffice%'
;

UPDATE office_locations
SET title = replace(title, 'Iname', 'iName'),
    excerpt = replace(excerpt, 'Iname', 'iName'),
    content = replace(content, 'Iname', 'iName'),
    cover_alt = replace(cover_alt, 'Iname', 'iName'),
    banner_alt = replace(banner_alt, 'Iname', 'iName'),
    updated_at = NOW()
WHERE title LIKE '%Iname%' OR excerpt LIKE '%Iname%' OR content LIKE '%Iname%'
   OR cover_alt LIKE '%Iname%' OR banner_alt LIKE '%Iname%'
;

INSERT INTO pages (slug, path, title, seo_title, seo_description, og_image, status, is_system, sort_order)
SELECT 'bang-gia-cu', '/bang-gia-cu', 'Bảng giá cũ', seo_title, seo_description, og_image, status, FALSE, 40
FROM pages
WHERE path = '/bang-gia'
  AND NOT EXISTS (SELECT 1 FROM pages WHERE path = '/bang-gia-cu')
;

INSERT INTO page_sections (
  page_id, section_key, section_type, admin_name, eyebrow, title, subtitle, description,
  image_url, image_alt, button_label, button_url, secondary_button_label, secondary_button_url,
  items_json, gallery_json, config_json, visible, status, sort_order
)
SELECT dst.id, s.section_key, s.section_type, s.admin_name, s.eyebrow, s.title, s.subtitle, s.description,
       s.image_url, s.image_alt, s.button_label, s.button_url, s.secondary_button_label, s.secondary_button_url,
       s.items_json, s.gallery_json, s.config_json, s.visible, s.status, s.sort_order
FROM page_sections s
JOIN pages src ON src.id = s.page_id AND src.path = '/bang-gia'
JOIN pages dst ON dst.path = '/bang-gia-cu'
WHERE s.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM page_sections existing
    WHERE existing.page_id = dst.id AND existing.section_key = s.section_key AND existing.deleted_at IS NULL
  )
;

UPDATE page_sections AS s
SET button_label = 'Liên Hệ',
    button_url = '/lien-he',
    updated_at = NOW()
FROM pages p
WHERE s.page_id = p.id
  AND s.deleted_at IS NULL
  AND (
    (p.path = '/' AND s.section_key = 'home-hero')
    OR (p.path = '/van-phong-ao' AND s.section_key = 'vo-hero')
    OR (p.path = '/ke-toan' AND s.section_key = 'ac-hero')
    OR (p.path = '/bang-gia' AND s.section_key = 'price-hero')
    OR (p.path = '/tin-tuc' AND s.section_key = 'blog-hero')
  )
;

UPDATE page_sections AS s
SET secondary_button_label = NULL,
    secondary_button_url = NULL,
    updated_at = NOW()
FROM pages p
WHERE s.page_id = p.id
  AND p.path = '/bang-gia'
  AND s.section_key = 'price-hero'
  AND lower(s.secondary_button_label) = 'liên hệ'
;

UPDATE navigation_items
SET deleted_at = NOW(), visible = FALSE
WHERE parent_id IS NULL
  AND deleted_at IS NULL
  AND href IN ('/van-phong-ao', '/ke-toan')
;

INSERT INTO navigation_items (label, href, open_in_new_tab, visible, show_desktop, show_mobile, parent_id, sort_order)
SELECT 'Dịch vụ', '#dich-vu', FALSE, TRUE, TRUE, TRUE, NULL, 2
WHERE NOT EXISTS (
  SELECT 1 FROM navigation_items WHERE label = 'Dịch vụ' AND parent_id IS NULL AND deleted_at IS NULL
)
;

INSERT INTO navigation_items (label, href, open_in_new_tab, visible, show_desktop, show_mobile, parent_id, sort_order)
SELECT 'Văn phòng ảo', '/van-phong-ao', FALSE, TRUE, TRUE, TRUE, parent.id, 1
FROM navigation_items parent
WHERE parent.label = 'Dịch vụ' AND parent.parent_id IS NULL AND parent.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM navigation_items child
    WHERE child.parent_id = parent.id AND child.href = '/van-phong-ao' AND child.deleted_at IS NULL
  )
;

INSERT INTO navigation_items (label, href, open_in_new_tab, visible, show_desktop, show_mobile, parent_id, sort_order)
SELECT 'Kế toán - Thuế', '/ke-toan', FALSE, TRUE, TRUE, TRUE, parent.id, 2
FROM navigation_items parent
WHERE parent.label = 'Dịch vụ' AND parent.parent_id IS NULL AND parent.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM navigation_items child
    WHERE child.parent_id = parent.id AND child.href = '/ke-toan' AND child.deleted_at IS NULL
  )
;

INSERT INTO navigation_items (label, href, open_in_new_tab, visible, show_desktop, show_mobile, parent_id, sort_order)
SELECT 'Giải pháp công nghệ', '/giai-phap-cong-nghe', FALSE, TRUE, TRUE, TRUE, parent.id, 3
FROM navigation_items parent
WHERE parent.label = 'Dịch vụ' AND parent.parent_id IS NULL AND parent.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM navigation_items child
    WHERE child.parent_id = parent.id AND child.href = '/giai-phap-cong-nghe' AND child.deleted_at IS NULL
  )
;

UPDATE navigation_items SET sort_order = 1 WHERE href = '/' AND parent_id IS NULL AND deleted_at IS NULL
;

UPDATE navigation_items SET sort_order = 2 WHERE label = 'Dịch vụ' AND parent_id IS NULL AND deleted_at IS NULL
;

UPDATE navigation_items SET sort_order = 3 WHERE href = '/bang-gia' AND parent_id IS NULL AND deleted_at IS NULL
;

UPDATE navigation_items SET sort_order = 4 WHERE href = '/tin-tuc' AND parent_id IS NULL AND deleted_at IS NULL
;

UPDATE navigation_items SET sort_order = 5 WHERE href = '/lien-he' AND parent_id IS NULL AND deleted_at IS NULL
;

INSERT INTO pages (slug, path, title, seo_title, seo_description, status, is_system, sort_order)
SELECT 'giai-phap-cong-nghe', '/giai-phap-cong-nghe', 'Giải pháp công nghệ',
       'Giải pháp công nghệ | iName',
       'Website, phần mềm quản lý, AI Agent và tư vấn triển khai công nghệ cho doanh nghiệp.',
       'published', TRUE, 7
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE path = '/giai-phap-cong-nghe')
;

INSERT INTO page_sections (
  page_id, section_key, section_type, admin_name, eyebrow, title, description, image_url, image_alt,
  button_label, button_url, items_json, gallery_json, config_json, visible, status, sort_order
)
SELECT p.id, 'tech-hero', 'page-hero', 'Hero giải pháp công nghệ', 'GIẢI PHÁP CÔNG NGHỆ',
       'Website, phần mềm và AI Agent cho doanh nghiệp',
       'iName tư vấn, xây dựng và bàn giao công nghệ để doanh nghiệp vận hành gọn hơn: website, phần mềm quản lý và trợ lý AI.',
       'https://cdn.enter.pro/resources/uid_100635008/van-phong-ao-hero_6a9b5130.png',
       'Không gian làm việc số của iName',
       'Liên Hệ', '/lien-he', '[]', '[]', '{}', TRUE, 'published', 1
FROM pages p
WHERE p.path = '/giai-phap-cong-nghe'
  AND NOT EXISTS (SELECT 1 FROM page_sections s WHERE s.page_id = p.id AND s.section_key = 'tech-hero')
;

INSERT INTO page_sections (
  page_id, section_key, section_type, admin_name, eyebrow, title, description,
  items_json, gallery_json, config_json, visible, status, sort_order
)
SELECT p.id, 'tech-services', 'cards', 'Các giải pháp công nghệ nổi bật', 'DỊCH VỤ CÔNG NGHỆ',
       'Các giải pháp công nghệ nổi bật',
       'Chúng tôi cung cấp đa dạng các dịch vụ công nghệ, từ phát triển phần mềm, website đến hệ thống quản lý và chuyển đổi số, đáp ứng mọi nhu cầu của doanh nghiệp.',
       $items$[{"title":"Thiết kế website","description":"Website chuyên nghiệp, chuẩn SEO, hiện đại, giao diện đẹp, tối ưu trải nghiệm.","icon":"website","color":"#1877F2","bg":"#f8fbff","border":"#e0edfe","href":"/lien-he","cta":"Xem chi tiết →"},{"title":"Phát triển phần mềm","description":"Ứng dụng web, mobile theo yêu cầu, linh hoạt và bảo mật.","icon":"code","color":"#7C3AED","bg":"#faf5ff","border":"#f3e8ff","href":"/lien-he","cta":"Xem chi tiết →"},{"title":"Hệ thống quản lý","description":"Giải pháp quản trị doanh nghiệp (ERP, CRM, HRM...) tối ưu quy trình.","icon":"cloud","color":"#10B981","bg":"#f0fdf4","border":"#dcfce7","href":"/lien-he","cta":"Xem chi tiết →"},{"title":"AI & Tự động hóa","description":"Ứng dụng AI, chatbot, tự động hóa quy trình làm việc.","icon":"cpu","color":"#F97316","bg":"#fffbeb","border":"#ffedd5","href":"/lien-he","cta":"Xem chi tiết →"},{"title":"Cloud & Hạ tầng","description":"Lưu trữ, bảo mật, triển khai hạ tầng đám mây linh hoạt.","icon":"cloud","color":"#06B6D4","bg":"#f0fdfa","border":"#ccfbf1","href":"/lien-he","cta":"Xem chi tiết →"}]$items$,
       '[]', '{"columns":5,"eyebrowColor":"#0ea5e9"}', TRUE, 'published', 2
FROM pages p
WHERE p.path = '/giai-phap-cong-nghe'
  AND NOT EXISTS (SELECT 1 FROM page_sections s WHERE s.page_id = p.id AND s.section_key = 'tech-services')
;

INSERT INTO page_sections (
  page_id, section_key, section_type, admin_name, eyebrow, title, description,
  items_json, gallery_json, config_json, visible, status, sort_order
)
SELECT p.id, 'tech-steps', 'steps', 'Quy trình làm việc', 'QUY TRÌNH LÀM VIỆC',
       'Từ ý tưởng đến hiện thực',
       'Chúng tôi luôn đồng hành cùng bạn trong từng bước, đảm bảo dự án được triển khai chuyên nghiệp, đúng tiến độ và đạt hiệu quả cao nhất.',
       $items$[{"title":"Tư vấn & phân tích","description":"Hiểu rõ nhu cầu, đề xuất giải pháp phù hợp."},{"title":"Thiết kế & lập trình","description":"Xây dựng giao diện, phát triển theo yêu cầu."},{"title":"Kiểm thử & bàn giao","description":"Đảm bảo chất lượng, hướng dẫn sử dụng chi tiết."},{"title":"Bảo trì & hỗ trợ","description":"Đồng hành lâu dài, xử lý nhanh vấn đề phát sinh."}]$items$,
       '[]', '{}', TRUE, 'published', 3
FROM pages p
WHERE p.path = '/giai-phap-cong-nghe'
  AND NOT EXISTS (SELECT 1 FROM page_sections s WHERE s.page_id = p.id AND s.section_key = 'tech-steps')
;

INSERT INTO page_sections (
  page_id, section_key, section_type, admin_name, title, description,
  items_json, gallery_json, config_json, visible, status, sort_order, button_label, button_url
)
SELECT p.id, 'tech-faq', 'faq', 'Câu hỏi giải pháp công nghệ',
       'Câu hỏi trước khi triển khai',
       'Phạm vi, dữ liệu và cách bàn giao được nói rõ trước khi ký.',
       $items$[{"question":"Doanh nghiệp đã có website thì có làm thêm phần mềm được không?","answer":"Được. Chúng tôi xem website hiện tại là một kênh, phần mềm quản lý là nơi xử lý đơn hàng, khách hàng hoặc công việc nội bộ."},{"question":"AI Agent có tự ý dùng dữ liệu kế toán không?","answer":"Không. Trợ lý chỉ đọc nguồn dữ liệu được phép và không thay thế sổ sách kế toán."},{"question":"Sau bàn giao doanh nghiệp có tự cập nhật nội dung không?","answer":"Có. Website và các màn quản trị được bàn giao kèm tài khoản, đội ngũ tự sửa nội dung thường ngày."}]$items$,
       '[]', '{}', TRUE, 'published', 4, 'Liên Hệ', '/lien-he'
FROM pages p
WHERE p.path = '/giai-phap-cong-nghe'
  AND NOT EXISTS (SELECT 1 FROM page_sections s WHERE s.page_id = p.id AND s.section_key = 'tech-faq')
;

INSERT INTO page_sections (
  page_id, section_key, section_type, admin_name, title, description,
  button_label, button_url, items_json, gallery_json, config_json, visible, status, sort_order
)
SELECT p.id, 'tech-cta', 'cta', 'Kêu gọi giải pháp công nghệ',
       'Cần một website, phần mềm hoặc AI Agent đúng việc đang chạy?',
       'Mô tả ngắn quy trình hiện tại. iName phản hồi phạm vi và bước tiếp theo.',
       'Liên Hệ', '/lien-he', '[]', '[]', '{}', TRUE, 'published', 5
FROM pages p
WHERE p.path = '/giai-phap-cong-nghe'
  AND NOT EXISTS (SELECT 1 FROM page_sections s WHERE s.page_id = p.id AND s.section_key = 'tech-cta')
;

INSERT INTO pricing_plans (name, slug, category, summary, price_label, period, features_json, highlighted, badge, button_label, button_url, visible, sort_order)
SELECT 'Website doanh nghiệp', 'tech-website', 'technology',
       'Trang giới thiệu dịch vụ, chuẩn điện thoại, tự cập nhật nội dung.',
       'Liên hệ', NULL,
       '["Trang dịch vụ, bảng giá, tin tức và liên hệ","Hiển thị gọn trên điện thoại","Tài khoản để tự sửa nội dung","Bàn giao mã nguồn và hướng dẫn"]',
       FALSE, NULL, 'Liên hệ', '/lien-he', TRUE, 31
WHERE NOT EXISTS (SELECT 1 FROM pricing_plans WHERE slug = 'tech-website')
;

INSERT INTO pricing_plans (name, slug, category, summary, price_label, period, features_json, highlighted, badge, button_label, button_url, visible, sort_order)
SELECT 'Phần mềm quản lý', 'tech-software', 'technology',
       'Phần mềm theo quy trình bán hàng, khách hàng hoặc vận hành nội bộ.',
       'Liên hệ', NULL,
       '["Màn hình đúng việc đang làm","Phân quyền người dùng","Báo cáo đầu việc cơ bản","Đào tạo và bàn giao tài khoản"]',
       TRUE, 'Phổ biến', 'Liên hệ', '/lien-he', TRUE, 32
WHERE NOT EXISTS (SELECT 1 FROM pricing_plans WHERE slug = 'tech-software')
;

INSERT INTO pricing_plans (name, slug, category, summary, price_label, period, features_json, highlighted, badge, button_label, button_url, visible, sort_order)
SELECT 'AI Agent', 'tech-ai', 'technology',
       'Trợ lý AI trả lời khách và gom yêu cầu cho đội ngũ.',
       'Liên hệ', NULL,
       '["Kịch bản hỏi đáp theo dịch vụ của bạn","Ghi nhận yêu cầu để người phụ trách xử lý","Giới hạn nguồn dữ liệu được phép đọc","Theo dõi hội thoại sau khi chạy"]',
       FALSE, NULL, 'Liên hệ', '/lien-he', TRUE, 33
WHERE NOT EXISTS (SELECT 1 FROM pricing_plans WHERE slug = 'tech-ai')
;

INSERT INTO pricing_plans (name, slug, category, summary, price_label, period, features_json, highlighted, badge, button_label, button_url, visible, sort_order)
SELECT 'Tư vấn triển khai', 'tech-consulting', 'technology',
       'Rà quy trình và chọn công cụ trước khi bỏ chi phí xây mới.',
       'Liên hệ', NULL,
       '["Buổi khảo sát quy trình","Danh sách việc nên làm và việc chưa cần","Đề xuất website, phần mềm hoặc AI Agent","Ước lượng phạm vi trước khi triển khai"]',
       FALSE, NULL, 'Liên hệ', '/lien-he', TRUE, 34
WHERE NOT EXISTS (SELECT 1 FROM pricing_plans WHERE slug = 'tech-consulting')
;

UPDATE page_sections
SET admin_name = 'Ba trụ dịch vụ',
    items_json = $items$[{"cta":"Xem chi tiết","href":"/van-phong-ao","icon":"building","color":"#094690","title":"Văn phòng ảo","points":["Địa chỉ đủ điều kiện cấp phép, kiểm tra thực tế được","Tiếp nhận và thông báo thư từ trong ngày","Phòng họp, phòng tiếp khách đặt theo giờ"],"description":"Địa chỉ đăng ký kinh doanh hợp lệ, tiếp nhận thư từ, phòng họp và tổng đài riêng theo nhu cầu."},{"cta":"Xem chi tiết","href":"/ke-toan","icon":"calculator","color":"#f26321","title":"Tư vấn & hỗ trợ kế toán","points":["Kế toán trọn gói và báo cáo thuế định kỳ","Bảo mật số liệu, chứng từ đối chiếu trước khi nộp","Bàn giao sổ sách đầy đủ mỗi tháng"],"description":"Đội ngũ kế toán hành nghề xử lý sổ sách, báo cáo thuế và trả hồ sơ đúng kỳ để doanh nghiệp không bị giữ chứng từ."},{"cta":"Xem chi tiết","href":"/giai-phap-cong-nghe","icon":"monitor","color":"#129ff8","title":"Giải pháp Công nghệ","points":["Website và phần mềm quản lý theo quy trình doanh nghiệp","AI Agent hỗ trợ chăm sóc khách và nhắc việc nội bộ","Tư vấn, triển khai và bàn giao kèm hướng dẫn"],"description":"Xây website, phần mềm quản lý và trợ lý AI để dữ liệu và công việc nằm ở một nơi."}]$items$,
    updated_at = NOW()
WHERE section_key = 'home-pillars' AND deleted_at IS NULL
;

UPDATE page_sections AS s
SET sort_order = CASE s.section_key
      WHEN 'vo-hero' THEN 10
      WHEN 'vo-intro' THEN 20
      WHEN 'vo-compare' THEN 30
      WHEN 'vo-services' THEN 40
      WHEN 'vo-benefits' THEN 50
      WHEN 'vo-gallery' THEN 60
      WHEN 'vo-process' THEN 70
      WHEN 'vo-faq' THEN 80
      WHEN 'vo-cta' THEN 90
      ELSE s.sort_order
    END,
    updated_at = NOW()
FROM pages p
WHERE s.page_id = p.id AND p.path = '/van-phong-ao' AND s.deleted_at IS NULL
;

UPDATE articles AS a
SET excerpt = LEFT('Bảo mật thông tin tài chính, chứng từ chính xác và bàn giao sổ sách đầy đủ mỗi tháng. ' || COALESCE(a.excerpt, ''), 500),
    content = '<p><strong>Ba điều doanh nghiệp cần trước khi giao sổ sách:</strong> bảo mật thông tin tài chính tuyệt đối, chứng từ và dữ liệu chính xác, bàn giao hồ sơ kế toán đầy đủ mỗi tháng — không để đơn vị cũ giữ hồ sơ.</p>' || COALESCE(a.content, ''),
    updated_at = NOW()
FROM article_categories c
WHERE a.category_id = c.id
  AND a.deleted_at IS NULL
  AND (c.slug ILIKE '%ke-toan%' OR c.name ILIKE '%kế toán%')
  AND COALESCE(a.content, '') NOT ILIKE '%Ba điều doanh nghiệp cần trước khi giao sổ sách%'
;
