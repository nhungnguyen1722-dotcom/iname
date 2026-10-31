CREATE TABLE IF NOT EXISTS office_locations (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  address TEXT NOT NULL,
  price_label VARCHAR(120) NOT NULL DEFAULT 'Từ 350K/tháng',
  cover_url TEXT,
  cover_alt VARCHAR(300),
  gallery_json TEXT NOT NULL DEFAULT '[]',
  amenities_json TEXT NOT NULL DEFAULT '["Lễ tân","Nhận thư","Phòng họp","Wi-Fi"]',
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  visible BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS office_locations_public_order_idx
  ON office_locations (sort_order, id)
  WHERE deleted_at IS NULL AND visible = TRUE AND status = 'published';

CREATE INDEX IF NOT EXISTS articles_category_published_idx
  ON articles (category_id, published_at DESC, id DESC)
  WHERE deleted_at IS NULL AND status = 'published';

CREATE INDEX IF NOT EXISTS articles_published_at_idx
  ON articles (published_at DESC, id DESC)
  WHERE deleted_at IS NULL AND status = 'published';

INSERT INTO office_locations
  (title, slug, excerpt, content, address, price_label, amenities_json, status, visible, sort_order)
SELECT seed.title, seed.slug, seed.excerpt, seed.content, seed.address, seed.price_label,
       seed.amenities_json, seed.status, seed.visible, seed.sort_order
FROM (VALUES
  ('Văn phòng ảo Điện Biên Phủ', 'dien-bien-phu', 'Địa chỉ văn phòng tại khu vực Điện Biên Phủ, Quận 1.', 'Không gian văn phòng ảo tại khu vực Điện Biên Phủ, Quận 1. Vui lòng liên hệ Iname để xác nhận tình trạng dịch vụ và thông tin sử dụng trước khi đăng ký.', 'Số 95 Điện Biên Phủ, Quận 1, TP. Hồ Chí Minh', 'Từ 350K/tháng', '["Lễ tân","Nhận thư","Phòng họp","Wi-Fi"]', 'published', TRUE, 1),
  ('Văn phòng ảo Mạc Đĩnh Chi', 'mac-dinh-chi', 'Địa chỉ văn phòng tại khu vực Mạc Đĩnh Chi, Quận 1.', 'Văn phòng ảo tại khu vực Mạc Đĩnh Chi, Quận 1. Vui lòng liên hệ Iname để xác nhận tình trạng dịch vụ và thông tin sử dụng trước khi đăng ký.', 'Số 36 Mạc Đĩnh Chi, Quận 1, TP. Hồ Chí Minh', 'Từ 350K/tháng', '["Lễ tân","Nhận thư","Phòng họp","Wi-Fi"]', 'published', TRUE, 2),
  ('Văn phòng ảo Pasteur', 'pasteur', 'Địa chỉ văn phòng tại khu vực Pasteur, Quận 1.', 'Văn phòng ảo tại khu vực Pasteur, Quận 1. Vui lòng liên hệ Iname để xác nhận tình trạng dịch vụ và thông tin sử dụng trước khi đăng ký.', 'Số 28-34 Pasteur, Quận 1, TP. Hồ Chí Minh', 'Từ 350K/tháng', '["Lễ tân","Nhận thư","Phòng họp","Wi-Fi"]', 'published', TRUE, 3),
  ('Văn phòng ảo Đề Thám', 'de-tham', 'Địa chỉ văn phòng tại khu vực Đề Thám, Quận 1.', 'Văn phòng ảo tại khu vực Đề Thám, Quận 1. Vui lòng liên hệ Iname để xác nhận tình trạng dịch vụ và thông tin sử dụng trước khi đăng ký.', 'Số 159C Đề Thám, Quận 1, TP. Hồ Chí Minh', 'Từ 350K/tháng', '["Lễ tân","Nhận thư","Phòng họp","Wi-Fi"]', 'published', TRUE, 4),
  ('Văn phòng ảo Bùi Thị Xuân', 'bui-thi-xuan', 'Địa chỉ văn phòng tại khu vực Bùi Thị Xuân, Quận 1.', 'Văn phòng ảo tại khu vực Bùi Thị Xuân, Quận 1. Vui lòng liên hệ Iname để xác nhận tình trạng dịch vụ và thông tin sử dụng trước khi đăng ký.', 'Số 38 Bùi Thị Xuân, Quận 1, TP. Hồ Chí Minh', 'Từ 350K/tháng', '["Lễ tân","Nhận thư","Phòng họp","Wi-Fi"]', 'published', TRUE, 5),
  ('Văn phòng ảo Nguyễn Văn Thủ', 'nguyen-van-thu', 'Địa chỉ văn phòng tại khu vực Nguyễn Văn Thủ, Quận 1.', 'Văn phòng ảo tại khu vực Nguyễn Văn Thủ, Quận 1. Vui lòng liên hệ Iname để xác nhận tình trạng dịch vụ và thông tin sử dụng trước khi đăng ký.', 'Số 215 Nguyễn Văn Thủ, Quận 1, TP. Hồ Chí Minh', 'Từ 350K/tháng', '["Lễ tân","Nhận thư","Phòng họp","Wi-Fi"]', 'published', TRUE, 6)
) AS seed(title, slug, excerpt, content, address, price_label, amenities_json, status, visible, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM office_locations existing WHERE existing.slug = seed.slug);
