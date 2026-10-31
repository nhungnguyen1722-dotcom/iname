-- Apply only after CMS pages exist (fresh install: seed first, then migrate again).
DO $cms_guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pages WHERE deleted_at IS NULL) THEN
    RAISE EXCEPTION 'CMS_CONTENT_MISSING';
  END IF;
END
$cms_guard$;

UPDATE articles
SET
  cover_url = CASE slug
    WHEN 'dia-chi-dang-ky-kinh-doanh-can-dieu-kien-gi' THEN 'https://cdn.enter.pro/resources/uid_100635008/van-phong-ao-hero_6a9b5130.png'
    WHEN 'chon-dia-chi-van-phong-ao-tranh-rui-ro' THEN 'https://cdn.enter.pro/resources/uid_100635008/van-phong-ao-reception_b1846114.png'
    WHEN 'lich-nop-bao-cao-thue-doanh-nghiep-moi' THEN 'https://cdn.enter.pro/resources/uid_100635008/ke-toan-doi-ngu_9caaa18c.png'
    WHEN 'hoa-don-dien-tu-luu-y-khi-moi-su-dung' THEN 'https://cdn.enter.pro/resources/uid_100635008/ke-toan-doi-ngu_9caaa18c.png'
    WHEN 'khi-nao-nen-thue-dich-vu-ke-toan-ngoai' THEN 'https://cdn.enter.pro/resources/uid_100635008/ke-toan-doi-ngu_9caaa18c.png'
    WHEN 'sai-sot-thuong-gap-khi-tu-lam-so-sach' THEN 'https://cdn.enter.pro/resources/uid_100635008/ke-toan-doi-ngu_9caaa18c.png'
  END,
  cover_alt = CASE slug
    WHEN 'dia-chi-dang-ky-kinh-doanh-can-dieu-kien-gi' THEN 'Không gian làm việc hiện đại tại An Việt Office'
    WHEN 'chon-dia-chi-van-phong-ao-tranh-rui-ro' THEN 'Quầy lễ tân tiếp nhận thư từ và giấy tờ thuế'
    ELSE 'Đội ngũ tư vấn và hỗ trợ kế toán'
  END
WHERE slug IN (
  'dia-chi-dang-ky-kinh-doanh-can-dieu-kien-gi',
  'chon-dia-chi-van-phong-ao-tranh-rui-ro',
  'lich-nop-bao-cao-thue-doanh-nghiep-moi',
  'hoa-don-dien-tu-luu-y-khi-moi-su-dung',
  'khi-nao-nen-thue-dich-vu-ke-toan-ngoai',
  'sai-sot-thuong-gap-khi-tu-lam-so-sach'
)
AND (cover_url IS NULL OR BTRIM(cover_url) = '');
