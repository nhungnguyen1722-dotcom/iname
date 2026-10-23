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
         {"name":"Next.js","mark":"N","color":"#111827"},
         {"name":"React","mark":"⚛","color":"#149eca"},
         {"name":"Node.js","mark":"N","color":"#68a063"},
         {"name":"PostgreSQL","mark":"PG","color":"#336791"},
         {"name":"AWS","mark":"aws","color":"#232f3e"},
         {"name":"Docker","mark":"▰","color":"#2496ed"}
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
