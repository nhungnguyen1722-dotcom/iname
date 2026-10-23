import fs from "fs";
import path from "path";
import pg from "pg";
import { pgConfig } from "./pg-config.mjs";

function loadEnv() {
  for (const envFile of [".env.local", ".env"]) {
    const envPath = path.join(process.cwd(), envFile);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

function html(lead, sections) {
  return `<p>${lead}</p>${sections.map((section) => `<h2>${section[0]}</h2><p>${section[1]}</p>`).join("")}`;
}

const officeImage = "https://cdn.enter.pro/resources/uid_100635008/van-phong-ao-hero_6a9b5130.png";
const receptionImage = "https://cdn.enter.pro/resources/uid_100635008/van-phong-ao-reception_b1846114.png";

const slides = [
  {
    key: "office",
    eyebrow: "Văn phòng ảo",
    title: "Địa chỉ kinh doanh hợp lệ, không cần thuê nguyên văn phòng",
    description: "iName cung cấp văn phòng ảo đủ điều kiện đăng ký kinh doanh tại Hà Nội và TP. HCM, có lễ tân nhận thư, phòng họp và hợp đồng, hóa đơn đầy đủ.",
    image: officeImage,
    imageAlt: "Sảnh văn phòng ảo iName",
    badges: ["Đủ điều kiện đăng ký kinh doanh", "Hợp đồng và hóa đơn đầy đủ", "Lễ tân tiếp nhận thư từ"],
    primaryLabel: "Liên Hệ",
    primaryHref: "/lien-he",
    secondaryLabel: "Xem bảng giá",
    secondaryHref: "/bang-gia",
    floats: [
      { title: "Địa điểm", value: "12 địa chỉ", note: "Hà Nội và TP. HCM" },
      { title: "Mức phí", value: "Từ 350K", note: "Mỗi tháng, đã có lễ tân" },
    ],
  },
  {
    key: "accounting",
    eyebrow: "Kế toán - Thuế",
    title: "Sổ sách chuẩn, báo cáo thuế đúng hạn từ ngày đầu",
    description: "Đội ngũ kế toán hành nghề có chứng chỉ xử lý chứng từ, kê khai thuế và bàn giao hồ sơ mỗi tháng, kèm hóa đơn VAT để doanh nghiệp hạch toán chi phí hợp lệ.",
    image: receptionImage,
    imageAlt: "Lễ tân tiếp nhận hồ sơ và thư từ",
    badges: ["Kế toán hành nghề có chứng chỉ", "Báo cáo thuế đúng kỳ", "Hóa đơn VAT đầy đủ"],
    primaryLabel: "Liên Hệ",
    primaryHref: "/lien-he",
    secondaryLabel: "Xem bảng giá",
    secondaryHref: "/bang-gia",
    floats: [
      { title: "Kế toán báo cáo thuế", value: "Đúng hạn 100%", note: "Theo dõi và nhắc hạn tự động" },
      { title: "Thời gian phản hồi", value: "Trong 2 giờ", note: "Giờ làm việc hành chính" },
    ],
  },
  {
    key: "technology",
    eyebrow: "Giải pháp Công nghệ",
    title: "Website, phần mềm và AI cho quy trình đang chạy",
    description: "iName thiết kế website, xây phần mềm quản lý và triển khai trợ lý AI để dữ liệu khách hàng, đơn hàng và công việc nội bộ nằm ở một nơi.",
    image: "/uploads/gallery/coworking.jpg",
    imageAlt: "Không gian làm việc triển khai giải pháp công nghệ",
    badges: ["Thiết kế website chuẩn SEO", "Phần mềm theo quy trình", "AI và tự động hóa"],
    primaryLabel: "Liên Hệ",
    primaryHref: "/lien-he",
    secondaryLabel: "Xem bảng giá",
    secondaryHref: "/bang-gia",
    floats: [
      { title: "Bàn giao", value: "Kèm hướng dẫn", note: "Doanh nghiệp tự cập nhật nội dung" },
      { title: "Hạ tầng", value: "Cloud linh hoạt", note: "Bảo mật và sao lưu định kỳ" },
    ],
  },
];

const whyItems = [
  { icon: "pin", title: "Địa chỉ thật, kiểm tra được", description: "Mỗi địa chỉ đều có văn phòng thực tế, nhân sự tiếp nhận và hệ thống lưu trữ thư từ, hồ sơ theo từng doanh nghiệp." },
  { icon: "badge", title: "Kế toán hành nghề có chứng chỉ", description: "Đội ngũ gồm kế toán trưởng và chuyên viên có chứng chỉ hành nghề, nhiều năm xử lý sổ sách cho doanh nghiệp nhỏ và vừa." },
  { icon: "file", title: "Hợp đồng và hóa đơn đầy đủ", description: "Chi phí văn phòng ảo và kế toán đều có hóa đơn VAT, phù hợp để hạch toán vào chi phí hợp lệ của doanh nghiệp." },
  { icon: "timer", title: "Phản hồi trong 2 giờ làm việc", description: "Mọi yêu cầu qua hotline, email hoặc Zalo đều được phân công cho người phụ trách và phản hồi trong thời gian cam kết." },
];

const techItems = [
  { title: "Thiết kế website", description: "Website chuyên nghiệp, chuẩn SEO, hiện đại, giao diện đẹp, tối ưu trải nghiệm.", icon: "website", href: "/tin-tuc/thiet-ke-website", cta: "Xem chi tiết →" },
  { title: "Phát triển phần mềm", description: "Ứng dụng web, mobile theo yêu cầu, linh hoạt và bảo mật.", icon: "code", href: "/tin-tuc/phat-trien-phan-mem", cta: "Xem chi tiết →" },
  { title: "Hệ thống quản lý", description: "Giải pháp quản trị doanh nghiệp (ERP, CRM, HRM...) tối ưu quy trình.", icon: "briefcase", href: "/tin-tuc/he-thong-quan-ly", cta: "Xem chi tiết →" },
  { title: "AI & Tự động hóa", description: "Ứng dụng AI, chatbot, tự động hóa quy trình làm việc.", icon: "cpu", href: "/tin-tuc/ai-va-tu-dong-hoa", cta: "Xem chi tiết →" },
  { title: "Cloud & Hạ tầng", description: "Lưu trữ, bảo mật, triển khai hạ tầng đám mây linh hoạt.", icon: "cloud", href: "/tin-tuc/cloud-va-ha-tang", cta: "Xem chi tiết →" },
];

const serviceLinks = {
  "office-dia-chi-dang-ky-kinh-doanh": "/tin-tuc/dia-chi-dang-ky-kinh-doanh",
  "office-van-phong-ao-tron-goi": "/tin-tuc/van-phong-ao-tron-goi",
  "office-phong-hop-va-phong-tiep-khach": "/tin-tuc/phong-hop-va-phong-tiep-khach",
  "office-tiep-nhan-thu-tu-va-chuyen-phat": "/tin-tuc/tiep-nhan-thu-tu-va-chuyen-phat",
  "office-tong-dai-va-so-dien-thoai-rieng": "/tin-tuc/tong-dai-va-so-dien-thoai-rieng",
  "office-ho-tro-thu-tuc-sau-khi-thue": "/tin-tuc/ho-tro-thu-tuc-sau-khi-thue",
};

const articles = [
  {
    category: "cong-nghe",
    title: "Thiết kế website",
    slug: "thiet-ke-website",
    excerpt: "Website doanh nghiệp chuẩn SEO, dễ cập nhật và đủ chỗ để khách để lại yêu cầu tư vấn.",
    cover: "/uploads/gallery/coworking.jpg",
    minutes: 6,
    content: html(
      "Một website dùng được là nơi khách hiểu doanh nghiệp làm gì, tin địa chỉ và gửi được yêu cầu. iName thiết kế website gắn với dịch vụ văn phòng ảo, kế toán và các trang dịch vụ đang có.",
      [
        ["Website cần có gì", "Trang chủ, trang dịch vụ, bảng giá, tin tức và form liên hệ. Nội dung viết theo cách khách đang tìm, có tiêu đề rõ và nút kêu gọi hành động trên mỗi trang."],
        ["Chuẩn hiển thị", "Giao diện đọc được trên điện thoại, ảnh không tràn khung, chữ đủ tương phản và thời gian mở trang được giữ ở mức nhẹ."],
        ["Bàn giao", "Doanh nghiệp nhận tài khoản để sửa bài viết, ảnh và thông tin liên hệ. iName hướng dẫn thao tác thường ngày và giữ phần kỹ thuật khi cần chỉnh."],
      ],
    ),
  },
  {
    category: "cong-nghe",
    title: "Phát triển phần mềm",
    slug: "phat-trien-phan-mem",
    excerpt: "Phần mềm web theo quy trình thật của doanh nghiệp: đơn hàng, khách hàng, hồ sơ hoặc công việc nội bộ.",
    cover: "/uploads/gallery/meeting.jpg",
    minutes: 6,
    content: html(
      "Phần mềm chỉ có ích khi bám đúng việc đang chạy, không phải một bản demo chung. iName bắt đầu từ quy trình hiện tại rồi mới chọn màn hình và dữ liệu cần lưu.",
      [
        ["Phạm vi làm rõ trước", "Ai nhập liệu, ai duyệt, dữ liệu nào phải xuất ra và phần nào làm ở đợt đầu. Phạm vi được ghi thành danh sách màn hình trước khi lập trình."],
        ["Bảo mật và phân quyền", "Mỗi vai trò chỉ thấy dữ liệu của mình. Tài khoản, nhật ký thao tác và sao lưu được tính ngay từ bản đầu."],
        ["Sau khi chạy", "Đội ngũ được hướng dẫn sử dụng. Các việc phát sinh được tách thành đợt chỉnh nhỏ thay vì sửa lan man trên hệ thống đang dùng."],
      ],
    ),
  },
  {
    category: "cong-nghe",
    title: "Hệ thống quản lý",
    slug: "he-thong-quan-ly",
    excerpt: "ERP, CRM hoặc quy trình nội bộ giúp đơn hàng, khách hàng và công việc không nằm rải ở nhiều file.",
    cover: "/uploads/gallery/directory-board.jpg",
    minutes: 6,
    content: html(
      "Doanh nghiệp nhỏ thường quản lý bằng bảng tính cho đến khi số liệu không còn khớp. Hệ thống quản lý đưa khách hàng, đơn và việc cần làm về một nơi để tra được.",
      [
        ["CRM và chăm sóc khách", "Lưu nguồn khách, người phụ trách, lịch hẹn và kết quả từng lần trao đổi. Nhân sự mới mở hồ sơ là nắm được việc đang dở."],
        ["Quy trình nội bộ", "Đơn từ lúc tiếp nhận đến lúc bàn giao có trạng thái. Người quản lý thấy việc chậm mà không phải hỏi lại từng người."],
        ["Kết nối với website", "Form trên website có thể đổ vào danh sách khách. Dữ liệu không phải chép tay từ email sang file."],
      ],
    ),
  },
  {
    category: "cong-nghe",
    title: "AI & Tự động hóa",
    slug: "ai-va-tu-dong-hoa",
    excerpt: "Trợ lý AI và quy trình tự động cho việc lặp: nhắc hạn, trả lời câu hỏi thường gặp, phân loại yêu cầu.",
    cover: "/uploads/gallery/lounge.jpg",
    minutes: 7,
    content: html(
      "AI được dùng cho những việc lặp và có nguồn dữ liệu rõ, không thay sổ sách kế toán và không tự ý dùng dữ liệu chưa được phép.",
      [
        ["Việc phù hợp", "Trả lời câu hỏi đã có sẵn, nhắc hạn chứng từ, phân loại yêu cầu gửi về và tóm tắt nội dung cuộc trao đổi để người phụ trách đọc nhanh."],
        ["Giới hạn dữ liệu", "Trợ lý chỉ đọc nguồn được chỉ định. Số liệu kế toán, hợp đồng và hồ sơ khách không được đưa vào nếu doanh nghiệp chưa cho phép."],
        ["Người vẫn quyết định", "Các bước gửi báo cáo, phát hành hóa đơn hoặc trả lời cam kết vẫn do nhân sự xác nhận trước khi đi."],
      ],
    ),
  },
  {
    category: "cong-nghe",
    title: "Cloud & Hạ tầng",
    slug: "cloud-va-ha-tang",
    excerpt: "Hạ tầng đám mây để website và phần mềm chạy ổn định, có sao lưu và quyền truy cập rõ ràng.",
    cover: "/uploads/gallery/pantry.jpg",
    minutes: 6,
    content: html(
      "Hạ tầng tốt là hệ thống mở được khi cần, sao lưu đều và không phụ thuộc một máy cá nhân. iName tư vấn mức vừa đủ với lưu lượng thật của doanh nghiệp.",
      [
        ["Chạy và sao lưu", "Ứng dụng đặt trên môi trường có bản sao và lịch sao lưu. Khi cần khôi phục, có mốc dữ liệu để quay lại."],
        ["Bảo mật truy cập", "Tài khoản quản trị được tách riêng, mật khẩu không dùng chung và các cổng không cần thiết được đóng."],
        ["Chi phí theo nhu cầu", "Gói hạ tầng được chọn theo lưu lượng hiện tại, có thể nâng khi website hoặc phần mềm có thêm người dùng."],
      ],
    ),
  },
  {
    category: "van-phong-ao",
    title: "Địa chỉ đăng ký kinh doanh",
    slug: "dia-chi-dang-ky-kinh-doanh",
    excerpt: "Địa chỉ văn phòng thật, đủ hồ sơ để đăng ký doanh nghiệp, hộ kinh doanh, chi nhánh hoặc văn phòng đại diện.",
    cover: "/uploads/locations/dien-bien-phu.jpg",
    minutes: 6,
    content: html(
      "Địa chỉ đăng ký kinh doanh cần là nơi có văn phòng, có người tiếp nhận và có hợp đồng rõ. iName cung cấp địa chỉ tại các tòa nhà đang vận hành, kèm giấy tờ để nộp hồ sơ.",
      [
        ["Hồ sơ đi kèm", "Hợp đồng thuê địa chỉ, hóa đơn và giấy xác nhận theo yêu cầu của cơ quan đăng ký. Trước khi ký, iName đối chiếu ngành nghề và loại hình của doanh nghiệp."],
        ["Khi có kiểm tra", "Địa chỉ có nhân sự tiếp nhận. Thư và thông báo được lưu theo từng doanh nghiệp, không để chung một hộp."],
        ["Phù hợp với ai", "Doanh nghiệp mới, hộ kinh doanh, chi nhánh hoặc văn phòng đại diện cần địa chỉ hợp lệ mà chưa thuê cả mặt bằng."],
      ],
    ),
  },
  {
    category: "van-phong-ao",
    title: "Văn phòng ảo trọn gói",
    slug: "van-phong-ao-tron-goi",
    excerpt: "Một gói gồm địa chỉ, nhận thư, số điện thoại và giờ phòng họp đã thỏa thuận trong tháng.",
    cover: "/uploads/gallery/lounge.jpg",
    minutes: 6,
    content: html(
      "Gói trọn gói dành cho doanh nghiệp muốn đủ đầu mối giao dịch: địa chỉ trên hồ sơ, người nhận thư, số máy và chỗ tiếp khách khi cần.",
      [
        ["Những gì có trong gói", "Địa chỉ sử dụng theo hợp đồng, tiếp nhận thư, số giờ phòng họp trong tháng và đầu mối liên hệ riêng."],
        ["Hợp đồng và hóa đơn", "Phí dịch vụ có hợp đồng và hóa đơn VAT, dùng để hạch toán chi phí. Thời hạn tối thiểu được nói trước khi ký."],
        ["Nâng hoặc giảm phạm vi", "Khi cần thêm giờ họp, thêm nhánh điện thoại hoặc chuyển gói, hai bên lập phụ lục thay vì ký lại từ đầu."],
      ],
    ),
  },
  {
    category: "van-phong-ao",
    title: "Phòng họp và phòng tiếp khách",
    slug: "phong-hop-va-phong-tiep-khach",
    excerpt: "Phòng 4 đến 20 chỗ, có màn hình, nước uống và lễ tân, đặt theo giờ hoặc theo ngày.",
    cover: "/uploads/gallery/meeting.jpg",
    minutes: 5,
    content: html(
      "Phòng họp dùng khi cần tiếp đối tác, ký hồ sơ hoặc họp nhóm mà không giữ một phòng trống cả tháng.",
      [
        ["Cách đặt", "Đặt theo giờ hoặc theo ngày. Lễ tân xác nhận chỗ trống và chuẩn bị nước, màn hình trình chiếu."],
        ["Quy mô", "Phòng từ 4 đến 20 chỗ tùy địa điểm. Doanh nghiệp đang dùng địa chỉ iName được tính giờ họp theo gói đã ký."],
        ["Hình ảnh khi tiếp khách", "Sảnh và lễ tân của tòa nhà đón khách. Doanh nghiệp không phải sắp xếp chỗ ngồi tại nhà riêng."],
      ],
    ),
  },
  {
    category: "van-phong-ao",
    title: "Tiếp nhận thư từ và chuyển phát",
    slug: "tiep-nhan-thu-tu-va-chuyen-phat",
    excerpt: "Thư, bưu phẩm và giấy tờ thuế được nhận theo tên doanh nghiệp, chụp ảnh và báo trong ngày.",
    cover: "/uploads/gallery/directory-board.jpg",
    minutes: 5,
    content: html(
      "Thư thuế, hợp đồng và bưu phẩm cần có người nhận đúng tên. Mỗi doanh nghiệp có chỗ lưu riêng, không trộn với thư của đơn vị khác.",
      [
        ["Quy trình nhận", "Nhân sự phân loại theo tên doanh nghiệp, chụp ảnh và gửi email trong ngày làm việc."],
        ["Chuyển phát", "Thư được giữ tại quầy hoặc chuyển đến địa chỉ doanh nghiệp yêu cầu. Thời gian lưu tối đa được ghi trong hợp đồng."],
        ["Giấy tờ quan trọng", "Thông báo thuế và giấy tờ có thời hạn được đánh dấu để người phụ trách thấy trước, không chờ đến cuối tuần."],
      ],
    ),
  },
  {
    category: "van-phong-ao",
    title: "Tổng đài và số điện thoại riêng",
    slug: "tong-dai-va-so-dien-thoai-rieng",
    excerpt: "Số máy hoặc số nhánh riêng, lễ tân trả lời theo kịch bản và ghi lại nội dung cuộc gọi.",
    cover: "/uploads/locations/pasteur.jpg",
    minutes: 5,
    content: html(
      "Số điện thoại trên hồ sơ và website cần có người nghe trong giờ làm việc. iName cấp số riêng hoặc số nhánh và trả lời theo nội dung doanh nghiệp cung cấp.",
      [
        ["Kịch bản trả lời", "Tên doanh nghiệp, câu chào và việc nào được chuyển tiếp. Cuộc gọi nhỡ được ghi nội dung và gửi lại cho người phụ trách."],
        ["Số nhánh", "Gói chuyên nghiệp có tổng đài. Gói doanh nghiệp có thể thêm nhánh khi có hơn một đầu mối."],
        ["Giờ trực", "Lễ tân nghe máy trong giờ hành chính. Ngoài giờ, cuộc gọi được ghi nhận để phản hồi vào sáng hôm sau."],
      ],
    ),
  },
  {
    category: "van-phong-ao",
    title: "Hỗ trợ thủ tục sau khi thuê",
    slug: "ho-tro-thu-tuc-sau-khi-thue",
    excerpt: "Hỗ trợ đăng ký mã số thuế, chữ ký số, hóa đơn điện tử và cập nhật địa chỉ trên hồ sơ đang dùng.",
    cover: "/uploads/gallery/private-office.jpg",
    minutes: 6,
    content: html(
      "Sau khi có địa chỉ, doanh nghiệp còn việc phải làm với thuế và các giấy tờ đang mang địa chỉ cũ. iName hỗ trợ các bước này theo phạm vi đã thống nhất.",
      [
        ["Việc thường làm ngay", "Đăng ký hoặc đổi địa chỉ với cơ quan thuế, chuẩn bị chữ ký số và hóa đơn điện tử, cập nhật địa chỉ trên website, hợp đồng và hóa đơn."],
        ["Checklist theo loại hình", "Doanh nghiệp, hộ kinh doanh, chi nhánh và văn phòng đại diện có danh mục giấy tờ khác nhau. iName gửi checklist trước khi nộp."],
        ["Đầu mối phụ trách", "Mỗi hồ sơ có người theo dõi. Yêu cầu phát sinh được phản hồi trong giờ làm việc, không phải gửi lại từ đầu."],
      ],
    ),
  },
];

async function mergeConfig(client, pagePath, sectionKey, patch) {
  const found = await client.query(
    `SELECT s.id, s.config_json
     FROM page_sections s JOIN pages p ON p.id = s.page_id
     WHERE p.path = $1 AND s.section_key = $2 AND s.deleted_at IS NULL`,
    [pagePath, sectionKey],
  );
  const row = found.rows[0];
  if (!row) throw new Error(`Thiếu section ${sectionKey} tại ${pagePath}`);
  const config = { ...JSON.parse(row.config_json || "{}"), ...patch };
  await client.query("UPDATE page_sections SET config_json = $1, updated_at = NOW() WHERE id = $2", [JSON.stringify(config), row.id]);
}

async function cloneHome(client) {
  const existing = await client.query("SELECT id FROM pages WHERE path = '/trang-chu-cu' AND deleted_at IS NULL");
  let pageId = existing.rows[0]?.id;
  if (!pageId) {
    const inserted = await client.query(
      `INSERT INTO pages (slug, path, title, seo_title, seo_description, og_image, status, is_system, sort_order)
       SELECT 'trang-chu-cu', '/trang-chu-cu', 'Trang chủ cũ', COALESCE(seo_title, title), seo_description, og_image, 'published', false, 90
       FROM pages WHERE path = '/' AND deleted_at IS NULL
       RETURNING id`,
    );
    pageId = inserted.rows[0]?.id;
  }
  if (!pageId) throw new Error("Không tạo được trang chủ cũ");
  const source = await client.query(
    `SELECT section_key, section_type, admin_name, eyebrow, title, subtitle, description,
            image_url, image_alt, button_label, button_url, secondary_button_label, secondary_button_url,
            items_json, gallery_json, config_json, visible, status, sort_order
     FROM page_sections
     WHERE page_id = (SELECT id FROM pages WHERE path = '/' AND deleted_at IS NULL)
       AND deleted_at IS NULL`,
  );
  const present = await client.query("SELECT section_key FROM page_sections WHERE page_id = $1 AND deleted_at IS NULL", [pageId]);
  const have = new Set(present.rows.map((row) => row.section_key));
  for (const row of source.rows) {
    if (have.has(row.section_key)) continue;
    await client.query(
      `INSERT INTO page_sections (
         page_id, section_key, section_type, admin_name, eyebrow, title, subtitle, description,
         image_url, image_alt, button_label, button_url, secondary_button_label, secondary_button_url,
         items_json, gallery_json, config_json, visible, status, sort_order
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
      [
        pageId, row.section_key, row.section_type, row.admin_name, row.eyebrow, row.title, row.subtitle, row.description,
        row.image_url, row.image_alt, row.button_label, row.button_url, row.secondary_button_label, row.secondary_button_url,
        row.items_json, row.gallery_json, row.config_json, row.visible, row.status, row.sort_order,
      ],
    );
  }
}

async function applyContent(client) {
  await cloneHome(client);
  await mergeConfig(client, "/", "home-hero", { slides });
  await client.query(
    `UPDATE page_sections SET items_json = $1, updated_at = NOW()
     WHERE section_key = 'home-why' AND page_id = (SELECT id FROM pages WHERE path = '/' AND deleted_at IS NULL)`,
    [JSON.stringify(whyItems)],
  );
  await mergeConfig(client, "/", "home-why", { columns: 4, tone: "soft", hover: "brand" });
  await client.query(
    `UPDATE page_sections SET visible = false, updated_at = NOW()
     WHERE section_key = 'vo-intro' AND deleted_at IS NULL`,
  );
  await mergeConfig(client, "/van-phong-ao", "vo-services", { columns: 3, source: "services", category: "office", tone: "soft", hover: "brand" });
  await client.query(
    `UPDATE page_sections SET items_json = $1, updated_at = NOW()
     WHERE section_key = 'tech-services' AND deleted_at IS NULL`,
    [JSON.stringify(techItems)],
  );
  await mergeConfig(client, "/giai-phap-cong-nghe", "tech-services", { columns: 5, hover: "brand", eyebrowColor: "#0ea5e9" });
  for (const [slug, href] of Object.entries(serviceLinks)) {
    await client.query(
      "UPDATE services SET button_url = $1, button_label = 'Xem chi tiết', updated_at = NOW() WHERE slug = $2 AND deleted_at IS NULL",
      [href, slug],
    );
  }
  const categoryNames = {
    "van-phong-ao": ["Văn phòng ảo", "Dịch vụ văn phòng ảo, địa chỉ đăng ký và tiện ích văn phòng", 6],
    "cong-nghe": ["Công nghệ", "Giải pháp website, phần mềm, AI và hạ tầng", 5],
  };
  for (const [slug, [name, description, sortOrder]] of Object.entries(categoryNames)) {
    const found = await client.query("SELECT id FROM article_categories WHERE slug = $1", [slug]);
    if (found.rows[0]) {
      await client.query("UPDATE article_categories SET name = $1, description = $2 WHERE slug = $3", [name, description, slug]);
    } else {
      await client.query(
        "INSERT INTO article_categories (name, slug, description, sort_order) VALUES ($1,$2,$3,$4)",
        [name, slug, description, sortOrder],
      );
    }
  }
  for (const article of articles) {
    const category = await client.query("SELECT id FROM article_categories WHERE slug = $1", [article.category]);
    const categoryId = category.rows[0]?.id;
    if (!categoryId) throw new Error(`Thiếu chuyên mục ${article.category}`);
    const values = [
      categoryId,
      article.title,
      article.excerpt,
      article.content,
      article.cover,
      article.title,
      `${article.title} | iName`,
      article.excerpt,
      article.minutes,
    ];
    const existing = await client.query("SELECT id FROM articles WHERE slug = $1 AND deleted_at IS NULL", [article.slug]);
    if (existing.rows[0]) {
      await client.query(
        `UPDATE articles SET
           category_id = $1, title = $2, excerpt = $3, content = $4, cover_url = $5, cover_alt = $6,
           seo_title = $7, seo_description = $8, status = 'published', read_minutes = $9, updated_at = NOW()
         WHERE id = $10`,
        [...values, existing.rows[0].id],
      );
    } else {
      await client.query(
        `INSERT INTO articles (
           category_id, title, slug, excerpt, content, cover_url, cover_alt, seo_title, seo_description,
           status, read_minutes, published_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'published',$10, NOW())`,
        [categoryId, article.title, article.slug, article.excerpt, article.content, article.cover, article.title, `${article.title} | iName`, article.excerpt, article.minutes],
      );
    }
  }
}

async function syncOffices(local, neon) {
  const query = `SELECT slug, title, excerpt, content, address, price_label, cover_url, cover_alt,
                        banner_url, banner_alt, gallery_json::text AS gallery_json, amenities_json::text AS amenities_json,
                        visible, status, sort_order
                 FROM office_locations WHERE deleted_at IS NULL ORDER BY slug`;
  const [source, target] = await Promise.all([local.query(query), neon.query(query)]);
  const targetBySlug = new Map(target.rows.map((row) => [row.slug, row]));
  let updated = 0;
  for (const row of source.rows) {
    const other = targetBySlug.get(row.slug);
    if (!other) {
      console.log("Neon thiếu chi nhánh", row.slug);
      continue;
    }
    const changed = Object.keys(row).some((key) => String(row[key] ?? "") !== String(other[key] ?? ""));
    if (!changed) continue;
    updated += 1;
    await neon.query(
      `UPDATE office_locations SET
         title = $2, excerpt = $3, content = $4, address = $5, price_label = $6,
         cover_url = $7, cover_alt = $8, banner_url = $9, banner_alt = $10,
         gallery_json = $11, amenities_json = $12, visible = $13, status = $14, sort_order = $15,
         updated_at = NOW()
       WHERE slug = $1 AND deleted_at IS NULL`,
      [
        row.slug, row.title, row.excerpt, row.content, row.address, row.price_label,
        row.cover_url, row.cover_alt, row.banner_url, row.banner_alt,
        row.gallery_json || "[]", row.amenities_json || "[]", row.visible, row.status, row.sort_order,
      ],
    );
  }
  console.log(`Đồng bộ chi nhánh local -> Neon: ${updated} dòng khác`);
}

async function syncMissingPages(local, neon) {
  const localPages = await local.query(
    `SELECT id, slug, path, title, seo_title, seo_description, og_image, status, is_system, sort_order
     FROM pages WHERE deleted_at IS NULL`,
  );
  const neonPages = await neon.query("SELECT path FROM pages WHERE deleted_at IS NULL");
  const have = new Set(neonPages.rows.map((row) => row.path));
  for (const page of localPages.rows) {
    if (have.has(page.path)) continue;
    const inserted = await neon.query(
      `INSERT INTO pages (slug, path, title, seo_title, seo_description, og_image, status, is_system, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [page.slug, page.path, page.title, page.seo_title, page.seo_description, page.og_image, page.status, page.is_system, page.sort_order],
    );
    const sections = await local.query(
      `SELECT section_key, section_type, admin_name, eyebrow, title, subtitle, description,
              image_url, image_alt, button_label, button_url, secondary_button_label, secondary_button_url,
              items_json, gallery_json, config_json, visible, status, sort_order
       FROM page_sections WHERE page_id = $1 AND deleted_at IS NULL`,
      [page.id],
    );
    for (const row of sections.rows) {
      await neon.query(
        `INSERT INTO page_sections (
           page_id, section_key, section_type, admin_name, eyebrow, title, subtitle, description,
           image_url, image_alt, button_label, button_url, secondary_button_label, secondary_button_url,
           items_json, gallery_json, config_json, visible, status, sort_order
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
        [
          inserted.rows[0].id, row.section_key, row.section_type, row.admin_name, row.eyebrow, row.title, row.subtitle, row.description,
          row.image_url, row.image_alt, row.button_label, row.button_url, row.secondary_button_label, row.secondary_button_url,
          row.items_json, row.gallery_json, row.config_json, row.visible, row.status, row.sort_order,
        ],
      );
    }
    console.log("Đã sao chép trang sang Neon:", page.path, sections.rows.length, "section");
  }
}

loadEnv();
const localUrl = process.env.DATABASE_URL;
const neonUrl = process.env.NEON_DATABASE_URL;
if (!localUrl || !neonUrl) {
  console.error("Thiếu DATABASE_URL hoặc NEON_DATABASE_URL");
  process.exit(1);
}

const local = new pg.Pool(pgConfig(localUrl));
const neon = new pg.Pool(pgConfig(neonUrl));
try {
  await applyContent(local);
  console.log("Đã cập nhật PostgreSQL local");
  await syncMissingPages(local, neon);
  await applyContent(neon);
  console.log("Đã cập nhật Neon");
  await syncOffices(local, neon);
} finally {
  await local.end();
  await neon.end();
}
