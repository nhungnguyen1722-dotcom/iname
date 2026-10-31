-- Apply only after CMS pages exist (fresh install: seed first, then migrate again).
DO $cms_guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pages WHERE deleted_at IS NULL) THEN
    RAISE EXCEPTION 'CMS_CONTENT_MISSING';
  END IF;
END
$cms_guard$;

UPDATE page_sections AS s
SET sort_order = CASE s.section_key
      WHEN 'tech-faq' THEN 50
      WHEN 'tech-cta' THEN 60
      ELSE s.sort_order
    END,
    updated_at = NOW()
FROM pages p
WHERE s.page_id = p.id
  AND p.path = '/giai-phap-cong-nghe'
  AND s.section_key IN ('tech-faq', 'tech-cta')
  AND s.deleted_at IS NULL
;

INSERT INTO page_sections (
  page_id, section_key, section_type, admin_name, eyebrow, title, description,
  items_json, gallery_json, config_json, visible, status, sort_order
)
SELECT p.id, 'tech-stack', 'technology-stack', 'Công nghệ nền tảng', 'CÔNG NGHỆ NỀN TẢNG',
       'Chúng tôi sử dụng các công nghệ hiện đại',
       'Luôn cập nhật và ứng dụng những công nghệ tiên tiến nhất để mang đến sản phẩm ổn định, bảo mật và hiệu quả.',
       $items$[
         {"name":"Next.js","mark":"N","color":"#111827","logoUrl":"https://cdn.simpleicons.org/nextdotjs/000000"},
         {"name":"React","mark":"⚛","color":"#149eca","logoUrl":"https://cdn.simpleicons.org/react/61DAFB"},
         {"name":"Node.js","mark":"N","color":"#68a063","logoUrl":"https://cdn.simpleicons.org/nodedotjs/339933"},
         {"name":"PostgreSQL","mark":"PG","color":"#336791","logoUrl":"/images/postgresql-logo.png"},
         {"name":"AWS","mark":"aws","color":"#232f3e","logoUrl":"/images/aws-logo.png"},
         {"name":"Docker","mark":"▰","color":"#2496ed","logoUrl":"https://cdn.simpleicons.org/docker/2496ED"}
       ]$items$,
       '[]',
       '{"benefitsTitle":"Ưu điểm công nghệ","benefits":["Hiệu suất cao, khả năng mở rộng linh hoạt","Bảo mật, ổn định, cập nhật thường xuyên","Dễ dàng tích hợp với các phần mềm hiện đại","Tối ưu chi phí và thời gian phát triển"]}',
       TRUE, 'published', 40
FROM pages p
WHERE p.path = '/giai-phap-cong-nghe'
  AND NOT EXISTS (
    SELECT 1 FROM page_sections s
    WHERE s.page_id = p.id AND s.section_key = 'tech-stack' AND s.deleted_at IS NULL
  )
;
