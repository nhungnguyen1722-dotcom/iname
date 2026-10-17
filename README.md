# INAME

Website dịch vụ văn phòng ảo và kế toán, kèm trang quản trị nội dung. Dữ liệu nằm trong PostgreSQL. Bản local dùng database `iname`. Bản đang chạy có thể trỏ tới Neon qua `DATABASE_URL`.

## Chạy local

1. Cài Node.js 20 trở lên.
2. PostgreSQL đang chạy trên máy. Dự án này kết nối cổng `5433` vì bản PostgreSQL 9.3 local đang lắng nghe cổng đó. Database phải tên `iname`.
3. Sao chép `.env.example` thành `.env` và điền `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD`. Mật khẩu quản trị tối thiểu 12 ký tự. Không commit `.env`.
4. Cài thư viện và tạo dữ liệu:

```bash
npm install
npm run db:setup
npm run dev
```

`db:setup` tạo bảng nếu chưa có rồi seed nội dung. Seed bỏ qua nếu đã có trang, nên không ghi đè nội dung quản trị đã sửa. Tài khoản quản trị chỉ được tạo khi bảng admin còn trống.

Website: http://localhost:3000  
Quản trị: http://localhost:3000/admin/login

## Cơ sở dữ liệu

`DATABASE_URL` nhận PostgreSQL local hoặc Neon (`sslmode=require`). File `.env` không được commit. Driver là `pg`. Prisma không dùng với PostgreSQL 9.3 local; Neon là PostgreSQL mới và vẫn dùng cùng schema SQL.

Trang công khai gom menu, footer, giá, dịch vụ và thiết lập trong một truy vấn, rồi giữ kết quả 15 giây. Lưu nội dung trong CMS xóa cache này ngay. Ảnh từ CDN được Next.js đổi sang WebP/AVIF. Tab bảng giá và câu hỏi dùng `memo` để không dựng lại các mục không đổi.

## CMS

Đăng nhập xong có thể sửa trang, từng Section, header, menu, logo, footer, dịch vụ, bảng giá, bài viết, yêu cầu liên hệ và thiết lập. Ảnh Section, kể cả gallery, lưu URL trong PostgreSQL. Website công khai đọc lại dữ liệu đó.

Bài nháp không xuất hiện ở trang công khai. Thêm `?preview=1` khi đang đăng nhập để xem bản nháp.

## Ảnh đã khởi tạo

- Trang chủ, Section “Địa chỉ kinh doanh hợp lệ, sổ sách chuẩn ngay từ ngày đầu”: `van-phong-ao-hero_6a9b5130.png`
- Văn phòng ảo, “Văn phòng ảo của An Việt gồm những gì?”: `van-phong-ao-reception_b1846114.png`
- Văn phòng ảo, “Không gian thực tế”: hai ảnh hero rồi reception
- Kế toán, “Chứng nhận và năng lực”: `ke-toan-doi-ngu_9caaa18c.png`

## Chưa làm

- Lịch sử phiên bản và khôi phục nội dung cũ.
- Nhiều vai trò quản trị. Hiện chỉ có vai trò `admin`.
- Prisma, vì PostgreSQL 9.3 không tương thích.
