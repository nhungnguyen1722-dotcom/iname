import { Fragment } from "react";
import type { ArticleCard, Office, OfficeLocation, PricingPlan, PublicSection, ServiceRecord } from "@/lib/content";
import {
  OfficeLocationsSection,
  Hero,
  PageHero,
  Pillars,
  Cards,
  TechnologyStack,
  Steps,
  PricingSection,
  Team,
  Testimonials,
  Faq,
  CtaBand,
  MediaSplit,
  Gallery,
  Comparison,
  Stats,
  Addons,
  Notes,
  ArticleList,
  ContactSection,
} from "./sections/blocks";

export function PageSections({
  sections,
  services,
  plans,
  settings,
  offices,
  officeLocations,
  path,
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
  officeLocations: OfficeLocation[];
  path: string;
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
        const renderedSection = section.section_type === "hero" ? <Hero key={section.id} section={section} />
          : section.section_type === "page-hero" ? <PageHero key={section.id} section={section} showImage={path === "/" || path === "/van-phong-ao"} />
          : section.section_type === "pillars" ? <Pillars key={section.id} section={section} />
          : section.section_type === "cards" ? <Cards key={section.id} section={section} services={services} />
          : section.section_type === "technology-stack" ? <TechnologyStack key={section.id} section={section} />
          : section.section_type === "steps" ? <Steps key={section.id} section={section} />
          : section.section_type === "pricing" ? <PricingSection key={section.id} section={section} plans={plans} />
          : section.section_type === "team" ? <Team key={section.id} section={section} />
          : section.section_type === "testimonials" ? <Testimonials key={section.id} section={section} />
          : section.section_type === "faq" ? <Faq key={section.id} section={section} settings={settings} />
          : section.section_type === "cta" ? <CtaBand key={section.id} section={section} />
          : section.section_type === "media" ? <MediaSplit key={section.id} section={section} />
          : section.section_type === "gallery" ? <Gallery key={section.id} section={section} />
          : section.section_type === "comparison" ? <Comparison key={section.id} section={section} />
          : section.section_type === "stats" ? <Stats key={section.id} section={section} />
          : section.section_type === "addons" ? <Addons key={section.id} section={section} />
          : section.section_type === "notes" ? <Notes key={section.id} section={section} />
          : section.section_type === "articles" ? <ArticleList key={section.id} articles={articles} categories={categories || []} query={query} popularArticles={popularArticles || []} />
          : section.section_type === "contact" ? <ContactSection key={section.id} section={section} settings={settings} offices={offices} plans={plans} />
          : null;
        return (
          <Fragment key={section.id}>
            {renderedSection}
            {path === "/van-phong-ao" && section.section_key === "vo-services" && officeLocations.length
              ? <OfficeLocationsSection locations={officeLocations} />
              : null}
          </Fragment>
        );
      })}
    </main>
  );
}
