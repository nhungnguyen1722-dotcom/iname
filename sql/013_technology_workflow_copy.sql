UPDATE page_sections AS s
SET admin_name = 'Quy trình làm việc',
    eyebrow = 'QUY TRÌNH LÀM VIỆC',
    title = 'Từ ý tưởng đến hiện thực',
    description = 'Chúng tôi luôn đồng hành cùng bạn trong từng bước, đảm bảo dự án được triển khai chuyên nghiệp, đúng tiến độ và đạt hiệu quả cao nhất.',
    items_json = $items$[
      {"title":"Tư vấn & phân tích","description":"Hiểu rõ nhu cầu, đề xuất giải pháp phù hợp."},
      {"title":"Thiết kế & lập trình","description":"Xây dựng giao diện, phát triển theo yêu cầu."},
      {"title":"Kiểm thử & bàn giao","description":"Đảm bảo chất lượng, hướng dẫn sử dụng chi tiết."},
      {"title":"Bảo trì & hỗ trợ","description":"Đồng hành lâu dài, xử lý nhanh vấn đề phát sinh."}
    ]$items$,
    updated_at = NOW()
FROM pages p
WHERE s.page_id = p.id
  AND p.path = '/giai-phap-cong-nghe'
  AND s.section_key = 'tech-steps'
  AND s.deleted_at IS NULL
;
