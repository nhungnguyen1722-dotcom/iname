import { redirect } from "next/navigation";
import { renderContentPage } from "@/components/site/render-page";
import { canPreview } from "@/lib/content";
import { renderAccountingArticle } from "../../ke-toan/[slug]/page";
import { renderNewsArticle } from "../../tin-tuc/[slug]/page";

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  if (!(await canPreview())) redirect("/admin/login?next=/xem-truoc");
  const segments = (await params).path ?? [];
  if (segments[0] === "tin-tuc" && segments[1] && segments[1] !== "bo-loc") {
    return renderNewsArticle(segments[1], true);
  }
  if (segments[0] === "ke-toan" && segments[1]) {
    return renderAccountingArticle(segments[1], true);
  }
  const path = segments.length ? `/${segments.join("/")}` : "/";
  return renderContentPage(path, true);
}
