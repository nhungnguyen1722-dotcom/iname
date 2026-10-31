import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconMark } from "@/components/site/IconMark";
import { LocationGallery } from "@/components/site/LocationGallery";
import { SocialShareLinks } from "@/components/site/SocialLinks";
import { getOfficeLocationBySlug, getPublicChrome } from "@/lib/content";
import { sql } from "@/lib/db";
import { sanitizeRichText } from "@/lib/sanitize";
import { absoluteSiteUrl } from "@/lib/site-url";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const rows = await sql<{ slug: string }>(
      "SELECT slug FROM office_locations WHERE deleted_at IS NULL AND visible = TRUE AND status = 'published'",
    );
    return rows.map((row) => ({ slug: row.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const location = await getOfficeLocationBySlug(slug);
  if (!location) return { title: "Không tìm thấy văn phòng" };
  return {
    title: `${location.title} | Địa Chỉ Đăng Ký Kinh Doanh Uy Tín`,
    description: location.excerpt || location.address,
    alternates: { canonical: `/van-phong-ao/${location.slug}` },
    openGraph: {
      title: `${location.title} | iName Office`,
      description: location.excerpt || location.address,
      images: location.banner_url || location.cover_url ? [location.banner_url || location.cover_url || ""] : undefined,
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
  const shareUrl = absoluteSiteUrl(`/van-phong-ao/${location.slug}`);
  const rawContent = location.content || "";
  const isHtml = /<[a-z][\s\S]*>/i.test(rawContent);
  const paragraphs = rawContent.split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const slides = [
    ...(location.cover_url ? [{ url: location.cover_url, alt: location.cover_alt || location.title, caption: "" }] : []),
    ...location.gallery.filter((image) => image.url && image.url !== location.cover_url),
  ];

  return (
    <main className="flex-1">
      <section id="location-detail" className="section-shell scroll-mt-24 py-8 lg:py-12">
        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="min-w-0">
            {slides.length ? <LocationGallery title={location.title} images={slides} embedded /> : null}
          </div>
          <div className="min-w-0">
            <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">Trang chủ</Link>
              <span>›</span>
              <Link href="/van-phong-ao" className="hover:text-primary">Văn phòng ảo</Link>
              <span>›</span>
              <span className="font-semibold text-foreground">{location.title}</span>
            </nav>
            <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">{location.title}</h1>
            {location.excerpt ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{location.excerpt}</p> : null}
            <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-card">
              <p className="flex items-start gap-2 text-sm font-semibold text-primary sm:text-base">
                <IconMark name="pin" className="size-8 shrink-0 rounded [&_svg]:size-4" />
                <span>{location.address}</span>
              </p>
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mức giá tham khảo</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-primary">{location.price_label}</p>
              </div>
              {location.amenities.length ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">Tiện ích đi kèm tại chi nhánh:</p>
                  <ul className="flex flex-wrap gap-2">
                  {location.amenities.map((amenity) => (
                    <li key={amenity} className="inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary"><span aria-hidden="true">✓</span>{amenity}</li>
                  ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-10">
          {isHtml ? (
            <div className="prose-content max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeRichText(rawContent) }} />
          ) : paragraphs.length ? (
            <div className="space-y-4">
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">{paragraph}</p>
              ))}
            </div>
          ) : location.excerpt ? (
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{location.excerpt}</p>
          ) : null}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground"><span className="flex size-6 items-center justify-center rounded-md bg-primary-soft text-xs font-extrabold text-primary">1</span>Địa chỉ Quận 1 uy tín</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Nâng tầm định vị thương hiệu, tạo sự tin cậy khi giao dịch với đối tác, khách hàng và cơ quan thuế.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground"><span className="flex size-6 items-center justify-center rounded-md bg-primary-soft text-xs font-extrabold text-primary">2</span>Vị trí trung tâm thuận tiện</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Kết nối nhanh đến các quận trung tâm, thuận tiện di chuyển và đón tiếp đối tác.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground"><span className="flex size-6 items-center justify-center rounded-md bg-primary-soft text-xs font-extrabold text-primary">3</span>Lễ tân & Tiếp đón chuyên nghiệp</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Lễ tân tòa nhà đón tiếp, nhận thư từ, bưu phẩm và thông báo cho doanh nghiệp.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground"><span className="flex size-6 items-center justify-center rounded-md bg-primary-soft text-xs font-extrabold text-primary">4</span>Phòng họp & Sảnh tiếp khách</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Phòng họp có màn hình, Wi-Fi và khu vực tiếp khách.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/lien-he" className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Liên hệ đăng ký địa chỉ này</Link>
          <a href={chrome.settings.hotline_href} className="inline-flex h-11 items-center text-sm font-semibold text-primary hover:underline">Hotline tư vấn: {chrome.settings.hotline}</a>
          <div className="sm:ml-auto">
            <SocialShareLinks url={shareUrl} title={location.title} />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background py-14 lg:py-20">
        <div className="section-shell">
          <div className="mx-auto mb-8 max-w-4xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">Bản đồ & Chỉ đường</p>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Vị trí {location.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{location.address}</p>
          </div>
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <iframe title={`Bản đồ ${location.title}`} src={embedUrl} className="h-[280px] w-full border-0 sm:h-[450px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconMark name="pin" className="size-6 shrink-0 rounded [&_svg]:size-3.5" />
                <span className="font-medium text-foreground">{location.address}</span>
              </div>
              <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">Mở trong Google Maps →</a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-hero-gradient py-12 text-primary-foreground">
        <div className="section-shell max-w-3xl text-center">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Sẵn sàng đặt trụ sở tại {location.title.trim()}?</h2>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/85 sm:text-base">Chuyên viên iName sẽ xác nhận tình trạng chỗ trống, gửi báo giá và hỗ trợ soạn hợp đồng trong ngày.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/lien-he" className="inline-flex h-11 items-center justify-center rounded-lg bg-card px-6 text-sm font-bold text-primary shadow-card">Liên Hệ</Link>
            <a href={chrome.settings.hotline_href} className="inline-flex h-11 items-center justify-center rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-6 text-sm font-semibold text-primary-foreground">Gọi hotline: {chrome.settings.hotline}</a>
          </div>
        </div>
      </section>
    </main>
  );
}
