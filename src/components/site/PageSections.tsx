import Link from "next/link";
import { CmsImage } from "./CmsImage";
import { ConsultButton } from "./ConsultProvider";
import { FaqList } from "./FaqList";
import { PricingBlock } from "./PricingBlock";
import { ContactForm } from "./ContactForm";
import { IconMark } from "./IconMark";
import { TestimonialCarousel } from "./TestimonialCarousel";
import type { ArticleCard, FooterGroup, Office, PricingPlan, PublicSection, ServiceRecord } from "@/lib/content";

const primaryButton = "inline-flex h-11 items-center justify-center rounded-md bg-background px-6 text-base font-semibold text-foreground shadow-elegant hover:bg-background/90";
const accentButton = "inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-base font-semibold text-accent-foreground shadow-card hover:bg-accent/90";
const ghostOnDark = "inline-flex h-11 items-center justify-center rounded-md border border-primary-foreground/35 bg-primary-foreground/10 px-6 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/20";
const outlineButton = "inline-flex h-11 items-center justify-center rounded-md border border-primary/25 bg-card px-6 text-base font-semibold shadow-card hover:bg-primary-soft";

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function list(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function Cta({
  label,
  href,
  variant,
}: {
  label?: string | null;
  href?: string | null;
  variant: "light" | "accent" | "ghost" | "outline";
}) {
  if (!label) return null;
  const className = variant === "light" ? primaryButton : variant === "accent" ? accentButton : variant === "ghost" ? ghostOnDark : outlineButton;
  if (!href || href === "#tu-van") return <ConsultButton label={label} className={className} />;
  return <Link href={href} className={className}>{label}</Link>;
}

export function PageSections({
  sections,
  services,
  plans,
  settings,
  offices,
  articles,
  categories,
  popularArticles,
  query,
}: {
  sections: PublicSection[];
  services: ServiceRecord[];
  plans: PricingPlan[];
  settings: Record<string, string>;
  offices: Office[];
  articles?: {
    items: ArticleCard[];
    total: number;
    page: number;
    pages: number;
  };
  categories?: { name: string; slug: string }[];
  popularArticles?: ArticleCard[];
  query?: { q?: string; category?: string };
}) {
  return (
    <main className="flex-1">
      {sections.map((section) => {
        if (section.section_type === "hero") return <Hero key={section.id} section={section} />;
        if (section.section_type === "page-hero") return <PageHero key={section.id} section={section} />;
        if (section.section_type === "pillars") return <Pillars key={section.id} section={section} />;
        if (section.section_type === "cards") return <Cards key={section.id} section={section} services={services} />;
        if (section.section_type === "steps") return <Steps key={section.id} section={section} />;
        if (section.section_type === "pricing") return <PricingSection key={section.id} section={section} plans={plans} />;
        if (section.section_type === "team") return <Team key={section.id} section={section} />;
        if (section.section_type === "testimonials") return <Testimonials key={section.id} section={section} />;
        if (section.section_type === "faq") return <Faq key={section.id} section={section} settings={settings} />;
        if (section.section_type === "cta") return <CtaBand key={section.id} section={section} />;
        if (section.section_type === "media") return <MediaSplit key={section.id} section={section} />;
        if (section.section_type === "gallery") return <Gallery key={section.id} section={section} />;
        if (section.section_type === "comparison") return <Comparison key={section.id} section={section} />;
        if (section.section_type === "stats") return <Stats key={section.id} section={section} />;
        if (section.section_type === "addons") return <Addons key={section.id} section={section} />;
        if (section.section_type === "notes") return <Notes key={section.id} section={section} />;
        if (section.section_type === "articles") return <ArticleList key={section.id} articles={articles} categories={categories || []} query={query} popularArticles={popularArticles || []} />;
        if (section.section_type === "contact") return <ContactSection key={section.id} section={section} settings={settings} offices={offices} plans={plans} />;
        return null;
      })}
    </main>
  );
}

function Heading({ section, light = false }: { section: PublicSection; light?: boolean }) {
  return (
    <div className="max-w-3xl">
      {section.eyebrow ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-accent">{section.eyebrow}</p> : null}
      {section.title ? <h2 className={`font-display text-2xl font-extrabold sm:text-3xl lg:text-4xl ${light ? "text-primary-foreground" : ""}`}>{section.title}</h2> : null}
      {section.description ? <p className={`mt-4 text-base leading-relaxed sm:text-lg ${light ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{section.description}</p> : null}
    </div>
  );
}

function Hero({ section }: { section: PublicSection }) {
  const stats = Array.isArray(section.config.stats) ? section.config.stats as { value?: string; label?: string }[] : [];
  const floats = Array.isArray(section.config.floatCards) ? section.config.floatCards as { title?: string; value?: string; note?: string }[] : [];
  return (
    <section className="bg-hero-gradient relative overflow-hidden">
      <div className="bg-mesh pointer-events-none absolute inset-0 opacity-70" />
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.12]" />
      <div className="section-shell relative grid gap-12 py-12 lg:grid-cols-12 lg:items-center lg:py-20">
        <div className="lg:col-span-7">
          {section.eyebrow ? <div className="inline-flex rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">{section.eyebrow}</div> : null}
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-[1.12] text-primary-foreground sm:text-4xl lg:text-5xl">{section.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">{section.description}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {section.items.map((item) => (
              <li key={text(item.label)} className="rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-2.5 py-0.5 text-xs font-medium text-primary-foreground">✓ {text(item.label)}</li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Cta label={section.button_label} href={section.button_url} variant="light" />
            <Cta label={section.secondary_button_label} href={section.secondary_button_url} variant="ghost" />
          </div>
          {stats.length ? (
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-primary-foreground/15 pt-8 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-2xl font-extrabold text-primary-foreground sm:text-3xl">{stat.value}</dt>
                  <dd className="text-sm text-primary-foreground/70">{stat.label}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        <div className="relative lg:col-span-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-glow lg:aspect-[5/4]">
            <CmsImage src={section.image_url} alt={section.image_alt || section.title || ""} priority sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
          {floats[0]?.value ? (
            <div className="animate-float absolute -left-3 top-6 hidden w-44 rounded-xl border border-border bg-card/95 p-3 shadow-elegant sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{floats[0].title}</p>
              <p className="font-display text-lg font-extrabold text-accent">{floats[0].value}</p>
              <p className="text-[11px] text-muted-foreground">{floats[0].note}</p>
            </div>
          ) : null}
          {floats[1]?.value ? (
            <div className="animate-float absolute -right-2 bottom-6 hidden w-44 rounded-xl border border-border bg-card/95 p-3 shadow-elegant sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{floats[1].title}</p>
              <p className="font-display text-lg font-extrabold text-primary">{floats[1].value}</p>
              <p className="text-[11px] text-muted-foreground">{floats[1].note}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function PageHero({ section }: { section: PublicSection }) {
  const configuredIcon = text(section.config.icon);
  const title = section.title || "";
  const icon = configuredIcon || (/kế toán/i.test(title) ? "calculator" : /giá/i.test(title) ? "wallet" : /tin tức|kiến thức/i.test(title) ? "file" : "building");
  return (
    <section className="relative overflow-hidden border-b border-border bg-subtle-gradient">
      {section.image_url ? <div className="absolute inset-0 opacity-20"><CmsImage src={section.image_url} alt="" className="object-cover" sizes="100vw" /></div> : null}
      <div className="bg-mesh pointer-events-none absolute inset-0 opacity-90" />
      <div className="section-shell relative py-14 sm:py-16 lg:py-20">
        {section.eyebrow ? <div className="mb-4 inline-flex rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">{section.eyebrow}</div> : null}
        <IconMark name={icon} className="mb-4 size-14" />
        <h1 className="max-w-4xl font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl">{section.title}</h1>
        {section.description ? <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">{section.description}</p> : null}
        {section.items.length ? (
          <ul className="mt-6 flex flex-wrap gap-2">
            {section.items.map((item) => (
              <li key={text(item.label)} className="rounded-full border border-primary/20 bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{text(item.label)}</li>
            ))}
          </ul>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Cta label={section.button_label} href={section.button_url} variant="accent" />
          <Cta label={section.secondary_button_label} href={section.secondary_button_url} variant="outline" />
        </div>
      </div>
    </section>
  );
}

function Pillars({ section }: { section: PublicSection }) {
  return (
    <section className="section-shell py-16 lg:py-20">
      <Heading section={section} />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {section.items.map((item) => (
          <article key={text(item.title)} className="hover-lift rounded-2xl border border-border bg-card p-7 shadow-card">
            <IconMark name={text(item.icon) || "building"} className="mb-5" />
            <h3 className="font-display text-2xl font-bold">{text(item.title)}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text(item.description)}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {list(item.points).map((point) => <li key={point}>✓ {point}</li>)}
            </ul>
            {text(item.href) ? <Link href={text(item.href)} className="mt-6 inline-flex text-sm font-semibold text-primary">{text(item.cta) || "Xem chi tiết"}</Link> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function Cards({ section, services }: { section: PublicSection; services: ServiceRecord[] }) {
  const source = text(section.config.source);
  const category = text(section.config.category);
  const items = source === "services"
    ? services.filter((service) => !category || service.category === category).map((service) => ({
        title: service.name,
        description: service.summary || "",
        href: service.button_url || "",
        cta: service.button_label || "",
        icon: service.icon || "file",
      }))
    : section.items;
  const columns = Number(section.config.columns || 3);
  const grid = columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : columns === 2 ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  const soft = section.config.tone === "soft";
  return (
    <section className={soft ? "border-y border-border bg-subtle-gradient" : ""}>
      <div className="section-shell py-16 lg:py-20">
        <Heading section={section} />
        <div className={`mt-10 grid gap-5 ${grid}`}>
          {items.map((item, index) => (
            <article key={text(item.title)} className="hover-lift rounded-xl border border-border bg-card p-6 shadow-card">
              <IconMark name={text(item.icon) || ["pin", "building", "monitor", "mail", "message", "file", "calculator"][index % 7]} className="mb-4" />
              <h3 className="font-display text-lg font-bold">{text(item.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text(item.description)}</p>
              {text(item.href) ? <Link href={text(item.href)} className="mt-4 inline-flex text-sm font-semibold text-primary">{text(item.cta) || "Xem chi tiết"}</Link> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Steps({ section }: { section: PublicSection }) {
  const soft = section.config.tone === "soft";
  return (
    <section className={soft ? "border-y border-border bg-secondary/40" : ""}>
      <div className="section-shell py-16 lg:py-20">
        <Heading section={section} />
        <ol className="process-track mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item, index) => (
            <li key={text(item.title)} className="relative text-center">
              <span className={`relative z-10 mx-auto flex size-14 items-center justify-center rounded-full font-display text-lg font-extrabold text-primary-foreground shadow-card ${index === 0 ? "bg-red-500" : "bg-primary"}`}>{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 font-display text-lg font-bold">{text(item.title)}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{text(item.description)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PricingSection({ section, plans }: { section: PublicSection; plans: PricingPlan[] }) {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="section-shell py-16 lg:py-20">
        <Heading section={section} />
        <div className="mt-8">
          <PricingBlock plans={plans} mode={text(section.config.mode) || "stacked"} note={text(section.config.note)} subtitles={{ office: text(section.config.officeSubtitle), accounting: text(section.config.accountingSubtitle) }} />
        </div>
        {section.button_label ? (
          <div className="mt-8">
            <Cta label={section.button_label} href={section.button_url} variant="outline" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Team({ section }: { section: PublicSection }) {
  const soft = section.config.tone === "soft";
  return (
    <section className={soft ? "border-y border-border bg-secondary/40" : ""}>
      <div className="section-shell py-16 lg:py-20">
        <Heading section={section} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item) => (
            <article key={text(item.name)} className="hover-lift rounded-xl border border-border bg-card p-6 text-center shadow-card">
              <span className="bg-primary-gradient mx-auto flex size-16 items-center justify-center rounded-full font-display text-lg font-extrabold text-primary-foreground">{text(item.initials)}</span>
              <h3 className="mt-4 font-display text-base font-bold">{text(item.name)}</h3>
              <p className="mt-1 text-sm font-semibold text-accent">{text(item.role)}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text(item.credential)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ section }: { section: PublicSection }) {
  return (
    <section className="border-y border-border bg-subtle-gradient">
      <div className="section-shell py-16 lg:py-20">
        <div className="max-w-3xl">
          {section.eyebrow ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-accent">{section.eyebrow}</p> : null}
          {section.title ? <h2 className="font-display text-2xl font-extrabold sm:text-3xl lg:text-4xl">{section.title}</h2> : null}
        </div>
        <TestimonialCarousel items={section.items.map((item) => ({ quote: text(item.quote), author: text(item.author), company: text(item.company), avatar: text(item.avatar), rating: Number(item.rating || 5) }))} />
        {section.description ? <p className="mt-8 text-center text-sm font-medium text-muted-foreground">{section.description}</p> : null}
      </div>
    </section>
  );
}

function Faq({ section, settings }: { section: PublicSection; settings: Record<string, string> }) {
  return (
    <section className="section-shell py-16 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Heading section={section} />
          <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Chưa tìm thấy câu trả lời bạn cần? Gọi hotline hoặc gửi yêu cầu tư vấn.</p>
            <div className="mt-4 flex flex-col gap-2">
              <a href={settings.hotline_href} className="inline-flex h-10 items-center justify-center rounded-md border border-primary/25 text-sm font-semibold">{settings.hotline}</a>
              <Cta label={section.button_label} href={section.button_url} variant="accent" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-8">
          <FaqList items={section.items} />
        </div>
      </div>
    </section>
  );
}

function CtaBand({ section }: { section: PublicSection }) {
  return (
    <section className="section-shell py-16 lg:py-20">
      <div className="bg-hero-gradient relative overflow-hidden rounded-2xl px-6 py-12 shadow-elegant sm:px-10 lg:px-14">
        <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <h2 className="font-display text-2xl font-extrabold text-primary-foreground sm:text-3xl lg:text-4xl">{section.title}</h2>
            <p className="mt-4 max-w-2xl text-base text-primary-foreground/80">{section.description}</p>
          </div>
          <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
            <Cta label={section.button_label} href={section.button_url} variant="light" />
            <Cta label={section.secondary_button_label} href={section.secondary_button_url} variant="ghost" />
            {text(section.config.note) ? <p className="text-xs text-primary-foreground/70">{text(section.config.note)}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function MediaSplit({ section }: { section: PublicSection }) {
  const imageFirst = section.config.imageSide === "left";
  const image = (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-elegant">
      <CmsImage src={section.image_url} alt={section.image_alt || section.title || ""} sizes="(min-width: 1024px) 50vw, 100vw" />
    </div>
  );
  const copy = (
    <div>
      <Heading section={section} />
      {section.config.list ? (
        <ul className="mt-8 space-y-5">
          {section.items.map((item) => (
            <li key={text(item.title)} className="flex items-start gap-3">
              <IconMark name={text(item.icon) || "badge"} className="size-10 rounded-lg" />
              <div><h3 className="font-display text-base font-bold">{text(item.title)}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text(item.description)}</p></div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
  return (
    <section className="section-shell grid gap-10 py-16 lg:grid-cols-12 lg:items-center lg:py-20">
      <div className="lg:col-span-6">{imageFirst ? image : copy}</div>
      <div className="lg:col-span-6">{imageFirst ? copy : image}</div>
    </section>
  );
}

function Gallery({ section }: { section: PublicSection }) {
  return (
    <section className="bg-hero-gradient relative overflow-hidden">
      <div className="section-shell relative py-16 lg:py-20">
        <Heading section={section} light />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {section.gallery.map((image, index) => (
            <figure key={`${image.url}-${index}`} className="overflow-hidden rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5">
              <div className="relative aspect-[16/10]">
                <CmsImage src={image.url} alt={image.alt || image.caption || `Ảnh ${index + 1}`} sizes="(min-width: 640px) 50vw, 100vw" />
              </div>
              {image.caption ? <figcaption className="px-5 py-4 text-sm font-medium text-primary-foreground/85">{image.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comparison({ section }: { section: PublicSection }) {
  const headers = Array.isArray(section.config.headers) ? section.config.headers.map((item) => String(item)) : [];
  return (
    <section className="section-shell py-16 lg:py-20">
      <Heading section={section} />
      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full min-w-[640px] text-sm">
          {headers.length ? (
            <thead className="bg-secondary/60">
              <tr>
                {headers.map((header) => <th key={header} className="px-4 py-3 text-left font-display font-bold">{header}</th>)}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {section.items.map((item) => (
              <tr key={text(item.label)} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{text(item.label)}</td>
                {list(item.values).map((value, index) => <td key={`${text(item.label)}-${index}`} className="px-4 py-3 text-muted-foreground">{value}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Stats({ section }: { section: PublicSection }) {
  return (
    <section className="section-shell py-10">
      <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {section.items.map((item) => (
          <div key={text(item.label)} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <dt className="font-display text-2xl font-extrabold text-primary">{text(item.value)}</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{text(item.label)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Addons({ section }: { section: PublicSection }) {
  return (
    <section className="section-shell py-16">
      <Heading section={section} />
      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {section.items.map((item) => (
          <div key={text(item.name)} className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0">
            <p className="text-sm font-medium">{text(item.name)}</p>
            <p className="shrink-0 font-display font-bold">{text(item.price)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Notes({ section }: { section: PublicSection }) {
  return (
    <section className="border-y border-border bg-secondary/50 py-12">
      <div className="section-shell rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <h2 className="flex items-center gap-2 font-display text-xl font-extrabold"><span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-primary">i</span>{section.title}</h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
          {section.items.map((item) => <li key={text(item.text)} className="flex gap-2"><span className="font-bold text-accent">•</span><span>{text(item.text)}</span></li>)}
        </ul>
      </div>
    </section>
  );
}

function ArticleList({
  articles,
  categories,
  query,
  popularArticles,
}: {
  articles?: { items: ArticleCard[]; total: number; page: number; pages: number };
  categories: { name: string; slug: string }[];
  query?: { q?: string; category?: string };
  popularArticles: ArticleCard[];
}) {
  if (!articles) return null;
  const category = query?.category || "all";
  return (
    <section className="section-shell py-10 lg:py-14">
      <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"><Link href="/">Trang chủ</Link><span>›</span><span className="font-semibold text-foreground">Tin tức</span></div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <form className="flex flex-col gap-3 sm:flex-row" action="/tin-tuc">
            <input name="q" defaultValue={query?.q || ""} placeholder="Tìm bài viết..." className="h-11 flex-1 rounded-lg border border-border bg-card px-3" />
            {category !== "all" ? <input type="hidden" name="category" value={category} /> : null}
            <button className="h-11 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground" type="submit">Tìm</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/tin-tuc" className={`rounded-full px-3 py-1 text-xs ${category === "all" ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>Tất cả</Link>
            {categories.map((item) => (
              <Link key={item.slug} href={`/tin-tuc?category=${item.slug}`} className={`rounded-full px-3 py-1 text-xs ${category === item.slug ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>{item.name}</Link>
            ))}
          </div>
          {articles.items.length === 0 ? <p className="mt-10 text-muted-foreground">Chưa có bài viết phù hợp.</p> : null}
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {articles.items.map((article) => (
              <article key={article.id} className="hover-lift flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
                <Link href={`/tin-tuc/${article.slug}`} aria-label={article.title} className="relative block aspect-[16/9] bg-secondary">
                  {article.cover_url ? <CmsImage src={article.cover_url} alt={article.cover_alt || article.title} className="object-cover" sizes="(min-width: 1024px) 30vw, 90vw" /> : <span className="absolute inset-0 bg-mesh" />}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">{article.category_name}</p>
                  <h2 className="mt-2 font-display text-lg font-bold"><Link href={`/tin-tuc/${article.slug}`}>{article.title}</Link></h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
                  <p className="mt-4 text-xs text-muted-foreground">{article.published_at ? new Date(article.published_at).toLocaleDateString("vi-VN") : ""} · {article.read_minutes || 0} phút đọc</p>
                  <Link href={`/tin-tuc/${article.slug}`} className="mt-3 text-sm font-semibold text-primary">Đọc thêm →</Link>
                </div>
              </article>
            ))}
          </div>
          {articles.pages > 1 ? (
            <div className="mt-8 flex gap-2">
              {Array.from({ length: articles.pages }, (_, index) => {
                const page = index + 1;
                const params = new URLSearchParams();
                if (query?.q) params.set("q", query.q);
                if (category !== "all") params.set("category", category);
                if (page > 1) params.set("page", String(page));
                return <Link key={page} href={`/tin-tuc?${params.toString()}`} className={`rounded-md px-3 py-1 text-sm ${page === articles.page ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{page}</Link>;
              })}
            </div>
          ) : null}
        </div>
        <aside className="space-y-5">
          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display font-bold">Bài viết phổ biến</h2>
            <ul className="mt-3 space-y-3">{popularArticles.map((article) => <li key={article.id} className="border-b border-border pb-3 last:border-0 last:pb-0"><Link href={`/tin-tuc/${article.slug}`} className="text-sm font-semibold leading-relaxed hover:text-primary">{article.title}</Link><span className="mt-1 block text-xs text-muted-foreground">{article.category_name}</span></li>)}</ul>
          </section>
          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display font-bold">Chuyên mục</h2>
            <ul className="mt-3 space-y-2">{categories.map((item) => <li key={item.slug}><Link href={`/tin-tuc?category=${item.slug}`} className="text-sm text-muted-foreground hover:text-primary">{item.name}</Link></li>)}</ul>
          </section>
        </aside>
      </div>
    </section>
  );
}

function ContactSection({
  section,
  settings,
  offices,
  plans,
}: {
  section: PublicSection;
  settings: Record<string, string>;
  offices: Office[];
  plans: PricingPlan[];
}) {
  return (
    <section className="section-shell grid gap-6 py-12 lg:grid-cols-12">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-7">
        <h2 className="font-display text-2xl font-extrabold">{section.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
        <div className="mt-6">
          <ContactForm settings={settings} plans={plans} sourcePath="/lien-he" />
        </div>
      </div>
      <div className="space-y-4 lg:col-span-5">
        <InfoCard title={text(section.config.infoTitle) || "Thông tin liên hệ"}>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Hotline</p>
          <a href={settings.hotline_href} className="font-display text-xl font-extrabold">{settings.hotline}</a>
          <p className="text-xs text-muted-foreground">{text(section.config.hotlineNote)}</p>
          <p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">Email</p>
          <a href={settings.email_href} className="font-semibold">{settings.email}</a>
          <p className="text-xs text-muted-foreground">{text(section.config.emailNote)}</p>
          <p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">Zalo</p>
          <a href={settings.zalo_url} className="font-semibold" target="_blank" rel="noopener noreferrer">{settings.zalo_label}</a>
          <p className="text-xs text-muted-foreground">{text(section.config.zaloNote)}</p>
        </InfoCard>
        <InfoCard title={text(section.config.hoursTitle) || "Khung giờ hỗ trợ"}>
          <p className="flex justify-between gap-4 text-sm"><span>{settings.hours_weekday_label}</span><span>{settings.hours_weekday}</span></p>
          <p className="mt-2 flex justify-between gap-4 text-sm"><span>{settings.hours_saturday_label}</span><span>{settings.hours_saturday}</span></p>
          <p className="mt-2 text-sm text-muted-foreground">{settings.hours_sunday_label}: {settings.hours_sunday}</p>
        </InfoCard>
        <InfoCard title={text(section.config.branchesTitle) || "Văn phòng"}>
          <p className="text-sm text-muted-foreground">{text(section.config.branchesSubtitle)}</p>
          <ul className="mt-4 space-y-4">
            {offices.map((office) => (
              <li key={office.id}>
                <p className="font-semibold">{office.label}</p>
                <p className="text-sm text-muted-foreground">{office.address}</p>
                <a href={office.phoneHref} className="text-sm">Hotline: {office.phone}</a>
                {office.mapUrl ? <a href={office.mapUrl} className="mt-1 block text-sm font-semibold text-primary" target="_blank" rel="noopener noreferrer">Xem đường đi</a> : null}
              </li>
            ))}
          </ul>
        </InfoCard>
      </div>
    </section>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
