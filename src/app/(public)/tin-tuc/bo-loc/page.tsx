import type { Metadata } from "next";
import { renderContentPage } from "@/components/site/render-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function FilteredNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const query = await searchParams;
  return renderContentPage("/tin-tuc", false, query);
}
