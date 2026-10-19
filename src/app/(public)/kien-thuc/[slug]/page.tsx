import { redirect } from "next/navigation";

export default async function OldArticleRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/tin-tuc/${slug}`);
}
