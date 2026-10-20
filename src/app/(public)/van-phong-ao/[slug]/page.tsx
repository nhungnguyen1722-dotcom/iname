import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsImage } from "@/components/site/CmsImage";
import { IconMark } from "@/components/site/IconMark";
import { getOfficeLocationBySlug, getPublicChrome } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const location = await getOfficeLocationBySlug(slug);
  if (!location) return { title: "Không tìm thấy văn phòng" };
  return {
    title: `${location.title} | Địa Chỉ Đăng Ký Kinh Doanh Uy Tín`,
    description: location.excerpt || location.address,
    alternates: { canonical: `/van-phong-ao/${location.slug}` },
    openGraph: {
      title: `${location.title} | Iname Office`,
      description: location.excerpt || location.address,
      images: location.cover_url ? [location.cover_url] : undefined,
    },
  };
}

export default async function OfficeLocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [location, chrome] = await Promise.all([
    getOfficeLocationBySlug(slug),
    getPublicChrome(),
  ]);

  if (!location) notFound();

  const mapQuery = encodeURIComponent(location.address);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const embedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const paragraphs = (location.content || "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <main className="flex-1">
      {/* 1. TOP BANNER - Hero Banner lớn hiển thị tên chi nhánh, breadcrumbs và đoạn mô tả chuyên nghiệp */}
      <header className="relative isolate overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/95 via-primary/90 to-primary/60" />
        <div className="bg-mesh pointer-events-none absolute inset-0 opacity-40" />

        <div className="section-shell py-14 sm:py-16 lg:py-20">
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-primary-foreground/75" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary-foreground transition-colors">Trang chủ</Link>
            <span>›</span>
            <Link href="/van-phong-ao" className="hover:text-primary-foreground transition-colors">Văn phòng ảo</Link>
            <span>›</span>
            <span className="font-semibold text-primary-foreground">{location.title}</span>
          </nav>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-200">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Chi nhánh Quận 1 · Vị trí chiến lược
          </div>

          <h1 className="max-w-4xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {location.title}
          </h1>

          {location.excerpt ? (
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
              {location.excerpt}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-primary-foreground/80">
            <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <IconMark name="pin" className="size-5 rounded shrink-0 [&_svg]:size-3.5" />
              <span>{location.address}</span>
            </span>
            <span className="font-display font-extrabold text-amber-300">
              {location.price_label}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/lien-he" className="inline-flex h-11 items-center justify-center rounded-lg bg-accent px-6 text-sm font-bold text-accent-foreground shadow-glow hover:bg-accent/90 transition-all">
              Nhận tư vấn & Báo giá miễn phí
            </Link>
            <Link href="/bang-gia" className="inline-flex h-11 items-center justify-center rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/20 transition-all">
              Xem bảng giá dịch vụ →
            </Link>
          </div>
        </div>
      </header>

      {/* 2. NỘI DUNG & HÌNH ẢNH CHI TIẾT - Ảnh đại diện bên trái kết hợp văn bản chi tiết về vị trí & ưu thế giao dịch */}
      <section className="section-shell py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Ảnh đại diện bên trái */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card shadow-card sm:aspect-[5/4]">
              {location.cover_url ? (
                <CmsImage
                  src={location.cover_url}
                  alt={location.cover_alt || location.title}
                  className="object-cover"
                  sizes="(min-width: 1024px) 40vw, 95vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                  Hình ảnh địa điểm sẽ được cập nhật.
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-card/90 p-3 shadow-elegant backdrop-blur">
                <p className="text-xs font-semibold text-muted-foreground">Địa chỉ trụ sở chính thức</p>
                <p className="font-semibold text-sm text-foreground truncate">{location.address}</p>
              </div>
            </div>

            {/* Khối tiện ích và giá */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mức giá tham khảo</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-primary">{location.price_label}</p>
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Tiện ích đi kèm tại chi nhánh:</p>
                <ul className="flex flex-wrap gap-2">
                  {location.amenities.map((amenity) => (
                    <li key={amenity} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                      ✓ {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Khối nội dung văn bản giới thiệu chi tiết về vị trí địa lý & ưu thế giao dịch */}
          <div className="lg:col-span-7">
            <div className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent mb-3">
              Vị trí địa lý & Ưu thế giao dịch
            </div>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl text-foreground">
              Giới thiệu {location.title}
            </h2>
            <p className="mt-3 text-sm font-semibold text-primary flex items-center gap-2">
              <IconMark name="pin" className="size-6 rounded shrink-0 [&_svg]:size-3.5" />
              <span>{location.address}</span>
            </p>

            {/* Các đoạn văn bản giới thiệu */}
            <div className="mt-6 space-y-4">
              {paragraphs.length ? (
                paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line sm:text-base">
                    {paragraph}
                  </p>
                ))
              ) : location.excerpt ? (
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {location.excerpt}
                </p>
              ) : null}
            </div>

            {/* 4 khối ưu thế giao dịch nổi bật */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="size-6 rounded-md bg-primary-soft text-primary flex items-center justify-center text-xs font-extrabold">1</span>
                  Địa chỉ Quận 1 uy tín
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Nâng tầm định vị thương hiệu, tạo sự tin cậy tuyệt đối khi giao dịch với đối tác, khách hàng và cơ quan thuế.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="size-6 rounded-md bg-primary-soft text-primary flex items-center justify-center text-xs font-extrabold">2</span>
                  Vị trí trung tâm thuận tiện
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Kết nối nhanh chóng đến các quận trung tâm lân cận, thuận tiện di chuyển và đón tiếp đối tác.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="size-6 rounded-md bg-primary-soft text-primary flex items-center justify-center text-xs font-extrabold">3</span>
                  Lễ tân & Tiếp đón chuyên nghiệp
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Đội ngũ lễ tân tòa nhà đón tiếp chu đáo, nhận thư từ, bưu phẩm và thông báo ngay cho doanh nghiệp.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="size-6 rounded-md bg-primary-soft text-primary flex items-center justify-center text-xs font-extrabold">4</span>
                  Phòng họp & Sảnh tiếp khách
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Trang bị đầy đủ phòng họp hiện đại màn hình lớn, Wi-Fi tốc độ cao và khu vực tiếp khách lịch sự.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/lien-he" className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Liên hệ đăng ký địa chỉ này
              </Link>
              <a href={chrome.settings.hotline_href} className="inline-flex h-11 items-center text-sm font-semibold text-primary hover:underline">
                Hotline tư vấn: {chrome.settings.hotline}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BỘ SƯU TẬP HÌNH ẢNH THỰC TẾ ĐA GÓC CHỤP (Tối thiểu 6 ảnh, hiển thị PHÍA TRÊN section Bản đồ) */}
      {location.gallery.length >= 6 ? (
        <section className="border-t border-border bg-secondary/35 py-14 lg:py-20">
          <div className="section-shell">
            <div className="max-w-3xl mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">Bộ sưu tập hình ảnh thực tế</p>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl text-foreground">
                Không gian văn phòng & Tiện ích tại {location.title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Đa góc chụp thực tế: không gian làm việc chung, quầy lễ tân đón tiếp, phòng họp hội nghị, bảng tên công ty, sảnh tiếp khách và tiện ích văn phòng.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {location.gallery.map((image, index) => (
                <figure key={`${image.url}-${index}`} className="group overflow-hidden rounded-xl border border-border bg-card shadow-card hover:shadow-glow transition-all">
                  <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
                    <CmsImage
                      src={image.url}
                      alt={image.alt || `${location.title} - hình ${index + 1}`}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 95vw"
                    />
                  </div>
                  {image.caption ? (
                    <figcaption className="p-3.5 text-xs font-medium text-muted-foreground border-t border-border bg-card">
                      {image.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 4. SECTION BẢN ĐỒ & CHỈ ĐƯỜNG */}
      <section className="border-t border-border bg-background py-14 lg:py-20">
        <div className="section-shell">
          <div className="mx-auto max-w-4xl text-center mb-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">Bản đồ & Chỉ đường</p>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Vị trí {location.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{location.address}</p>
          </div>

          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <iframe
              title={`Bản đồ ${location.title}`}
              src={embedUrl}
              className="h-[380px] w-full border-0 sm:h-[450px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 text-sm bg-card">
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconMark name="pin" className="size-6 rounded shrink-0 [&_svg]:size-3.5" />
                <span className="font-medium text-foreground">{location.address}</span>
              </div>
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
              >
                Mở trong Google Maps →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION - Đăng ký tư vấn trực tiếp */}
      <section className="border-t border-border bg-hero-gradient py-12 text-primary-foreground">
        <div className="section-shell text-center max-w-3xl">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
            Sẵn sàng đặt trụ sở tại {location.title}?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
            Chuyên viên Iname sẽ xác nhận tình trạng chỗ trống, gửi bảng báo giá chi tiết và hỗ trợ soạn thảo hợp đồng trong ngày.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/lien-he" className="inline-flex h-11 items-center justify-center rounded-lg bg-card px-6 text-sm font-bold text-primary shadow-card hover:bg-card/90 transition-all">
              Đăng ký nhận báo giá ngay
            </Link>
            <a href={chrome.settings.hotline_href} className="inline-flex h-11 items-center justify-center rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/20 transition-all">
              Gọi hotline: {chrome.settings.hotline}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
