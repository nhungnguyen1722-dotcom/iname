-- Apply only after CMS pages exist (fresh install: seed first, then migrate again).
DO $cms_guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pages WHERE deleted_at IS NULL) THEN
    RAISE EXCEPTION 'CMS_CONTENT_MISSING';
  END IF;
END
$cms_guard$;

UPDATE page_sections
SET eyebrow = 'BA MẢNG DỊCH VỤ',
    description = 'Văn phòng ảo, kế toán – thuế và giải pháp công nghệ nằm cạnh nhau. Mỗi mảng có trang riêng, bấm cả thẻ để xem chi tiết.',
    updated_at = NOW()
WHERE section_key = 'home-pillars' AND deleted_at IS NULL
;