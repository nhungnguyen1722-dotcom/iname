import pg from "pg";
import { pgConfig } from "./pg-config.mjs";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf8");
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const dbUrl = match ? match[1] : "";

const pool = new pg.Pool(pgConfig(dbUrl));

async function main() {
  console.log("Starting data synchronization for Phase 1...");

  // 1. Ensure columns exist on office_locations
  await pool.query(`
    ALTER TABLE office_locations ADD COLUMN IF NOT EXISTS banner_url TEXT;
    ALTER TABLE office_locations ADD COLUMN IF NOT EXISTS banner_alt VARCHAR(300);
  `);

  // 2. Data for 6 Office Locations
  const locationsData = [
    {
      slug: "dien-bien-phu",
      title: "Văn phòng ảo Điện Biên Phủ",
      address: "Số 95 Điện Biên Phủ, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh",
      price_label: "Từ 350K/tháng",
      cover_url: "/uploads/locations/dien-bien-phu.jpg",
      cover_alt: "Văn phòng ảo Điện Biên Phủ Quận 1",
      banner_url: "/uploads/banners/dien-bien-phu-banner.jpg",
      banner_alt: "Banner văn phòng ảo Điện Biên Phủ Quận 1",
      excerpt: "Văn phòng ảo tại số 95 Điện Biên Phủ, Quận 1 — vị trí đắc địa giáp ranh Quận 3 và Bình Thạnh, địa chỉ đăng ký kinh doanh uy tín hàng đầu cho doanh nghiệp.",
      content: `Văn phòng ảo Điện Biên Phủ là một trong những địa điểm chiến lược hàng đầu trong hệ thống Iname, tọa lạc tại số 95 Điện Biên Phủ, Phường Đa Kao, Quận 1 — trung tâm tài chính và thương mại sầm uất bậc nhất TP. Hồ Chí Minh.

Vị trí địa lý đắc địa:
- Nằm ngay trục đường huyết mạch Điện Biên Phủ, dễ dàng kết nối nhanh chóng sang Quận 3, Quận Bình Thạnh, Phú Nhuận và khu đô thị Thủ Thiêm chỉ trong 5-10 phút di chuyển.
- Khu vực Đa Kao tập trung hàng loạt tòa nhà văn phòng cao ốc, ngân hàng lớn (Vietcombank, BIDV, Techcombank), văn phòng công chứng và cơ quan nhà nước, tạo điều kiện giao dịch hành chính vô cùng thuận lợi.
- Xung quanh là hệ thống nhà hàng, khách sạn và quán cà phê cao cấp, lý tưởng để gặp gỡ đối tác và khách hàng quan trọng.

Ưu thế giao dịch vượt trội:
- Sở hữu địa chỉ kinh doanh tại Quận 1 nâng tầm uy tín doanh nghiệp ngay từ bảng hiệu, hồ sơ năng lực và hợp đồng thương mại.
- Tòa nhà chuẩn văn phòng hiện đại với sảnh lễ tân sang trọng, hệ thống an ninh 24/7, thang máy tốc độ cao và khu vực tiếp khách chuyên nghiệp.
- Doanh nghiệp được đặt bảng tên Mica trang trọng tại sảnh tòa nhà, lễ tân tiếp đón thư từ, bưu phẩm và thông báo tức thì qua email/SMS.`,
      gallery: [
        { url: "/uploads/locations/dien-bien-phu.jpg", alt: "Sảnh đón tiếp và lễ tân Điện Biên Phủ", caption: "Sảnh lễ tân hiện đại tại số 95 Điện Biên Phủ, Quận 1" },
        { url: "/uploads/gallery/coworking.jpg", alt: "Không gian làm việc chung", caption: "Không gian làm việc chung tiện nghi, tràn ngập ánh sáng tự nhiên" },
        { url: "/uploads/gallery/meeting.jpg", alt: "Phòng họp tiêu chuẩn quốc tế", caption: "Phòng họp hiện đại trang bị màn hình trình chiếu và video conference" },
        { url: "/uploads/gallery/directory-board.jpg", alt: "Bảng tên doanh nghiệp tại tòa nhà", caption: "Bảng tên công ty sang trọng đặt ngay tại sảnh chính tòa nhà" },
        { url: "/uploads/gallery/lounge.jpg", alt: "Khu vực tiếp khách thương gia", caption: "Sảnh tiếp khách đối tác lịch thiệp với tầm nhìn trung tâm thành phố" },
        { url: "/uploads/gallery/private-office.jpg", alt: "Phòng làm việc riêng và tiện ích", caption: "Không gian làm việc riêng biệt, bảo mật và chuyên nghiệp" },
        { url: "/uploads/gallery/pantry.jpg", alt: "Khu vực Pantry tiện ích", caption: "Quầy pantry phục vụ trà, cà phê và nước uống miễn phí" },
      ],
      amenities: ["Lễ tân", "Nhận thư", "Phòng họp", "Wi-Fi", "Bảng tên", "Tiếp khách"],
      sort_order: 1,
    },
    {
      slug: "mac-dinh-chi",
      title: "Văn phòng ảo Mạc Đĩnh Chi",
      address: "Số 36 Mạc Đĩnh Chi, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh",
      price_label: "Từ 350K/tháng",
      cover_url: "/uploads/locations/mac-dinh-chi.jpg",
      cover_alt: "Văn phòng ảo Mạc Đĩnh Chi Quận 1",
      banner_url: "/uploads/banners/mac-dinh-chi-banner.jpg",
      banner_alt: "Banner văn phòng ảo Mạc Đĩnh Chi Quận 1",
      excerpt: "Tọa lạc tại tuyến phố tài chính Mạc Đĩnh Chi, Quận 1 — kết nối trực tiếp Lê Duẩn, Nguyễn Đình Chiểu, mang lại hình ảnh chuyên nghiệp và tin cậy cho doanh nghiệp.",
      content: `Văn phòng ảo Mạc Đĩnh Chi tọa lạc tại số 36 Mạc Đĩnh Chi, Phường Đa Kao, Quận 1 — tuyến phố tài chính văn phòng lâu đời và uy tín bậc nhất trung tâm Sài Gòn.

Vị trí địa lý đắc địa:
- Kết nối trực tiếp các tuyến đường danh giá như Lê Duẩn, Nguyễn Đình Chiểu, Trần Cao Vân và Công trường Quốc Tế (Hồ Con Rùa).
- Liền kề các Tổng lãnh sự quán (Mỹ, Pháp, Anh, Đức), trung tâm thương mại Diamond Plaza, Nhà thờ Đức Bà và Bưu điện Thành phố.
- Giao thông thông thoáng, nhiều bãi giữ xe ô tô và xe máy thuận tiện cho khách hàng và đối tác đến làm việc.

Ưu thế thương mại vượt trội:
- Tuyến đường tập trung nhiều tập đoàn đa quốc gia, công ty kiểm toán, luật sư và tài chính hàng đầu.
- Không gian văn phòng thiết kế tinh tế với vật liệu gỗ và kính sang trọng, mang lại cảm giác thân thiện nhưng vẫn trang trọng.
- Đầy đủ tiện ích văn phòng ảo: tiếp nhận thư tín, phòng họp theo giờ, hỗ trợ in ấn, scan chứng từ và chuyên viên pháp lý đồng hành.`,
      gallery: [
        { url: "/uploads/locations/mac-dinh-chi.jpg", alt: "Sảnh lễ tân The Nexus Mạc Đĩnh Chi", caption: "Sảnh đón tiếp cao cấp tại số 36 Mạc Đĩnh Chi, Quận 1" },
        { url: "/uploads/gallery/coworking.jpg", alt: "Không gian làm việc chung", caption: "Khu làm việc linh hoạt, yên tĩnh và sáng tạo" },
        { url: "/uploads/gallery/meeting.jpg", alt: "Phòng họp chuyên nghiệp", caption: "Phòng họp cách âm tiêu chuẩn cao cho các cuộc đàm phán" },
        { url: "/uploads/gallery/directory-board.jpg", alt: "Bảng danh bạ doanh nghiệp", caption: "Bảng tên doanh nghiệp hiển thị trang trọng tại vị trí dễ quan sát" },
        { url: "/uploads/gallery/lounge.jpg", alt: "Khu vực tiếp khách VIP", caption: "Không gian đón tiếp đối tác sang trọng, tạo ấn tượng tốt đẹp" },
        { url: "/uploads/gallery/private-office.jpg", alt: "Phòng làm việc riêng", caption: "Phòng làm việc đầy đủ nội thất cao cấp" },
      ],
      amenities: ["Lễ tân", "Nhận thư", "Phòng họp", "Wi-Fi", "Bảng tên", "Tiếp khách"],
      sort_order: 2,
    },
    {
      slug: "pasteur",
      title: "Văn phòng ảo Pasteur",
      address: "Số 28-34 Pasteur, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
      price_label: "Từ 350K/tháng",
      cover_url: "/uploads/locations/pasteur.jpg",
      cover_alt: "Văn phòng ảo Pasteur Quận 1",
      banner_url: "/uploads/banners/pasteur-banner.jpg",
      banner_alt: "Banner văn phòng ảo Pasteur Quận 1",
      excerpt: "Địa chỉ kinh doanh trung tâm tài chính Bến Nghé, Quận 1 — nằm trên trục đường Pasteur danh giá, gần các ngân hàng lớn và cơ quan nhà nước.",
      content: `Văn phòng ảo Pasteur tọa lạc tại số 28-34 Pasteur, Phường Bến Nghé, Quận 1 — trái tim của khu phố Wall Sài Gòn, nơi tập trung Ngân hàng Nhà nước và các định chế tài chính lớn.

Vị trí địa lý đắc địa:
- Nằm ngay giao lộ trung tâm, tiếp giáp Nguyễn Công Trứ, Hàm Nghi, Nam Kỳ Khởi Nghĩa và phố đi bộ Nguyễn Huệ.
- Chỉ cách Trụ sở Ngân hàng Nhà nước, Sở Giao dịch Chứng khoán TP.HCM (HOSE) và Bitexco Financial Tower vài bước chân.
- Khả năng kết nối giao thông hoàn hảo tới mọi quận nội thành qua hầm Thủ Thiêm và cầu Khánh Hội.

Ưu thế thương mại vượt trội:
- Địa chỉ Bến Nghé - Quận 1 mang giá trị định vị thương hiệu tối cao, tạo niềm tin tuyệt đối với ngân hàng, nhà đầu tư và đối tác quốc tế.
- Tòa nhà chuẩn văn phòng cao cấp với sảnh đón tiếp ốp đá cẩm thạch sang trọng, đội ngũ lễ tân thông thạo ngoại ngữ.
- Trang bị phòng hội thảo, phòng họp trực tuyến tiêu chuẩn cao, hỗ trợ tối đa cho các buổi ký kết hợp đồng quan trọng.`,
      gallery: [
        { url: "/uploads/locations/pasteur.jpg", alt: "Sảnh đón tiếp Pasteur Executive Tower", caption: "Sảnh đón tiếp quy mô lớn tại số 28-34 Pasteur, Quận 1" },
        { url: "/uploads/gallery/coworking.jpg", alt: "Không gian làm việc linh hoạt", caption: "Khu vực làm việc mở với thiết kế hiện đại, đầy đủ tiện ích" },
        { url: "/uploads/gallery/meeting.jpg", alt: "Phòng họp hội nghị cao cấp", caption: "Phòng họp trang bị thiết bị họp trực tuyến hiện đại" },
        { url: "/uploads/gallery/directory-board.jpg", alt: "Bảng tên công ty tại tòa nhà", caption: "Bảng tên công ty kim loại cao cấp tại sảnh chính" },
        { url: "/uploads/gallery/lounge.jpg", alt: "Lounge tiếp khách sang trọng", caption: "Khu vực tiếp khách view thành phố lộng lẫy" },
        { url: "/uploads/gallery/pantry.jpg", alt: "Coffee bar & Pantry", caption: "Khu vực giải khát và giao lưu kết nối doanh nghiệp" },
      ],
      amenities: ["Lễ tân", "Nhận thư", "Phòng họp", "Wi-Fi", "Bảng tên", "Tiếp khách"],
      sort_order: 3,
    },
    {
      slug: "de-tham",
      title: "Văn phòng ảo Đề Thám",
      address: "Số 159C Đề Thám, Phường Cô Giang, Quận 1, TP. Hồ Chí Minh",
      price_label: "Từ 350K/tháng",
      cover_url: "/uploads/locations/de-tham.jpg",
      cover_alt: "Văn phòng ảo Đề Thám Quận 1",
      banner_url: "/uploads/banners/de-tham-banner.jpg",
      banner_alt: "Banner văn phòng ảo Đề Thám Quận 1",
      excerpt: "Văn phòng ảo trung tâm Quận 1 tại Đề Thám — giao thương sầm uất, thuận tiện di chuyển sang Quận 4, Quận 5 và đại lộ Võ Văn Kiệt.",
      content: `Văn phòng ảo Đề Thám tọa lạc tại số 159C Đề Thám, Phường Cô Giang, Quận 1 — vị trí giao thoa kinh tế sôi động giữa trung tâm thương mại Quận 1 và cửa ngõ phía Nam thành phố.

Vị trí địa lý đắc địa:
- Nằm gần giao lộ Trần Hưng Đạo, Nguyễn Thái Học và đại lộ Võ Văn Kiệt, giao thông thông suốt không lo kẹt xe.
- Kết nối nhanh chóng sang Quận 4, Quận 5, Quận 8 và khu đô thị Nam Sài Gòn chỉ trong 5 phút.
- Gần chợ Bến Thành, phố Tây Bùi Viện và các khách sạn du lịch quốc tế, rất thuận tiện cho các doanh nghiệp thương mại, dịch vụ, du lịch và xuất nhập khẩu.

Ưu thế thương mại vượt trội:
- Chi phí thuê cực kỳ tối ưu cho một địa chỉ chính thức tại Quận 1, giúp tiết kiệm đến 90% chi phí vận hành văn phòng cố định.
- Tòa nhà hiện đại, mặt tiền rộng rãi, bãi đậu xe máy và ô tô thuận tiện cho giao dịch.
- Đội ngũ lễ tân chuyên nghiệp xử lý thư tín, hỗ trợ tiếp nhận văn bản thuế và cơ quan chức năng nhanh chóng, chuẩn xác.`,
      gallery: [
        { url: "/uploads/locations/de-tham.jpg", alt: "Mặt tiền và sảnh đón tiếp Đề Thám Tower", caption: "Tòa nhà văn phòng hiện đại tại số 159C Đề Thám, Quận 1" },
        { url: "/uploads/gallery/coworking.jpg", alt: "Không gian làm việc chung năng động", caption: "Không gian làm việc mở trẻ trung, năng động và sáng tạo" },
        { url: "/uploads/gallery/meeting.jpg", alt: "Phòng họp hội thảo", caption: "Phòng họp trang bị máy chiếu và bảng viết tiện lợi" },
        { url: "/uploads/gallery/directory-board.jpg", alt: "Bảng tên doanh nghiệp", caption: "Bảng tên công ty được lắp đặt chuyên nghiệp" },
        { url: "/uploads/gallery/lounge.jpg", alt: "Sảnh chờ tiếp khách", caption: "Khu vực tiếp khách đối tác lịch thiệp" },
        { url: "/uploads/gallery/private-office.jpg", alt: "Văn phòng làm việc", caption: "Phòng làm việc riêng tư, đầy đủ trang thiết bị" },
      ],
      amenities: ["Lễ tân", "Nhận thư", "Phòng họp", "Wi-Fi", "Bảng tên", "Tiếp khách"],
      sort_order: 4,
    },
    {
      slug: "bui-thi-xuan",
      title: "Văn phòng ảo Bùi Thị Xuân",
      address: "Số 38 Bùi Thị Xuân, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
      price_label: "Từ 350K/tháng",
      cover_url: "/uploads/locations/bui-thi-xuan.jpg",
      cover_alt: "Văn phòng ảo Bùi Thị Xuân Quận 1",
      banner_url: "/uploads/banners/bui-thi-xuan-banner.jpg",
      banner_alt: "Banner văn phòng ảo Bùi Thị Xuân Quận 1",
      excerpt: "Khu vực Bến Thành - Bùi Thị Xuân sầm uất, trung tâm thương mại và dịch vụ sôi động, giúp doanh nghiệp nâng tầm uy tín thương hiệu.",
      content: `Văn phòng ảo Bùi Thị Xuân tọa lạc tại số 38 Bùi Thị Xuân, Phường Bến Thành, Quận 1 — một trong những phường danh giá và trung tâm nhất của TP. Hồ Chí Minh.

Vị trí địa lý đắc địa:
- Liền kề Công viên Tao Đàn, đường Cách Mạng Tháng Tám, Tôn Thất Tùng và Nguyễn Thị Minh Khai.
- Chỉ cách chợ Bến Thành và tuyến Metro số 1 Bến Thành - Suối Tiên 3 phút di chuyển.
- Xung quanh tập trung nhiều bệnh viện đầu ngành, trường đại học, chi cục thuế Quận 1 và các trung tâm thương mại sầm uất.

Ưu thế thương mại vượt trội:
- Địa chỉ phường Bến Thành, Quận 1 khẳng định tiềm lực và uy tín vững chắc của doanh nghiệp trước khách hàng.
- Không gian văn phòng với thiết kế nội thất gỗ ấm cúng, sang trọng và tràn đầy năng lượng tích cực.
- Hỗ trợ dịch vụ trọn gói từ địa chỉ kinh doanh, phòng họp tiếp khách, kế toán thuế đến thủ tục pháp lý thành lập công ty.`,
      gallery: [
        { url: "/uploads/locations/bui-thi-xuan.jpg", alt: "Sảnh đón tiếp BTX Corporate Center", caption: "Sảnh lễ tân ấm cúng, sang trọng tại 38 Bùi Thị Xuân, Quận 1" },
        { url: "/uploads/gallery/coworking.jpg", alt: "Không gian làm việc chung cao cấp", caption: "Bàn làm việc rộng rãi cùng ghế công thái học êm ái" },
        { url: "/uploads/gallery/meeting.jpg", alt: "Phòng họp hiện đại", caption: "Phòng họp tiêu chuẩn quốc tế phục vụ đàm phán quan trọng" },
        { url: "/uploads/gallery/directory-board.jpg", alt: "Bảng tên doanh nghiệp tại sảnh", caption: "Bảng tên công ty trang trọng tại sảnh chính tòa nhà" },
        { url: "/uploads/gallery/lounge.jpg", alt: "Khu vực tiếp khách VIP", caption: "Sảnh tiếp khách sang trọng, thư thái" },
        { url: "/uploads/gallery/pantry.jpg", alt: "Quầy pantry & đồ uống", caption: "Khu vực pantry tiện nghi phục vụ khách hàng" },
      ],
      amenities: ["Lễ tân", "Nhận thư", "Phòng họp", "Wi-Fi", "Bảng tên", "Tiếp khách"],
      sort_order: 5,
    },
    {
      slug: "nguyen-van-thu",
      title: "Văn phòng ảo Nguyễn Văn Thủ",
      address: "Số 215 Nguyễn Văn Thủ, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh",
      price_label: "Từ 350K/tháng",
      cover_url: "/uploads/locations/nguyen-van-thu.jpg",
      cover_alt: "Văn phòng ảo Nguyễn Văn Thủ Quận 1",
      banner_url: "/uploads/banners/nguyen-van-thu-banner.jpg",
      banner_alt: "Banner văn phòng ảo Nguyễn Văn Thủ Quận 1",
      excerpt: "Tuyến phố văn phòng cao cấp rợp bóng cây xanh tại Đa Kao, Quận 1 — không gian yên tĩnh, lịch sự, lý tưởng để đặt bảng tên và tiếp khách đối tác.",
      content: `Văn phòng ảo Nguyễn Văn Thủ tọa lạc tại số 215 Nguyễn Văn Thủ, Phường Đa Kao, Quận 1 — con đường rợp bóng cây xanh yên bình, nơi tập trung nhiều trụ sở công ty công nghệ, tư vấn quốc tế và văn phòng đại diện.

Vị trí địa lý đắc địa:
- Nằm song song với Nguyễn Đình Chiểu và Điện Biên Phủ, giao cắt với Phùng Khắc Khoan, Mạc Đĩnh Chi và Hai Bà Trưng.
- Môi trường yên tĩnh, an ninh cao, vỉa hè rộng rãi thoáng mát rất thuận lợi cho việc dừng đỗ xe và tiếp đón khách hàng.
- Thuận tiện di chuyển ra bờ kè Hoàng Sa - Trường Sa sang Bình Thạnh, Phú Nhuận hoặc xuôi về trung tâm Quận 1 chỉ vài phút.

Ưu thế thương mại vượt trội:
- Thiết kế tòa nhà phong cách boutique hiện đại, thanh lịch với tông màu đồng và đá cẩm thạch sang trọng.
- Bảng tên công ty trang trọng, tạo dấu ấn chuyên nghiệp trong mắt đối tác khi đến liên hệ công việc.
- Đầy đủ tiện ích văn phòng chia sẻ: lễ tân thân thiện, Wi-Fi tốc độ cao, máy in-scan đa năng, phòng họp riêng tư.`,
      gallery: [
        { url: "/uploads/locations/nguyen-van-thu.jpg", alt: "Sảnh đón tiếp NVT Business Center", caption: "Sảnh lễ tân sang trọng tại 215 Nguyễn Văn Thủ, Quận 1" },
        { url: "/uploads/gallery/coworking.jpg", alt: "Không gian làm việc chung", caption: "Khu vực làm việc tràn ngập cây xanh và ánh sáng" },
        { url: "/uploads/gallery/meeting.jpg", alt: "Phòng họp cách âm", caption: "Phòng họp trang bị màn hình chất lượng cao" },
        { url: "/uploads/gallery/directory-board.jpg", alt: "Bảng tên doanh nghiệp", caption: "Bảng tên công ty được lắp đặt chỉn chu, chuyên nghiệp" },
        { url: "/uploads/gallery/lounge.jpg", alt: "Sảnh chờ tiếp đối tác", caption: "Không gian tiếp khách lịch lãm, yên tĩnh" },
        { url: "/uploads/gallery/private-office.jpg", alt: "Phòng làm việc tiện nghi", caption: "Không gian văn phòng trọn gói cao cấp" },
      ],
      amenities: ["Lễ tân", "Nhận thư", "Phòng họp", "Wi-Fi", "Bảng tên", "Tiếp khách"],
      sort_order: 6,
    },
  ];

  for (const loc of locationsData) {
    const existing = await pool.query("SELECT id FROM office_locations WHERE slug = $1", [loc.slug]);
    if (existing.rows.length) {
      await pool.query(
        `UPDATE office_locations SET
          title = $1, address = $2, price_label = $3, cover_url = $4, cover_alt = $5,
          banner_url = $6, banner_alt = $7, excerpt = $8, content = $9,
          gallery_json = $10, amenities_json = $11, sort_order = $12,
          visible = TRUE, status = 'published', updated_at = NOW()
         WHERE slug = $13`,
        [
          loc.title,
          loc.address,
          loc.price_label,
          loc.cover_url,
          loc.cover_alt,
          loc.banner_url,
          loc.banner_alt,
          loc.excerpt,
          loc.content,
          JSON.stringify(loc.gallery),
          JSON.stringify(loc.amenities),
          loc.sort_order,
          loc.slug,
        ]
      );
      console.log(`Updated office location: ${loc.title}`);
    } else {
      await pool.query(
        `INSERT INTO office_locations
          (title, slug, address, price_label, cover_url, cover_alt, banner_url, banner_alt, excerpt, content, gallery_json, amenities_json, sort_order, visible, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE, 'published')`,
        [
          loc.title,
          loc.slug,
          loc.address,
          loc.price_label,
          loc.cover_url,
          loc.cover_alt,
          loc.banner_url,
          loc.banner_alt,
          loc.excerpt,
          loc.content,
          JSON.stringify(loc.gallery),
          JSON.stringify(loc.amenities),
          loc.sort_order,
        ]
      );
      console.log(`Inserted office location: ${loc.title}`);
    }
  }

  // 3. Update /ke-toan section title to "Các dịch vụ kế toán"
  const keToanPage = await pool.query("SELECT id FROM pages WHERE path = '/ke-toan'");
  if (keToanPage.rows.length) {
    const pageId = keToanPage.rows[0].id;
    await pool.query(
      `UPDATE page_sections SET
        title = 'Các dịch vụ kế toán',
        admin_name = 'Các dịch vụ kế toán',
        updated_at = NOW()
       WHERE page_id = $1 AND section_type = 'cards' AND (title ILIKE '%dịch vụ kế toán%' OR admin_name ILIKE '%dịch vụ kế toán%')`,
      [pageId]
    );
    console.log("Updated /ke-toan section title to 'Các dịch vụ kế toán'");
  }

  // 4. Update /van-phong-ao hero tags to empty (Xóa bỏ các thẻ tag)
  const vpaPage = await pool.query("SELECT id FROM pages WHERE path = '/van-phong-ao'");
  if (vpaPage.rows.length) {
    const pageId = vpaPage.rows[0].id;
    await pool.query(
      `UPDATE page_sections SET
        items_json = '[]',
        updated_at = NOW()
       WHERE page_id = $1 AND section_type = 'page-hero'`,
      [pageId]
    );
    console.log("Cleared tags on /van-phong-ao hero banner");
  }

  // 5. Update /lien-he hero image to visual asset
  const contactPage = await pool.query("SELECT id FROM pages WHERE path = '/lien-he'");
  if (contactPage.rows.length) {
    const pageId = contactPage.rows[0].id;
    await pool.query(
      `UPDATE page_sections SET
        image_url = '/uploads/contact-hero.jpg',
        image_alt = 'Trao đổi với chuyên viên tư vấn Iname',
        updated_at = NOW()
       WHERE page_id = $1 AND section_type = 'page-hero'`,
      [pageId]
    );
    console.log("Updated /lien-he hero image to /uploads/contact-hero.jpg");
  }

  // 6. Ensure Category 'Kế toán' exists in article_categories
  let catRows = await pool.query("SELECT id FROM article_categories WHERE slug = 'ke-toan'");
  let keToanCatId = catRows.rows[0]?.id;
  if (!keToanCatId) {
    const insertedCat = await pool.query(
      "INSERT INTO article_categories (name, slug, sort_order) VALUES ('Kế toán', 'ke-toan', 4) RETURNING id"
    );
    keToanCatId = insertedCat.rows[0].id;
    console.log("Created Kế toán category with id:", keToanCatId);
  }

  // 7. Sync the 7 Accounting Articles into articles table and services table
  const accountingArticles = [
    {
      title: "Kế toán trọn gói",
      slug: "ke-toan-tron-goi",
      excerpt: "Xử lý chứng từ đầu vào – đầu ra, hạch toán, lập sổ sách, báo cáo tài chính và gửi bảng tổng hợp hàng tháng cho ban điều hành.",
      cover_url: "https://cdn.enter.pro/resources/uid_100635008/ke-toan-doi-ngu_9caaa18c.png",
      content: `<h2>1. Tổng quan dịch vụ kế toán trọn gói Iname</h2>
<p>Dịch vụ kế toán trọn gói của Iname được thiết kế toàn diện nhằm giúp các doanh nghiệp vừa và nhỏ, doanh nghiệp mới thành lập hoặc hộ kinh doanh cá thể hoàn toàn yên tâm về công tác sổ sách, báo cáo tài chính và nghĩa vụ thuế pháp lý mà không cần tốn chi phí xây dựng phòng kế toán cồng kềnh.</p>

<h2>2. Các công việc thực hiện hàng tháng</h2>
<ul>
  <li>Tiếp nhận, kiểm tra tính hợp pháp, hợp lệ và hợp lý của toàn bộ hóa đơn, chứng từ đầu vào và đầu ra.</li>
  <li>Hạch toán chi tiết các nghiệp vụ kinh tế phát sinh vào phần mềm kế toán chuyên nghiệp theo chuẩn mực kế toán Việt Nam (VAS).</li>
  <li>Lập phiếu thu, phiếu chi, phiếu nhập kho, xuất kho và chứng từ ngân hàng.</li>
  <li>Lập bảng tính lương, trích nộp bảo hiểm xã hội và hạch toán thuế thu nhập cá nhân (TNCN).</li>
  <li>Gửi bảng tổng hợp kết quả hoạt động kinh doanh hàng tháng cho ban giám đốc nắm bắt tình hình tài chính.</li>
</ul>

<h2>3. Các công việc thực hiện hàng quý và quyết toán năm</h2>
<ul>
  <li>Lập tờ khai thuế giá trị gia tăng (GTGT) tạm tính theo quý.</li>
  <li>Tạm tính số thuế thu nhập doanh nghiệp (TNDN) phải nộp theo quy định.</li>
  <li>Lập báo cáo tình hình sử dụng hóa đơn điện tử (nếu thuộc đối tượng yêu cầu).</li>
  <li>Cuối năm tài chính: Lập bộ Báo cáo tài chính đầy đủ (Bảng cân đối kế toán, Báo cáo kết quả HĐKD, Báo cáo lưu chuyển tiền tệ, Thuyết minh BCTC).</li>
  <li>Lập tờ khai Quyết toán thuế TNDN và Quyết toán thuế TNCN năm.</li>
</ul>

<h2>4. Cam kết trách nhiệm của Iname</h2>
<p>Iname cam kết chịu trách nhiệm bồi thường 100% nếu phát sinh tiền phạt do sai sót hoặc nộp chậm báo cáo thuộc lỗi của chuyên viên chúng tôi. Đội ngũ kế toán trưởng giàu kinh nghiệm sẽ trực tiếp ký duyệt hồ sơ và đại diện giải trình với cơ quan thuế khi có quyết định thanh tra.</p>`,
    },
    {
      title: "Báo cáo thuế định kỳ",
      slug: "bao-cao-thue-dinh-ky",
      excerpt: "Kê khai thuế giá trị gia tăng, thu nhập doanh nghiệp, thu nhập cá nhân và các loại thuế khác đúng kỳ hạn, kèm bảng đối chiếu hóa đơn.",
      cover_url: "https://cdn.enter.pro/resources/uid_100635008/ke-toan-doi-ngu_9caaa18c.png",
      content: `<h2>1. Tầm quan trọng của việc nộp báo cáo thuế đúng hạn</h2>
<p>Kê khai thuế đúng hạn và chính xác là nghĩa vụ bắt buộc của mọi doanh nghiệp hoạt động tại Việt Nam. Bất kỳ sự chậm trễ hay sai sót nào trong tờ khai đều có thể dẫn đến các mức phạt hành chính từ cơ quan thuế và gây ảnh hưởng tiêu cực đến điểm uy tín thuế của công ty.</p>

<h2>2. Danh mục báo cáo thuế định kỳ Iname phụ trách</h2>
<ul>
  <li><strong>Thuế giá trị gia tăng (GTGT):</strong> Kê khai theo tháng (trước ngày 20 tháng sau) hoặc theo quý (trước ngày cuối cùng của tháng đầu quý sau).</li>
  <li><strong>Thuế thu nhập cá nhân (TNCN):</strong> Kê khai tiền lương, tiền công hàng tháng hoặc quý kèm danh sách lao động được khấu trừ thuế.</li>
  <li><strong>Thuế thu nhập doanh nghiệp (TNDN):</strong> Tính toán số thuế TNDN tạm nộp hàng quý đảm bảo không thấp hơn 80% số thuế thực tế phát sinh cả năm.</li>
  <li><strong>Lệ phí môn bài:</strong> Kê khai và nộp tờ khai môn bài cho doanh nghiệp mới thành lập hoặc khi có thay đổi vốn điều lệ.</li>
</ul>

<h2>3. Quy trình rà soát và kiểm soát rủi ro</h2>
<p>Trước khi nộp bất kỳ tờ khai nào, chuyên viên Iname luôn thực hiện đối chiếu chéo dữ liệu hóa đơn điện tử trên cổng Tổng cục Thuế với bảng kê mua vào - bán ra của doanh nghiệp, giúp phát hiện sớm các hóa đơn bị hủy, sai mã số thuế hoặc rủi ro nhà cung cấp bỏ trốn.</p>`,
    },
    {
      title: "Quyết toán thuế",
      slug: "quyet-toan-thue",
      excerpt: "Chuẩn bị hồ sơ quyết toán năm, giải trình số liệu, làm việc trực tiếp với cơ quan thuế khi được yêu cầu bổ sung.",
      cover_url: "https://cdn.enter.pro/resources/uid_100635008/ke-toan-doi-ngu_9caaa18c.png",
      content: `<h2>1. Quyết toán thuế là gì và khi nào cần thực hiện?</h2>
<p>Quyết toán thuế là việc doanh nghiệp xác định lại số thuế thực tế phải nộp cho nhà nước trong một năm tài chính, hoặc khi doanh nghiệp giải thể, sáp nhập, chia tách hoặc kết thúc chu kỳ thanh tra định kỳ 3 - 5 năm một lần.</p>

<h2>2. Nội dung dịch vụ quyết toán thuế tại Iname</h2>
<ul>
  <li>Kiểm tra, rà soát lại toàn bộ hệ thống hóa đơn, chứng từ kế toán trong suốt niên độ tài chính.</li>
  <li>Điều chỉnh các sai lệch, bổ sung hồ sơ chứng từ hợp lệ để bảo vệ chi phí được trừ khi tính thuế TNDN.</li>
  <li>Lập hồ sơ quyết toán thuế TNDN, quyết toán thuế TNCN và bộ Báo cáo tài chính năm.</li>
  <li>Đại diện doanh nghiệp in ấn, đóng dấu, lưu trữ sổ sách kế toán hoàn chỉnh theo đúng chuẩn quy định pháp luật.</li>
  <li>Trực tiếp làm việc, giải trình chi tiết từng khoản mục số liệu với đoàn thanh tra, kiểm tra thuế.</li>
</ul>

<h2>3. Lợi ích khi sử dụng dịch vụ của Iname</h2>
<p>Doanh nghiệp tiết kiệm tối đa thời gian, tránh bị truy thu thuế không đáng có và an tâm phát triển kinh doanh khi có chuyên gia kế toán đồng hành bảo vệ quyền lợi hợp pháp.</p>`,
    },
    {
      title: "Rà soát sổ sách trước thanh tra",
      slug: "ra-soat-so-sach-truoc-thanh-tra",
      excerpt: "Kiểm tra tính đầy đủ của hóa đơn, chứng từ, đối chiếu ngân hàng và đưa ra danh sách rủi ro cần xử lý trước khi cơ quan thuế làm việc.",
      cover_url: "https://cdn.enter.pro/resources/uid_100635008/ke-toan-doi-ngu_9caaa18c.png",
      content: `<h2>1. Vì sao cần rà soát sổ sách kế toán trước thanh tra?</h2>
<p>Nhiều doanh nghiệp trong quá trình hoạt động thường thay đổi nhân sự kế toán, dẫn đến tình trạng sổ sách kế toán bị đứt gãy, thiếu chứng từ gốc, hạch toán sai tài khoản hoặc hóa đơn đầu vào không hợp lệ. Khi nhận được quyết định thanh tra thuế, việc không chuẩn bị kịp thời sẽ dẫn đến nguy cơ bị loại chi phí và phạt nặng.</p>

<h2>2. Các hạng mục rà soát chuyên sâu</h2>
<ul>
  <li>Rà soát số dư các tài khoản tiền mặt (TK 111), tiền gửi ngân hàng (TK 112), tránh tình trạng âm quỹ tiền mặt ảo.</li>
  <li>Kiểm tra công nợ phải thu, phải trả (TK 131, 331), đối chiếu biên bản xác nhận công nợ cuối năm.</li>
  <li>Kiểm tra hàng tồn kho (TK 152, 156), đối chiếu giữa sổ sách và thực tế nhập xuất tồn kho.</li>
  <li>Rà soát hóa đơn đầu vào trên 20 triệu đồng có chứng từ thanh toán không dùng tiền mặt hay không.</li>
  <li>Phát hiện các hóa đơn của doanh nghiệp có dấu hiệu rủi ro cao về thuế hoặc đã ngừng hoạt động kinh doanh.</li>
</ul>

<h2>3. Kết quả bàn giao cho doanh nghiệp</h2>
<p>Iname cung cấp báo cáo phân tích rủi ro chi tiết kèm phương án xử lý, khắc phục và hoàn thiện hồ sơ hợp lệ trước ngày cơ quan thuế chính thức làm việc tại doanh nghiệp.</p>`,
    },
    {
      title: "Kế toán trưởng thuê ngoài",
      slug: "ke-toan-truong-thue-ngoai",
      excerpt: "Kế toán trưởng làm việc theo buổi hoặc theo tuần để kiểm soát chất lượng sổ sách, phê duyệt hồ sơ và tư vấn cho kế toán nội bộ.",
      cover_url: "https://cdn.enter.pro/resources/uid_100635008/ke-toan-doi-ngu_9caaa18c.png",
      content: `<h2>1. Giải pháp kế toán trưởng thuê ngoài tối ưu chi phí</h2>
<p>Một kế toán trưởng toàn thời gian có năng lực thường yêu cầu mức lương từ 20 - 40 triệu đồng/tháng, đây là gánh nặng lớn đối với các công ty vừa và nhỏ. Dịch vụ kế toán trưởng thuê ngoài của Iname giúp doanh nghiệp sở hữu chuyên gia kế toán cấp cao với mức chi phí chỉ bằng 1/5.</p>

<h2>2. Trách nhiệm của Kế toán trưởng Iname</h2>
<ul>
  <li>Chịu trách nhiệm pháp lý và đứng tên Kế toán trưởng trên Báo cáo tài chính và sổ sách kế toán của doanh nghiệp.</li>
  <li>Kiểm soát, hướng dẫn và phân công công việc cho nhân viên kế toán nội bộ của doanh nghiệp.</li>
  <li>Tư vấn cấu trúc chi phí, tối ưu hóa dòng tiền và tư vấn các chính sách ưu đãi thuế phù hợp với ngành nghề.</li>
  <li>Thiết lập hệ thống kiểm soát nội bộ, biểu mẫu chứng từ phù hợp quy mô doanh nghiệp.</li>
  <li>Đại diện doanh nghiệp làm việc trực tiếp với kiểm toán độc lập, cơ quan thuế và các đối tác tài chính ngân hàng.</li>
</ul>

<h2>3. Cam kết chất lượng dịch vụ</h2>
<p>Tất cả Kế toán trưởng phụ trách tại Iname đều có chứng chỉ hành nghề kế toán, kiểm toán (CPA) và trên 8 năm kinh nghiệm thực chiến quản lý tài chính doanh nghiệp.</p>`,
    },
    {
      title: "Hóa đơn điện tử và chữ ký số",
      slug: "hoa-don-dien-tu-va-chu-ky-so",
      excerpt: "Đăng ký, chuyển đổi nhà cung cấp hóa đơn điện tử, cài đặt chữ ký số và hướng dẫn nhân sự phát hành hóa đơn đúng quy định.",
      cover_url: "https://cdn.enter.pro/resources/uid_100635008/ke-toan-doi-ngu_9caaa18c.png",
      content: `<h2>1. Quy định bắt buộc về hóa đơn điện tử và chữ ký số</h2>
<p>Theo Nghị định 123/2020/NĐ-CP và Thông tư 78/2021/TT-BTC, 100% doanh nghiệp và hộ kinh doanh phải sử dụng hóa đơn điện tử có mã hoặc không có mã của cơ quan thuế, đồng thời bắt buộc phải có chữ ký số (Token/HSM) hợp lệ để thực hiện các giao dịch điện tử.</p>

<h2>2. Gói hỗ trợ toàn diện của Iname</h2>
<ul>
  <li>Cung cấp và gia hạn chữ ký số (Token, SmartCA, HSM) với mức chiết khấu tốt nhất từ các nhà mạng uy tín (VNPT, Viettel, FPT, MISA).</li>
  <li>Cài đặt phần mềm chữ ký số lên máy tính và hướng dẫn ký số trên cổng thuế điện tử, hải quan, bảo hiểm xã hội.</li>
  <li>Khởi tạo hệ thống hóa đơn điện tử, thiết kế mẫu hóa đơn theo nhận diện thương hiệu công ty.</li>
  <li>Lập và nộp tờ khai Mẫu 01/ĐKTĐ-HĐĐT đăng ký sử dụng hóa đơn điện tử với cơ quan thuế quản lý trực tiếp.</li>
  <li>Hướng dẫn nhân viên xuất hóa đơn, hủy hóa đơn sai sót, lập biên bản điều chỉnh hoặc hóa đơn thay thế đúng quy định.</li>
</ul>

<h2>3. Hỗ trợ kỹ thuật 24/7</h2>
<p>Chuyên viên Iname hỗ trợ qua Ultraviewer/Anydesk mọi lúc khi phát sinh lỗi phát hành hóa đơn hoặc trục trặc chữ ký số, đảm bảo dòng tiền kinh doanh không bị gián đoạn.</p>`,
    },
    {
      title: "Tư vấn thuế, pháp lý và bảo hiểm xã hội",
      slug: "tu-van-thue-phap-ly-va-bao-hiem-xa-hoi",
      excerpt: "Tư vấn cách hạch toán chi phí hợp lệ, đăng ký và điều chỉnh bảo hiểm xã hội, chốt sổ cho người lao động khi nghỉ việc.",
      cover_url: "https://cdn.enter.pro/resources/uid_100635008/ke-toan-doi-ngu_9caaa18c.png",
      content: `<h2>1. Giải quyết bài toán nhân sự và chi phí lao động hợp pháp</h2>
<p>Tiền lương, bảo hiểm xã hội và thuế TNCN là những khoản mục chi phí lớn và thường xuyên phát sinh rủi ro tranh chấp lao động hoặc bị cơ quan BHXH, cơ quan thuế xử phạt nếu không nắm vững quy định pháp luật.</p>

<h2>2. Nội dung tư vấn và hỗ trợ thực tế</h2>
<ul>
  <li>Tư vấn xây dựng hệ thống thang bảng lương, quy chế lương thưởng và nội quy lao động phù hợp quy mô doanh nghiệp.</li>
  <li>Soạn thảo hợp đồng lao động, hợp đồng thử việc, hợp đồng cộng tác viên đảm bảo quyền lợi và tối ưu chi phí thuế.</li>
  <li>Thực hiện thủ tục đăng ký tham gia bảo hiểm xã hội (BHXH, BHYT, BHTN) lần đầu cho doanh nghiệp mới thành lập.</li>
  <li>Báo tăng, báo giảm lao động, điều chỉnh mức đóng BHXH hàng tháng khi có biến động nhân sự.</li>
  <li>Lập hồ sơ giải quyết chế độ ốm đau, thai sản, tai nạn lao động cho nhân viên; thực hiện chốt sổ BHXH khi người lao động nghỉ việc.</li>
  <li>Tư vấn các biện pháp hợp pháp để chi phí tiền lương và phúc lợi được tính vào chi phí được trừ khi tính thuế TNDN.</li>
</ul>

<h2>3. Đồng hành bền vững</h2>
<p>Iname giúp doanh nghiệp xây dựng môi trường làm việc chuyên nghiệp, tuân thủ đúng pháp luật lao động và bảo hiểm, tạo nền tảng vững chắc để thu hút và giữ chân nhân tài.</p>`,
    },
  ];

  for (const art of accountingArticles) {
    const existing = await pool.query("SELECT id FROM articles WHERE slug = $1", [art.slug]);
    if (existing.rows.length) {
      await pool.query(
        `UPDATE articles SET
          title = $1, excerpt = $2, content = $3, cover_url = $4,
          category_id = $5, status = 'published', updated_at = NOW()
         WHERE slug = $6`,
        [art.title, art.excerpt, art.content, art.cover_url, keToanCatId, art.slug]
      );
      console.log(`Updated accounting article: ${art.title}`);
    } else {
      await pool.query(
        `INSERT INTO articles
          (category_id, title, slug, excerpt, content, cover_url, status, read_minutes, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'published', 5, NOW())`,
        [keToanCatId, art.title, art.slug, art.excerpt, art.content, art.cover_url]
      );
      console.log(`Inserted accounting article: ${art.title}`);
    }

    // Also update corresponding service record button_url
    await pool.query(
      `UPDATE services SET
        button_url = $1, button_label = 'Xem chi tiết', summary = $2, description = $3, updated_at = NOW()
       WHERE category = 'accounting' AND (name ILIKE $4 OR slug ILIKE $5)`,
      [`/ke-toan/${art.slug}`, art.excerpt, art.excerpt, `%${art.title}%`, `%${art.slug}%`]
    );
  }

  console.log("Successfully synchronized all data for Phase 1!");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration/sync error:", err);
  process.exit(1);
});
