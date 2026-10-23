UPDATE page_sections
SET eyebrow = 'BA MẢNG DỊCH VỤ',
    description = 'Văn phòng ảo, kế toán – thuế và giải pháp công nghệ nằm cạnh nhau. Mỗi mảng có trang riêng, bấm cả thẻ để xem chi tiết.',
    updated_at = NOW()
WHERE section_key = 'home-pillars' AND deleted_at IS NULL
;