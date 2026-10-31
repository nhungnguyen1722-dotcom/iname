import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ConsultProvider } from "@/components/site/ConsultProvider";
import { StickyContactWidget } from "@/components/site/StickyContactWidget";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { getPopularArticles, getPublicChrome, officesFromSettings } from "@/lib/content";

export const revalidate = 60;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [{ settings, navigation, groups, plans }, searchSuggestions] = await Promise.all([
    getPublicChrome(),
    getPopularArticles(),
  ]);
  const offices = officesFromSettings(settings);
  return (
    <ConsultProvider settings={settings} plans={plans}>
      <div className="flex min-h-screen flex-col">
        <Header settings={settings} navigation={navigation} searchSuggestions={searchSuggestions} />
        <ScrollReveal />
        {children}
        <Footer settings={settings} groups={groups} offices={offices} />
        <StickyContactWidget settings={settings} />
      </div>
    </ConsultProvider>
  );
}
